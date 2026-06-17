import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

type AuthFailureHandler = () => void

let onAuthFailure: AuthFailureHandler = () => {
  clearAccessToken()
}

export function registerAuthFailureHandler(handler: AuthFailureHandler): void {
  onAuthFailure = handler
}

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processRefreshQueue(error: unknown, token: string | null = null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  refreshQueue = []
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return url.includes('/api/auth/login') || url.includes('/api/auth/refresh')
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await api.post<{ accessToken: string }>('/api/auth/refresh')
      const newToken = data.accessToken
      setAccessToken(newToken)
      processRefreshQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processRefreshQueue(refreshError, null)
      onAuthFailure()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
