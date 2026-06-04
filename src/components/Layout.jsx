import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  PhoneCall,
  UserCheck,
  SearchCheck,
  ThumbsUp,
  FileSignature,
  Banknote,
  Clock,
  Gavel,
  Calculator,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Shield
} from 'lucide-react'

const navItems = [
  { path: '/', page: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, step: null },
  { path: '/telesale', page: 'telesale', label: 'Telesale', icon: PhoneCall, step: 1 },
  { path: '/sale', page: 'sale', label: 'Sale', icon: UserCheck, step: 2 },
  { path: '/credit-analysis', page: 'credit-analysis', label: 'พิจารณาสินเชื่อ', icon: SearchCheck, step: 3 },
  { path: '/approval', page: 'approval', label: 'อนุมัติ', icon: ThumbsUp, step: 4 },
  { path: '/contract', page: 'contract', label: 'นิติกรรมสัญญา', icon: FileSignature, step: 5 },
  { path: '/disbursement', page: 'disbursement', label: 'เบิกจ่าย', icon: Banknote, step: 6 },
  { path: '/collection', page: 'collection', label: 'ติดตามหนี้', icon: Clock, step: 7 },
  { path: '/legal', page: 'legal', label: 'กฎหมาย', icon: Gavel, step: 8 },
  { path: '/accounting', page: 'accounting', label: 'บัญชี', icon: Calculator, step: 9 },
  { path: '/customers', page: 'customers', label: 'ลูกค้า', icon: Users, step: null },
  { path: '/settings', page: 'settings', label: 'ตั้งค่า', icon: Settings, step: null },
]

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout, hasAccess } = useAuth()
  const [companySettings, setCompanySettings] = useState({ company_name: 'SerialFac', company_subtitle: 'CRM ระบบสินเชื่อ', logo_url: '' })

  useEffect(() => {
    fetch('/api/company').then(r => r.json()).then(setCompanySettings).catch(() => {})
  }, [])

  const visibleNavItems = navItems.filter(item => hasAccess(item.page))
  const flowItems = visibleNavItems.filter(i => i.step)
  const otherItems = visibleNavItems.filter(i => !i.step && i.path !== '/')

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-green-900 via-green-800 to-green-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-green-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {companySettings.logo_url ? (
                  <img src={companySettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-green-900 font-bold text-lg">{companySettings.company_name?.charAt(0) || 'S'}</span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{companySettings.company_name}</h1>
                <p className="text-xs text-green-300">{companySettings.company_subtitle}</p>
              </div>
            </div>
            <button className="lg:hidden text-white/80 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-green-700/40 border border-green-600/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-green-900 shadow">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-sm text-green-300 flex items-center gap-1">
                <Shield size={10} /> {user?.role_label}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-3 flex-1 overflow-y-auto">
          {/* Dashboard */}
          {hasAccess('dashboard') && (
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-lg shadow-yellow-400/30 font-medium'
                  : 'text-green-100 hover:bg-green-700/50 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="text-base">แดชบอร์ด</span>
            </Link>
          )}

          {/* Flow Steps */}
          {flowItems.length > 0 && (
            <>
              <div className="mt-4 mb-2 px-3">
                <p className="text-sm font-semibold text-green-400 uppercase tracking-wider">ขั้นตอนการทำงาน</p>
              </div>
              {flowItems.map((item, idx) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                const isLast = idx === flowItems.length - 1
                return (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-lg shadow-yellow-400/30 font-medium'
                          : 'text-green-100 hover:bg-green-700/50 hover:text-white'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-green-800 text-yellow-400'
                          : 'bg-green-700/60 text-green-200'
                      }`}>
                        {item.step}
                      </div>
                      <span className="text-base flex-1">{item.label}</span>
                      <Icon size={16} className="opacity-60" />
                    </Link>
                    {!isLast && (
                      <div className="flex justify-start pl-6 py-0.5">
                        <div className="w-px h-3 bg-green-700/50"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* Other pages */}
          {otherItems.length > 0 && (
            <div className="mt-4 pt-3 border-t border-green-700/40">
              {otherItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-lg shadow-yellow-400/30 font-medium'
                        : 'text-green-100 hover:bg-green-700/50 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-base">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 mx-3 mb-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-200 hover:bg-red-900/40 hover:text-red-300 w-full transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-base">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-green-100 px-5 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button className="lg:hidden text-green-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-green-800">{companySettings.company_name}</span>
            <ChevronRight size={14} className="text-green-400" />
            <span className="text-green-600">{user?.role_label}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
