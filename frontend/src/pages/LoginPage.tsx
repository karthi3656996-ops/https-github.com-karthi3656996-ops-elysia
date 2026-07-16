import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiGoogleFill, RiMailLine, RiLockLine,
  RiEyeLine, RiEyeOffLine, RiHandHeartLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // ── Email sign-in ──────────────────────────────────────────────────────────

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim())    return toast.error('Please enter your email')
    if (!password.trim()) return toast.error('Please enter your password')

    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ───────────────────────────────────────────────────────────

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      // Page will redirect — no need to navigate manually
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Google sign in failed')
      setGoogleLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4"
          >
            <RiHandHeartLine size={28} className="text-purple-400" />
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your Elysia account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 space-y-5">

          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogle}
            disabled={googleLoading}
            id="google-signin-btn"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all disabled:opacity-60"
          >
            {googleLoading
              ? <RiLoader4Line size={18} className="animate-spin text-gray-400" />
              : <RiGoogleFill size={18} className="text-red-400" />
            }
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">or sign in with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="relative">
              <RiMailLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-neon pl-10"
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <RiLockLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="password-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="input-neon pl-10 pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPass ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              id="signin-submit-btn"
              disabled={loading}
              className="btn-neon w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <><RiLoader4Line size={16} className="animate-spin" /> Signing in…</>
                : 'Sign In'
              }
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Create one free
            </Link>
          </p>
        </div>

        {/* Supabase badge */}
        <p className="text-center text-xs text-gray-700 mt-4">
          Secured by{' '}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-400 transition-colors">
            Supabase
          </a>
        </p>
      </motion.div>
    </div>
  )
}
