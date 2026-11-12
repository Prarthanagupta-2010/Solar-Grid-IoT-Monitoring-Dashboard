import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity, AlertTriangle, BarChart3, BatteryCharging, ChevronRight, Cpu,
  LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Users, Wrench, X, Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Cpu },
  { to: '/live', label: 'Live monitoring', icon: Activity },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/analytics', label: 'Energy analytics', icon: BarChart3 },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-solar to-orange-500 text-ink shadow-lg shadow-orange-500/10">
          <Zap size={22} fill="currentColor" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[.25em] text-solar">SOLARGRID</p>
          <p className="text-sm font-semibold text-white">Command Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-[.18em] text-slate-600">PLATFORM</p>
        {navigation.filter((item) => !item.adminOnly || user?.role === 'ADMIN').map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive ? 'bg-white/[.08] text-white shadow-sm' : 'text-slate-400 hover:bg-white/[.04] hover:text-slate-200'
              }`}
            >
              {({ isActive }) => <>
                <Icon size={18} className={isActive ? 'text-mint' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-mint" />}
              </>}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[.035] p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-mint/10 text-xs font-bold text-mint">
            {user?.fullName?.split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">{user?.fullName}</p>
            <p className="mt-0.5 text-[10px] tracking-wider text-slate-500">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-500 transition hover:bg-rose-400/5 hover:text-rose-300">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 bg-[#0d182b] lg:block">{sidebar}</aside>
      {open && <>
        <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
        <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 bg-[#0d182b] lg:hidden">
          <button className="absolute right-3 top-3 rounded-lg p-2 text-slate-400" onClick={() => setOpen(false)}><X size={20} /></button>
          {sidebar}
        </aside>
      </>}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-ink/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"><Menu size={21} /></button>
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <ShieldCheck size={15} className="text-mint" /> Secure telemetry channel
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> System live
            </div>
            <BatteryCharging size={18} className="text-solar" />
          </div>
        </header>
        <main key={location.pathname} className="mx-auto max-w-[1540px] px-4 py-7 sm:px-7 sm:py-9"><Outlet /></main>
      </div>
    </div>
  )
}

