import Button from '@/components/common/Button'
import { Bell, RefreshCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const title = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/dashboard')) return 'Dashboard'
    if (p.startsWith('/alerts')) return 'Alerts'
    if (p.startsWith('/logs')) return 'Operation Log'
    if (p.startsWith('/admin')) return 'Users'
    if (p.startsWith('/ports')) return 'Ports & Zones'
    return 'PORMS'
  }, [location.pathname])

  return (
    <div className="h-[54px] bg-white border-b border-gray-200 flex items-center gap-3 px-5">
      <div className="text-sm font-bold text-slate-900 flex-1">
        {title}
        <span className="text-xs font-normal text-slate-600 ml-2">Cảng Tiên Sa — Đà Nẵng</span>
      </div>

      <div className="text-xs text-slate-600 tabular-nums whitespace-nowrap">
        {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ·{' '}
        {now.toLocaleDateString('vi-VN')}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="px-3 py-1.5"
          onClick={() => alert('Open alerts (placeholder)')}
          aria-label="Alerts"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="primary"
          className="px-3 py-1.5"
          onClick={() => alert('Refresh weather (placeholder)')}
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>
    </div>
  )
}