import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  // Placeholder JWT logic (Sprint 1): keep shape for backend integration later.
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

