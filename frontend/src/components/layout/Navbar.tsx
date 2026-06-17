import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, RefreshCcw } from 'lucide-react'
import Button from '@/components/common/Button'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleLabel } from '@/types/auth.types'

const MOCK_PORTS = [
  { id: '1', name: 'Cảng Tiên Sa — Đà Nẵng' },
  { id: '2', name: 'Cảng Sài Gòn — TP.HCM' },
  { id: '3', name: 'Cảng Hải Phòng' },
]

const UNREAD_ALERTS = 3

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [now, setNow] = useState(() => new Date())
  const [menuOpen, setMenuOpen] = useState(false)
  const [portOpen, setPortOpen] = useState(false)
  const [selectedPortId, setSelectedPortId] = useState(MOCK_PORTS[0].id)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const portMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setMenuOpen(false)
      if (portMenuRef.current && !portMenuRef.current.contains(target)) setPortOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const title = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/dashboard')) return 'Dashboard'
    if (p.startsWith('/alerts')) return 'Alerts'
    if (p.startsWith('/logs')) return 'Task Log'
    if (p.startsWith('/users')) return 'Users'
    if (p.startsWith('/ports')) return 'Ports & Zones'
    if (p.startsWith('/sop-config')) return 'SOP Config'
    if (p.startsWith('/risk-config')) return 'Risk Config'
    if (p.startsWith('/analytics')) return 'Analytics'
    return 'PORMS'
  }, [location.pathname])

  const selectedPort = MOCK_PORTS.find((p) => p.id === selectedPortId) ?? MOCK_PORTS[0]
  const portLabel = user?.assignedPortName ?? selectedPort.name

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-[54px] items-center gap-3 border-b border-gray-200 bg-white px-5">
      <div className="flex-1 text-sm font-bold text-slate-900">
        {title}
        <span className="ml-2 text-xs font-normal text-slate-600">{portLabel}</span>
      </div>

      <div className="whitespace-nowrap text-xs tabular-nums text-slate-600">
        {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ·{' '}
        {now.toLocaleDateString('vi-VN')}
      </div>

      {user?.role === 'ADMIN' && (
        <div className="relative" ref={portMenuRef}>
          <button
            type="button"
            onClick={() => {
              setPortOpen((v) => !v)
              setMenuOpen(false)
            }}
            className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-gray-50"
          >
            <span className="max-w-[140px] truncate">{selectedPort.name}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {portOpen && (
            <div className="absolute right-0 z-20 mt-1 w-56 rounded border border-gray-200 bg-white py-1 shadow-lg">
              {MOCK_PORTS.map((port) => (
                <button
                  key={port.id}
                  type="button"
                  onClick={() => {
                    setSelectedPortId(port.id)
                    setPortOpen(false)
                  }}
                  className={[
                    'block w-full px-3 py-2 text-left text-xs hover:bg-gray-50',
                    port.id === selectedPortId ? 'font-semibold text-brand' : 'text-slate-700',
                  ].join(' ')}
                >
                  {port.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="relative px-3 py-1.5"
          onClick={() => navigate('/alerts')}
          aria-label="Alerts"
        >
          <Bell className="h-4 w-4" />
          {UNREAD_ALERTS > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-risk-critical px-1 text-[10px] font-bold text-white">
              {UNREAD_ALERTS}
            </span>
          )}
        </Button>
        <Button
          variant="primary"
          className="px-3 py-1.5"
          onClick={() => alert('Làm mới dữ liệu (placeholder)')}
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </Button>

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v)
              setPortOpen(false)
            }}
            className="flex items-center gap-2 rounded border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50"
          >
            <span className="max-w-[120px] truncate font-medium text-slate-800">
              {user?.fullName ?? 'User'}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
              {user ? getRoleLabel(user.role) : ''}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-48 rounded border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-3 py-2">
                <div className="truncate text-xs font-semibold text-slate-900">{user?.fullName}</div>
                <div className="truncate text-[10px] text-slate-500">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-gray-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
