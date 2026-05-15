import { NavLink } from 'react-router-dom'
import { Bell, LayoutDashboard, ListChecks, Settings, Shield, Users2 } from 'lucide-react'

type Role = 'USER' | 'ADMIN'

const ROLE_PLACEHOLDER: Role = 'ADMIN'

const navGroups: Array<{
  title: string
  items: Array<{
    to: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    roles?: Role[]
    badge?: string
  }>
}> = [
  {
    title: 'Vận hành',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/alerts', label: 'Alerts', icon: Bell, badge: '3' },
      { to: '/logs', label: 'Operation Log', icon: ListChecks },
    ],
  },
  {
    title: 'Hệ thống',
    items: [{ to: '/admin', label: 'Users', icon: Users2, roles: ['ADMIN'] }],
  },
  {
    title: 'Cấu hình',
    items: [
      { to: '/ports', label: 'Ports (stub)', icon: Settings, roles: ['ADMIN'] },
      { to: '/admin', label: 'Admin (stub)', icon: Shield, roles: ['ADMIN'] },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-navy text-white flex flex-col overflow-y-auto">
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-brand text-white flex items-center justify-center font-extrabold tracking-tight">
          P
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold leading-4">PORMS</div>
          <div className="text-[10px] text-white/40 mt-0.5 truncate">Cảng Tiên Sa · DNTSA</div>
        </div>
      </div>

      <nav className="px-2 py-3 flex-1">
        {navGroups.map((g) => (
          <div key={g.title} className="mb-3">
            <div className="px-2 py-1 text-[10px] tracking-widest uppercase text-white/30 font-semibold">
              {g.title}
            </div>
            <div className="space-y-0.5">
              {g.items
                .filter((x) => !x.roles || x.roles.includes(ROLE_PLACEHOLDER))
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={`${g.title}-${item.to}-${item.label}`}
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium transition',
                          isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90',
                        ].join(' ')
                      }
                    >
                      <Icon className="h-4 w-4 opacity-80" />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-risk-critical text-white text-[10px] font-bold px-2 leading-4">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-bold">
          NV
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-white/80 font-medium leading-4 truncate">Nguyễn Văn Hùng</div>
          <div className="text-[10px] text-white/35 leading-4 truncate">{ROLE_PLACEHOLDER}</div>
        </div>
      </div>
    </aside>
  )
}