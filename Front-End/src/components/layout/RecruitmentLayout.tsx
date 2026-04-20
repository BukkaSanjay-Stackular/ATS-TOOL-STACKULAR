import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FilePlus, LogOut } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import stackularLogo from '../../assets/Stackular_Logo.png'

const NAV_ITEMS = [
  { to: '/recruitment/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruitment/job-posting', icon: FilePlus, label: 'Job Posting' },
]

export default function RecruitmentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen" style={{ background: '#0c0c0c' }}>
      {/* Sidebar */}
      <aside
        className="w-60 flex flex-col"
        style={{ background: '#161719', borderRight: '1px solid #37373f' }}
      >
        <div className="p-5" style={{ borderBottom: '1px solid #37373f' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src={stackularLogo}
                alt="Stackular logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                ATS Stackular
              </p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Recruitment Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={({ isActive }) =>
                isActive
                  ? { background: '#1d2ba4', color: '#fff' }
                  : { color: '#9ca3af' }
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid #37373f' }}>
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: '#9ca3af' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.background = '#1a1d20'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#0c0c0c' }}>
        <Outlet />
      </main>
    </div>
  )
}
