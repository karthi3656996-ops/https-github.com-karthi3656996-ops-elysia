import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiGoogleFill, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiLoader4Line } from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    try { await signInWithGoogle() }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Google sign in failed'); setGLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="glow-orb w-80 h-80 top-10 left-[-80px]" style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.25), transparent 70%)' }} />
      <div className="glow-orb w-72 h-72 bottom-10 right-[-60px]" style={{ background: 'radial-gradient(circle, rgba(123,47,247,0.25), transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
            className="w-16 h-16 rounded-2xl icon-sunset flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '0 0 30px rgba(255,122,24,0.4)' }}>
            <span className="text-2xl">🤟</span>
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
          <p style={{ color: '#C9C9D6' }}>Sign in to your Elysia account</p>
        </div>

        <div className="glass-card p-8 space-y-5" style={{ boxShadow: '0 0 40px rgba(255,122,24,0.08)' }}>
          {/* Google */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleGoogle} disabled={gLoading} id="google-signin-btn"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-white font-medium transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
            {gLoading ? <RiLoader4Line size={18} className="animate-spin" style={{ color: '#C9C9D6' }} /> : <RiGoogleFill size={18} style={{ color: '#FF4D9D' }} />}
            <span style={{ color: '#C9C9D6' }}>{gLoading ? 'Redirecting…' : 'Continue with Google'}</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: 'rgba(201,201,214,0.5)' }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div className="relative">
              <RiMailLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(201,201,214,0.5)' }} />
              <input id="email-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" className="input-neon pl-10" autoComplete="email" required />
            </div>
            <div className="relative">
              <RiLockLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(201,201,214,0.5)' }} />
              <input id="password-input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" className="input-neon pl-10 pr-10" autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'rgba(201,201,214,0.5)' }}>
                {showPass ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" id="signin-submit-btn" disabled={loading}
              className="btn-neon w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><RiLoader4Line size={16} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-sm" style={{ color: 'rgba(201,201,214,0.6)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: '#FF7A18' }}>Create one free</Link>
          </p>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: 'rgba(201,201,214,0.3)' }}>
          Secured by <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline">Supabase</a>
        </p>
      </motion.div>
    </div>
  )
}
