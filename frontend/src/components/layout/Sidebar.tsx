import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  ListChecks,
  Settings,
  Shield,
  SlidersHorizontal,
  Users2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPath, getRoleLabel, type UserRole } from '@/types/auth.types'

type NavItem = {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
  badge?: string
}

const navGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Vận hành',
    items: [
      { to: '__DASHBOARD__', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/alerts', label: 'Alerts', icon: Bell, badge: '3' },
      { to: '/logs', label: 'Task Log', icon: ListChecks },
    ],
  },
  {
    title: 'Phân tích',
    items: [
      {
        to: '/analytics',
        label: 'Analytics',
        icon: BarChart3,
        roles: ['ADMIN', 'PORT_MANAGER'],
      },
    ],
  },
  {
    title: 'Cấu hình',
    items: [
      {
        to: '/sop-config',
        label: 'SOP Config',
        icon: Settings,
        roles: ['ADMIN', 'PORT_MANAGER'],
      },
      {
        to: '/risk-config',
        label: 'Risk Config',
        icon: SlidersHorizontal,
        roles: ['ADMIN', 'PORT_MANAGER'],
      },
      { to: '/ports', label: 'Ports', icon: Shield, roles: ['ADMIN', 'PORT_MANAGER'] },
    ],
  },
  {
    title: 'Hệ thống',
    items: [{ to: '/users', label: 'Users', icon: Users2, roles: ['ADMIN'] }],
  },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const dashboardPath = getDashboardPath(user.role)
  const initials = getInitials(user.fullName || user.email)

  return (
    <aside className="flex h-screen w-56 flex-col overflow-y-auto bg-navy text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand font-extrabold tracking-tight text-white">
          P
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold leading-4">PORMS</div>
          <div className="mt-0.5 truncate text-[10px] text-white/40">
            {user.assignedPortName ?? 'Hệ thống cảng biển'}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.includes(user.role),
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={group.title} className="mb-3">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const to = item.to === '__DASHBOARD__' ? dashboardPath : item.to
                  const isActive =
                    item.to === '__DASHBOARD__'
                      ? location.pathname.startsWith('/dashboard')
                      : location.pathname === to

                  return (
                    <NavLink
                      key={`${group.title}-${item.label}`}
                      to={to}
                      className={() =>
                        [
                          'flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium transition',
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'text-white/60 hover:bg-white/10 hover:text-white/90',
                        ].join(' ')
                      }
                    >
                      <Icon className="h-4 w-4 opacity-80" />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-risk-critical px-2 text-[10px] font-bold leading-4 text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[11px] font-medium leading-4 text-white/80">
            {user.fullName}
          </div>
          <div className="truncate text-[10px] leading-4 text-white/35">{getRoleLabel(user.role)}</div>
        </div>
      </div>
    </aside>
  )
}
