import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'

type Role = 'USER' | 'ADMIN'

type Props = {
  children: JSX.Element
  requiredRole?: Role
}

const ROLE_PLACEHOLDER: Role = 'ADMIN'

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const isAuthenticated = true // placeholder

  if (!isAuthenticated) return <Navigate to="/login" />

  if (requiredRole && ROLE_PLACEHOLDER !== requiredRole) {
    return <Navigate to="/dashboard" />
  }

  return children
}