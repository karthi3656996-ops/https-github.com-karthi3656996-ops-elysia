import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiGoogleFill, RiMailLine, RiLockLine,
  RiUserLine, RiHandHeartLine, RiLoader4Line,
  RiCheckLine,
} from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success,  setSuccess]  = useState(false)   // email-confirmation state

  const passwordStrength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor  = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500']

  // ── Register ───────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim())     return toast.error('Please enter your name')
    if (!email.trim())    return toast.error('Please enter your email')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await signUpWithEmail(email.trim(), password, name.trim())
      // Supabase sends a confirmation email by default
      // If you've disabled email confirmation in the dashboard, redirect immediately
      setSuccess(true)
      toast.success('Account created! Check your email to verify 📬')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Google sign in failed')
      setGoogleLoading(false)
    }
  }

  // ── Email-sent confirmation screen ────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="glass-card p-8 text-center space-y-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
              <RiCheckLine size={28} className="text-green-400" />
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-white">Verify your email</h2>
            <p className="text-gray-400">
              We've sent a confirmation link to <span className="text-purple-300">{email}</span>.
              Click the link to activate your account, then sign in.
            </p>
            <Link to="/login">
              <button className="btn-neon w-full py-3">Go to Sign In</button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────────────────

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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
            <RiHandHeartLine size={28} className="text-purple-400" />
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create your account</h1>
          <p className="text-gray-500">Free forever. No credit card required.</p>
        </div>

        <div className="glass-card p-8 space-y-5">
          {/* Google */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleGoogle} disabled={googleLoading} id="google-register-btn"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all disabled:opacity-60">
            {googleLoading
              ? <RiLoader4Line size={18} className="animate-spin text-gray-400" />
              : <RiGoogleFill size={18} className="text-red-400" />
            }
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">or create with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <RiUserLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input id="name-input" type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" className="input-neon pl-10" autoComplete="name" required />
            </div>

            {/* Email */}
            <div className="relative">
              <RiMailLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input id="email-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" className="input-neon pl-10" autoComplete="email" required />
            </div>

            {/* Password + strength meter */}
            <div className="space-y-1.5">
              <div className="relative">
                <RiLockLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input id="password-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)" className="input-neon pl-10" autoComplete="new-password" required />
              </div>
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map(lvl => (
                      <div key={lvl} className={`h-1 flex-1 rounded-full transition-all duration-300 ${lvl <= passwordStrength ? strengthColor[passwordStrength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength === 1 ? 'text-red-400' : passwordStrength === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {strengthLabel[passwordStrength]}
                  </span>
                </motion.div>
              )}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" id="register-submit-btn" disabled={loading}
              className="btn-neon w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><RiLoader4Line size={16} className="animate-spin" /> Creating account…</>
                : 'Create Account'
              }
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">Sign in</Link>
          </p>
        </div>

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
