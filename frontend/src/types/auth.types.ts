export type UserRole = 'ADMIN' | 'PORT_MANAGER' | 'OPERATOR'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface LoginRequest {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: UserStatus
  assignedPortId: string | null
  assignedPortName: string | null
  phoneNumber: string | null
  lastLoginAt: string | null
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserProfile
}

export interface SessionInfo {
  id: string
  deviceInfo: {
    userAgent: string
    ipAddress: string
    platform: string
  }
  createdAt: string
  expiresAt: string
  revokedAt: string | null
  isCurrent: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ApiErrorResponse {
  code: string
  message: string
  details?: string | null
}

/** Map legacy BE enum value until BE renames COMPANY_ADMIN → PORT_MANAGER */
export function normalizeUserRole(role: string): UserRole {
  if (role === 'COMPANY_ADMIN') return 'PORT_MANAGER'
  if (role === 'ADMIN' || role === 'PORT_MANAGER' || role === 'OPERATOR') return role
  throw new Error(`Unknown user role: ${role}`)
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin'
    case 'PORT_MANAGER':
      return '/dashboard/port-manager'
    case 'OPERATOR':
      return '/dashboard/operator'
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin'
    case 'PORT_MANAGER':
      return 'Port Manager'
    case 'OPERATOR':
      return 'Operator'
  }
}
