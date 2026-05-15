import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import ProtectedRoute from '@/routes/ProtectedRoute'

import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import AlertPage from '@/pages/AlertPage'
import LogPage from '@/pages/LogPage'
import AdminPage from '@/pages/AdminPage'
import PortManagementPage from '@/pages/PortManagementPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <DashboardPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

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
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <PageWrapper>
                <AdminPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ports"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <PageWrapper>
                <PortManagementPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}