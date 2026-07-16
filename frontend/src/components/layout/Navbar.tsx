import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiHandHeartLine,
  RiVolumeUpLine,
  RiBookLine,
  RiVideoLine,
  RiSettings3Line,
  RiCpuLine,
  RiMenuLine,
  RiCloseLine,
  RiDashboardLine,
  RiRobotLine,
  RiUserLine,
  RiLogoutBoxLine,
} from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/',          label: 'Home',      icon: RiHandHeartLine },
  { to: '/translate', label: 'Translate', icon: RiVolumeUpLine },
  { to: '/train',     label: 'Train AI',  icon: RiCpuLine },
  { to: '/learn',     label: 'Learn',     icon: RiBookLine },
  { to: '/chat',      label: 'AI Chat',   icon: RiRobotLine },
  { to: '/call',      label: 'Video Call',icon: RiVideoLine },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-950/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-purple-600 rounded-lg rotate-45 group-hover:rotate-[55deg] transition-transform duration-300" />
              <div className="absolute inset-1 bg-dark-950 rounded-md rotate-45" />
              <div className="absolute inset-2 bg-purple-500 rounded-sm rotate-45 group-hover:bg-purple-400 transition-colors" />
            </div>
            <span className="font-display font-bold text-xl text-white" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}>
              Elysia
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`text-base ${active ? 'text-purple-400' : ''}`} />
                    {label}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center">
                      <RiUserLine size={14} className="text-purple-300" />
                    </div>
                  )}
                  <span className="text-sm text-gray-300 hidden sm:block max-w-[120px] truncate">
                    {user.displayName || user.email}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 glass-card overflow-hidden z-50"
                    >
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                        <RiDashboardLine size={16} />
                        Dashboard
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                        <RiSettings3Line size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <RiLogoutBoxLine size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <button className="btn-outline text-sm px-4 py-2">Sign In</button>
                </Link>
                <Link to="/translate">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-neon text-sm px-4 py-2">
                    Start Now
                  </motion.button>
                </Link>
              </>
            )}

            <button
              id="mobile-menu-btn"
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link key={to} to={to}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      active ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                    </div>
                  </Link>
                )
              })}
              <div className="border-t border-white/5 mt-2 pt-2">
                {user ? (
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                    <RiLogoutBoxLine size={18} />
                    Sign Out
                  </button>
                ) : (
                  <Link to="/login">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      <RiUserLine size={18} />
                      Sign In
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
