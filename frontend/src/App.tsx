import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PageWrapper from '@/components/layout/PageWrapper'

import LoginPage from '@/pages/auth/LoginPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import AdminDashboardPage from '@/pages/dashboard/AdminDashboardPage'
import PortManagerDashboardPage from '@/pages/dashboard/PortManagerDashboardPage'
import OperatorDashboardPage from '@/pages/dashboard/OperatorDashboardPage'
import AlertPage from '@/pages/AlertPage'
import LogPage from '@/pages/LogPage'
import AdminPage from '@/pages/AdminPage'
import PortListPage from '@/pages/ports/PortListPage'
import PortDetailPage from '@/pages/ports/PortDetailPage'
import SopConfigPage from '@/pages/SopConfigPage'
import RiskConfigPage from '@/pages/RiskConfigPage'
import BiDashboardPage from '@/pages/BiDashboardPage'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPath } from '@/types/auth.types'

function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return null
  if (isAuthenticated && user) return <Navigate to={getDashboardPath(user.role)} replace />
  return <Navigate to="/login" replace />
}

function LegacyDashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getDashboardPath(user.role)} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <PageWrapper>
                <AdminDashboardPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/port-manager"
          element={
            <ProtectedRoute requiredRoles={['PORT_MANAGER']}>
              <PageWrapper>
                <PortManagerDashboardPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/operator"
          element={
            <ProtectedRoute requiredRoles={['OPERATOR']}>
              <PageWrapper>
                <OperatorDashboardPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<LegacyDashboardRedirect />} />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <AlertPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <LogPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sop-config"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'PORT_MANAGER']}>
              <PageWrapper>
                <SopConfigPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/risk-config"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'PORT_MANAGER']}>
              <PageWrapper>
                <RiskConfigPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'PORT_MANAGER']}>
              <PageWrapper>
                <BiDashboardPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <PageWrapper>
                <AdminPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ports"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'PORT_MANAGER']}>
              <PageWrapper>
                <PortListPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ports/:portId"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'PORT_MANAGER']}>
              <PageWrapper>
                <PortDetailPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<Navigate to="/users" replace />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
