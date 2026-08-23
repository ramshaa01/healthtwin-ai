import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

const NAV_LINKS = [
  { path: "/dashboard",  label: "Dashboard",  icon: "📊" },
  { path: "/assessment", label: "Assessment",  icon: "🩺" },
  { path: "/simulate",   label: "Simulate",    icon: "🔮" },
  { path: "/forecast",   label: "Forecast",    icon: "📈" },
  { path: "/history",    label: "History",     icon: "📋" },
  { path: "/chat", label: "Chat", icon: "💬" },
  { path: "/trends", label: "Trends", icon: "📊" },
  { path: "/twin", label: "Twin", icon: "🫀" },
]

export default function Navbar() {
  const { user, logout, isDemoMode, exitDemo } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {isDemoMode && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-semibold flex justify-center items-center gap-4">
          <span>🎬 Demo Mode — sample data, not a real assessment</span>
          <button onClick={() => { exitDemo(); navigate("/login"); }} className="bg-amber-950 text-amber-50 px-3 py-1 rounded-full text-xs hover:bg-amber-900 transition-colors">
            Exit Demo
          </button>
        </div>
      )}
      {/* Desktop Navbar */}
      <nav className="bg-gradient-to-r from-primary-800 to-primary-950 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard"
              className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-2xl">🏥</span>
              <span className="hidden sm:block">HealthTwin AI</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.path} to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg
                    text-sm font-medium transition-all duration-150
                    ${isActive(link.path)
                      ? 'bg-white/20 text-white'
                      : 'text-primary-200 hover:text-white hover:bg-white/10'
                    }`}>
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* User area */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <span className="hidden sm:block text-primary-200 text-sm">
                    {user.full_name || user.username}
                  </span>
                  <button
                    onClick={toggle}
                    style={{
                      background:"rgba(255,255,255,0.1)",
                      border:"0.5px solid rgba(255,255,255,0.2)",
                      color:"white", fontSize:"16px",
                      width:"32px", height:"32px",
                      borderRadius:"8px", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.2s"
                    }}
                    title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {dark ? "☀️" : "🌙"}
                  </button>
                  <button onClick={handleLogout}
                    className="bg-white/10 hover:bg-white/20 text-white
                               text-sm font-medium px-3 py-1.5 rounded-lg
                               transition-all duration-150 border border-white/20">
                    Logout
                  </button>
                </>
              )}
              {/* Mobile menu button */}
              <button
                className="md:hidden text-white p-1"
                onClick={() => setMenuOpen(!menuOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    : <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden bg-primary-900 border-t border-primary-700
                          px-4 py-3 space-y-1 animate-fade-in">
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all
                  ${isActive(link.path)
                    ? 'bg-white/20 text-white'
                    : 'text-primary-200 hover:text-white hover:bg-white/10'
                  }`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-white border-t border-gray-200 shadow-2xl">
        <div className="flex justify-around py-2">
          {NAV_LINKS.filter(l =>
            ["/dashboard","/assessment","/twin","/chat","/trends"]
            .includes(l.path)
          ).map(link => (
            <Link key={link.path} to={link.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5
                rounded-lg transition-all
                ${isActive(link.path)
                  ? 'text-primary-700'
                  : 'text-gray-400 hover:text-gray-600'
                }`}>
              <span className="text-lg">{link.icon}</span>
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
