/**
 * Auth Callback Page
 * Supabase redirects here after Google OAuth completes.
 * The Supabase client automatically exchanges the URL tokens for a session.
 * We just wait for onAuthStateChange to fire, then redirect to dashboard.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiLoader4Line, RiHandHeartLine } from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (user) {
        toast.success(`Welcome, ${user.user_metadata?.full_name ?? user.email}! 👋`)
        navigate('/dashboard', { replace: true })
      } else {
        // OAuth failed or was cancelled
        toast.error('Sign in was cancelled or failed. Please try again.')
        navigate('/login', { replace: true })
      }
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center"
      >
        <RiHandHeartLine size={28} className="text-purple-400" />
      </motion.div>

      <div className="text-center space-y-2">
        <RiLoader4Line size={24} className="text-purple-400 animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Completing sign in…</p>
      </div>
    </div>
  )
}
