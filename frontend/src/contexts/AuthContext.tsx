import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserProfile } from '@/types/auth.types'
import { registerAuthFailureHandler } from '@/services/api'
import {
  clearUserSession,
  loadUserFromSession,
  login as loginApi,
  logout as logoutApi,
  logoutAll as logoutAllApi,
  refreshToken,
  saveUserToSession,
} from '@/services/auth.service'
import { clearAccessToken, setAccessToken } from '@/services/tokenStore'

type AuthContextValue = {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<UserProfile>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function applySession(user: UserProfile, accessToken: string): void {
  setAccessToken(accessToken)
  saveUserToSession(user)
}

function clearSession(): void {
  clearAccessToken()
  clearUserSession()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleAuthFailure = useCallback(() => {
    clearSession()
    setUser(null)
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }, [])

  useEffect(() => {
    registerAuthFailureHandler(handleAuthFailure)
  }, [handleAuthFailure])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const cachedUser = loadUserFromSession()
      if (!cachedUser) {
        if (!cancelled) setIsLoading(false)
        return
      }

      try {
        const response = await refreshToken()
        if (cancelled) return
        applySession(response.user, response.accessToken)
        setUser(response.user)
      } catch {
        if (cancelled) return
        clearSession()
        setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginApi({ email, password })
    applySession(response.user, response.accessToken)
    setUser(response.user)
    return response.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // Still clear local session if BE unavailable
    } finally {
      clearSession()
      setUser(null)
    }
  }, [])

  const logoutAll = useCallback(async () => {
    try {
      await logoutAllApi()
    } catch {
      // Still clear local session if BE unavailable
    } finally {
      clearSession()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      logoutAll,
    }),
    [user, isLoading, login, logout, logoutAll],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
