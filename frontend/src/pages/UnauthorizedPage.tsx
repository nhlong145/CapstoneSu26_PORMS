import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPath } from '@/types/auth.types'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  const dashboardPath = user ? getDashboardPath(user.role) : '/login'

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="text-4xl font-bold text-risk-critical">403</div>
        <h1 className="mt-2 text-lg font-bold text-slate-900">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tài khoản của bạn không có quyền xem trang này. Liên hệ Admin nếu bạn cho rằng đây là lỗi.
        </p>
        <Link
          to={dashboardPath}
          className="mt-6 inline-flex h-9 items-center rounded bg-brand px-4 text-sm font-semibold text-white hover:brightness-95"
        >
          Về Dashboard
        </Link>
      </div>
    </div>
  )
}
