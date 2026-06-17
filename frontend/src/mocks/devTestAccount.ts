import type { LoginResponse } from '@/types/auth.types'

/** Shared dev/test admin — dùng khi BE auth chưa sẵn sàng. Bỏ fallback khi POST /api/auth/login live. */
export const DEV_TEST_ACCOUNT = {
  email: 'admin@porms.vn',
  password: 'Admin@2026!',
} as const

export const DEV_TEST_ACCESS_TOKEN = 'dev-test-access-token'

export function isDevTestCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEV_TEST_ACCOUNT.email &&
    password === DEV_TEST_ACCOUNT.password
  )
}

export function isDevTestUserEmail(email: string): boolean {
  return email.trim().toLowerCase() === DEV_TEST_ACCOUNT.email
}

export function createDevTestLoginResponse(): LoginResponse {
  return {
    accessToken: DEV_TEST_ACCESS_TOKEN,
    tokenType: 'Bearer',
    expiresIn: 900,
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      email: DEV_TEST_ACCOUNT.email,
      fullName: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      assignedPortId: null,
      assignedPortName: 'Cảng Tiên Sa — Đà Nẵng',
      phoneNumber: null,
      lastLoginAt: new Date().toISOString(),
      createdAt: '2025-01-01T00:00:00+07:00',
    },
  }
}
