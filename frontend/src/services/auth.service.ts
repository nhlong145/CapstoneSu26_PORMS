import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  SessionInfo,
  UserProfile,
} from '@/types/auth.types'
import { normalizeUserRole } from '@/types/auth.types'
import {
  createDevTestLoginResponse,
  isDevTestCredentials,
  isDevTestUserEmail,
} from '@/mocks/devTestAccount'
import { api } from './api'

const USER_SESSION_KEY = 'porms_user_profile'

function mapLoginUser(raw: Partial<UserProfile> & { role: string }): UserProfile {
  return {
    id: raw.id ?? '',
    email: raw.email ?? '',
    fullName: raw.fullName ?? '',
    role: normalizeUserRole(raw.role),
    status: raw.status ?? 'ACTIVE',
    assignedPortId: raw.assignedPortId ?? null,
    assignedPortName: raw.assignedPortName ?? null,
    phoneNumber: raw.phoneNumber ?? null,
    lastLoginAt: raw.lastLoginAt ?? null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

function mapLoginResponse(data: LoginResponse & { user: { role: string } }): LoginResponse {
  return {
    ...data,
    user: mapLoginUser(data.user),
  }
}

export function loadUserFromSession(): UserProfile | null {
  const raw = sessionStorage.getItem(USER_SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as UserProfile
    return { ...parsed, role: normalizeUserRole(parsed.role) }
  } catch {
    sessionStorage.removeItem(USER_SESSION_KEY)
    return null
  }
}

export function saveUserToSession(user: UserProfile): void {
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user))
}

export function clearUserSession(): void {
  sessionStorage.removeItem(USER_SESSION_KEY)
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  if (isDevTestCredentials(request.email, request.password)) {
    return createDevTestLoginResponse()
  }

  try {
    const { data } = await api.post<LoginResponse & { user: { role: string } }>('/api/auth/login', request)
    return mapLoginResponse(data)
  } catch (error) {
    if (isDevTestCredentials(request.email, request.password)) {
      return createDevTestLoginResponse()
    }
    throw error
  }
}

export async function refreshToken(): Promise<LoginResponse> {
  const cachedUser = loadUserFromSession()

  if (cachedUser && isDevTestUserEmail(cachedUser.email)) {
    return createDevTestLoginResponse()
  }

  try {
    const { data } = await api.post<
      Partial<LoginResponse> & { accessToken: string; user?: Partial<UserProfile> & { role: string } }
    >('/api/auth/refresh')

    const user = data.user ? mapLoginUser(data.user) : cachedUser

    if (!user) {
      throw new Error('No user session to restore')
    }

    return {
      accessToken: data.accessToken,
      tokenType: data.tokenType ?? 'Bearer',
      expiresIn: data.expiresIn ?? 900,
      user,
    }
  } catch (error) {
    if (cachedUser && isDevTestUserEmail(cachedUser.email)) {
      return createDevTestLoginResponse()
    }
    throw error
  }
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}

export async function logoutAll(): Promise<void> {
  await api.post('/api/auth/logout-all')
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await api.put('/api/auth/change-password', request)
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/api/auth/forgot-password', request)
  return data
}

export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  await api.post('/api/auth/reset-password', request)
}

export async function getSessions(): Promise<SessionInfo[]> {
  const { data } = await api.get<SessionInfo[]>('/api/auth/sessions')
  return data
}

export function extractApiError(error: unknown): { status?: number; code?: string; message: string } {
  if (!error || typeof error !== 'object' || !('isAxiosError' in error)) {
    return { message: 'Đã xảy ra lỗi. Vui lòng thử lại.' }
  }

  const axiosError = error as {
    response?: {
      status?: number
      data?: { code?: string; message?: string; detail?: string; title?: string }
    }
    message?: string
  }

  const status = axiosError.response?.status
  const data = axiosError.response?.data
  const message =
    data?.message ?? data?.detail ?? data?.title ?? axiosError.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.'

  return { status, code: data?.code, message }
}
