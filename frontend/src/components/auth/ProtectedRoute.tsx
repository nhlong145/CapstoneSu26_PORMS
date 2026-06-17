import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/auth.types'
import Spinner from '@/components/common/Spinner'

type Props = {
  children: ReactNode
  requiredRoles?: UserRole[]
}

function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm text-slate-500">Đang xác thực phiên đăng nhập...</p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children, requiredRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <AuthLoadingSkeleton />

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
