import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiGoogleFill, RiMailLine, RiLockLine, RiUserLine, RiLoader4Line, RiCheckLine } from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [success, setSuccess]   = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#FF4D9D', '#FF7A18', '#22c55e']

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Please enter your name')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await signUpWithEmail(email.trim(), password, name.trim())
      setSuccess(true)
      toast.success('Account created! Check your email 📬')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    try { await signInWithGoogle() }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Google sign in failed'); setGLoading(false) }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="glass-card p-10 text-center space-y-5">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <RiCheckLine size={28} style={{ color: '#22c55e' }} />
          </motion.div>
          <h2 className="font-display font-bold text-2xl text-white">Verify your email</h2>
          <p style={{ color: '#C9C9D6' }}>
            We sent a confirmation link to <span style={{ color: '#FF7A18' }}>{email}</span>. Click it to activate your account.
          </p>
          <Link to="/login"><button className="btn-neon w-full py-3">Go to Sign In</button></Link>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      <div className="glow-orb w-80 h-80 top-10 right-[-80px]" style={{ background: 'radial-gradient(circle, rgba(255,77,157,0.2), transparent 70%)' }} />
      <div className="glow-orb w-72 h-72 bottom-10 left-[-60px]" style={{ background: 'radial-gradient(circle, rgba(123,47,247,0.2), transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
            className="w-16 h-16 rounded-2xl icon-aurora flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '0 0 30px rgba(255,77,157,0.4)' }}>
            <span className="text-2xl">✨</span>
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create your account</h1>
          <p style={{ color: '#C9C9D6' }}>Free forever. No credit card required.</p>
        </div>

        <div className="glass-card p-8 space-y-5" style={{ boxShadow: '0 0 40px rgba(123,47,247,0.08)' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleGoogle} disabled={gLoading} id="google-register-btn"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#C9C9D6' }}>
            {gLoading ? <RiLoader4Line size={18} className="animate-spin" /> : <RiGoogleFill size={18} style={{ color: '#FF4D9D' }} />}
            {gLoading ? 'Redirecting…' : 'Continue with Google'}
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: 'rgba(201,201,214,0.5)' }}>or create with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <RiUserLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(201,201,214,0.5)' }} />
              <input id="name-input" type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" className="input-neon pl-10" autoComplete="name" required />
            </div>
            <div className="relative">
              <RiMailLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(201,201,214,0.5)' }} />
              <input id="email-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" className="input-neon pl-10" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <RiLockLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(201,201,214,0.5)' }} />
                <input id="password-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)" className="input-neon pl-10" autoComplete="new-password" required />
              </div>
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1,2,3].map(lvl => (
                      <div key={lvl} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: lvl <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                </motion.div>
              )}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" id="register-submit-btn" disabled={loading}
              className="btn-neon w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><RiLoader4Line size={16} className="animate-spin" /> Creating account…</> : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm" style={{ color: 'rgba(201,201,214,0.6)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#FF7A18' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
