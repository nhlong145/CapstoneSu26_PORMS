import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { extractApiError } from '@/services/auth.service'
import { getDashboardPath } from '@/types/auth.types'
import { isValidEmail } from '@/utils/emailValidator'
import Spinner from '@/components/common/Spinner'

const GENERIC_LOGIN_ERROR = 'Email hoặc mật khẩu không đúng'

function formatLockoutMessage(message: string): string {
  const minutesMatch = message.match(/(\d+)\s*phút/i)
  if (minutesMatch) {
    return `Tài khoản bị khóa ${minutesMatch[1]} phút`
  }
  return message || 'Tài khoản bị khóa tạm thời'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  if (!isLoading && isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const nextFieldErrors: { email?: string; password?: string } = {}
    if (!email.trim()) nextFieldErrors.email = 'Email là bắt buộc'
    else if (!isValidEmail(email)) nextFieldErrors.email = 'Email không đúng định dạng'

    if (!password) nextFieldErrors.password = 'Mật khẩu là bắt buộc'

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const loggedInUser = await login(email.trim(), password)
      navigate(getDashboardPath(loggedInUser.role), { replace: true })
    } catch (err) {
      const apiError = extractApiError(err)
      if (apiError.status === 423 || apiError.code === 'ACCOUNT_LOCKED') {
        setError(formatLockoutMessage(apiError.message))
      } else if (apiError.status === 401 || apiError.code === 'INVALID_CREDENTIALS') {
        setError(GENERIC_LOGIN_ERROR)
      } else if (apiError.status === 400) {
        setError(GENERIC_LOGIN_ERROR)
      } else {
        setError('Không thể kết nối máy chủ. Vui lòng thử lại sau.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand font-extrabold text-white">
            P
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">PORMS</div>
            <div className="text-xs text-slate-500">Hệ thống Cảnh báo Rủi ro Vận hành Cảng</div>
          </div>
        </div>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
              disabled={isSubmitting}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-risk-critical">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-semibold text-slate-600">
              Mật khẩu
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 w-full rounded border border-gray-200 px-3 pr-10 text-sm outline-none focus:border-brand"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-risk-critical">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <div className="rounded border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded bg-brand font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
