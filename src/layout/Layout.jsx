import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, QrCode, X, CalendarCheck2, BarChart3, LayoutDashboard, Settings, ShieldCheck, Users } from 'lucide-react'

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Students', path: '/students', icon: Users },
  { label: 'QR Scanner', path: '/scanner', icon: QrCode },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck2 },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export function Layout({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const current = navigation.find(item => item.path === location.pathname)
  const title = current?.label || (location.pathname.startsWith('/students/') ? 'Student profile' : 'Dashboard')
  const liveDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' })

  return <div className="flex min-h-screen w-full bg-[#f7f8f4]">
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col border-r border-[#dce5df] bg-[#fbfcf8] p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between"><Link to="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#1f6b4c] text-white"><ShieldCheck size={19} /></span><span className="font-display text-xl font-bold">Attendly</span></Link><button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close navigation"><X size={18} /></button></div>
      <p className="mt-12 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-[#9aa99f]">Workspace</p>
      <nav className="mt-3 space-y-1">{navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#dcefe3] text-[#1f6b4c]' : 'text-[#718078] hover:bg-[#eef4ef]'}`}><Icon size={17} />{label}</NavLink>)}</nav>
      <div className="mt-auto border-t border-[#dce5df] pt-4"><div className="flex items-center gap-3 rounded-xl bg-[#eef4ef] p-3"><div className="grid size-9 place-items-center rounded-full bg-[#f2b866] text-xs font-bold">{user?.name?.slice(0, 2).toUpperCase() || 'AD'}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user?.name || 'Attendance Admin'}</p><p className="text-xs text-[#718078]">{user?.role || 'Admin'}</p></div><button onClick={onLogout} aria-label="Logout" title="Logout" className="text-[#718078] hover:text-[#b44d3e]"><LogOut size={16} /></button></div></div>
    </aside>
    {open && <button className="fixed inset-0 z-20 bg-[#17251f]/20 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <section className="flex min-h-screen min-w-0 flex-1 flex-col"><header className="flex h-20 shrink-0 items-center justify-between border-b border-[#dce5df] bg-[#fbfcf8] px-5 sm:px-10"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="lg:hidden" aria-label="Open navigation"><Menu /></button><div><p className="text-xs text-[#718078]">{liveDate}</p><p className="font-display text-xl font-semibold">{title}</p></div></div><div className="hidden items-center gap-2 rounded-xl bg-[#eef4ef] px-3 py-2 text-sm font-semibold text-[#1f6b4c] sm:flex"><Bell size={15} />Live campus data<ChevronDown size={14} /></div></header><main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-7xl p-5 sm:p-10"><Outlet /></div></main></section>
  </div>
}
