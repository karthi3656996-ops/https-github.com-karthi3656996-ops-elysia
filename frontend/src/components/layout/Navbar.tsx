import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiHandHeartLine, RiVolumeUpLine, RiBookLine,
  RiVideoLine, RiSettings3Line, RiCpuLine,
  RiMenuLine, RiCloseLine, RiDashboardLine,
  RiRobotLine, RiUserLine, RiLogoutBoxLine,
} from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/translate', label: 'Translate', icon: RiVolumeUpLine },
  { to: '/train',     label: 'Train AI',  icon: RiCpuLine },
  { to: '/learn',     label: 'Learn',     icon: RiBookLine },
  { to: '/library',   label: 'Library',   icon: RiHandHeartLine },
  { to: '/chat',      label: 'AI Chat',   icon: RiRobotLine },
]

const GITHUB = 'https://github.com/karthi3656996-ops/https-github.com-karthi3656996-ops-elysia'

export default function Navbar() {
  const location   = useLocation()
  const navigate   = useNavigate()
  const { user, logout } = useAuth()
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(26,16,44,0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl icon-sunset flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ boxShadow: '0 0 16px rgba(255,122,24,0.4)' }}>
              <RiHandHeartLine size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight"
              style={{ textShadow: '0 0 20px rgba(255,122,24,0.5)' }}>
              Elysia
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'nav-active' : ''}`}
                    style={{
                      color: active ? '#FF9A50' : '#C9C9D6',
                      background: active ? 'rgba(255,122,24,0.12)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#C9C9D6' }}
                  >
                    <Icon size={15} />
                    {label}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* GitHub */}
            <a href={GITHUB} target="_blank" rel="noreferrer"
              title="View Source on GitHub"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                color: '#C9C9D6',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#FF9A50'
                el.style.borderColor = 'rgba(255,122,24,0.4)'
                el.style.background = 'rgba(255,122,24,0.08)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#C9C9D6'
                el.style.borderColor = 'rgba(255,255,255,0.1)'
                el.style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>

            {/* User section */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center icon-sunset">
                      <RiUserLine size={13} className="text-white" />
                    </div>
                  )}
                  <span className="text-sm hidden sm:block max-w-[120px] truncate" style={{ color: '#C9C9D6' }}>
                    {displayName}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-card overflow-hidden z-50"
                      style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255,122,24,0.1)' }}
                    >
                      <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors"
                        style={{ color: '#C9C9D6' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,122,24,0.08)'; (e.currentTarget as HTMLElement).style.color = '#FF9A50' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C9C9D6' }}>
                        <RiDashboardLine size={15} /> Dashboard
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors"
                        style={{ color: '#C9C9D6' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,122,24,0.08)'; (e.currentTarget as HTMLElement).style.color = '#FF9A50' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C9C9D6' }}>
                        <RiSettings3Line size={15} /> Settings
                      </Link>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors"
                        style={{ color: '#FF4D9D' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,77,157,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <RiLogoutBoxLine size={15} /> Sign Out
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

            {/* Mobile menu button */}
            <button id="mobile-menu-btn" className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#C9C9D6' }}
              onClick={() => setMobileOpen(!mobileOpen)}>
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
            style={{ background: 'rgba(26,16,44,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link key={to} to={to}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                      style={{
                        background: active ? 'rgba(255,122,24,0.12)' : 'transparent',
                        color: active ? '#FF9A50' : '#C9C9D6',
                      }}>
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                    </div>
                  </Link>
                )
              })}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
              <a href={GITHUB} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{ color: '#C9C9D6' }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                <span className="font-medium">GitHub Repo</span>
              </a>
              {!user && (
                <Link to="/login">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ color: '#C9C9D6' }}>
                    <RiUserLine size={18} />
                    <span className="font-medium">Sign In</span>
                  </div>
                </Link>
              )}
              {user && (
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all"
                  style={{ color: '#FF4D9D' }}>
                  <RiLogoutBoxLine size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
