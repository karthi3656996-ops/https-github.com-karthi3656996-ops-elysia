/**
 * AuthContext — Supabase Auth Provider
 *
 * Wraps the entire app and exposes:
 *  - `user`     — the Supabase User object (null if logged out)
 *  - `profile`  — the public.users row for the current user
 *  - `loading`  — true while session is being restored on first mount
 *
 * Auth methods are thin wrappers around authService.ts, re-exported here
 * for convenience so components only need to import from one place.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import {
  signInWithEmail   as _signInWithEmail,
  signUpWithEmail   as _signUpWithEmail,
  signInWithGoogle  as _signInWithGoogle,
  signOut           as _signOut,
  onAuthStateChange,
} from '@services/authService'
import {
  upsertUserProfile,
  getUserProfile,
} from '@services/userService'
import type { UserRow } from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Current Supabase auth user — null when signed out */
  user: User | null
  /** Current Supabase session — null when signed out */
  session: Session | null
  /** Hydrated public profile row from public.users */
  profile: UserRow | null
  /** True while auth state is being restored (initial page load only) */
  loading: boolean

  // ── Auth actions ──────────────────────────────────────────────────────────
  signInWithEmail:  (email: string, password: string) => Promise<void>
  signUpWithEmail:  (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout:           () => Promise<void>

  /** Manually refresh the profile from the database */
  refreshProfile: () => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Context + hook
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be called within <AuthProvider>')
  return ctx
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Profile sync ────────────────────────────────────────────────────────────

  /**
   * After login: upsert the public.users row so it always reflects
   * the latest display name / avatar from the OAuth provider.
   */
  const syncProfile = useCallback(async (authUser: User) => {
    const row = await upsertUserProfile(authUser)
    setProfile(row)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const row = await getUserProfile(user.id)
    setProfile(row)
  }, [user])

  // ── Auth state listener ─────────────────────────────────────────────────────

  useEffect(() => {
    const { unsubscribe } = onAuthStateChange(async (authUser, authSession) => {
      setUser(authUser)
      setSession(authSession)

      if (authUser) {
        await syncProfile(authUser)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [syncProfile])

  // ── Exposed auth methods ────────────────────────────────────────────────────

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await _signInWithEmail(email, password)
    if (error) throw new Error(formatAuthError(error.message))
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await _signUpWithEmail(email, password, name)
    if (error) throw new Error(formatAuthError(error.message))
  }

  const signInWithGoogle = async () => {
    const { error } = await _signInWithGoogle()
    if (error) throw new Error(formatAuthError(error.message))
    // No further action needed — onAuthStateChange fires after redirect
  }

  const logout = async () => {
    await _signOut()
    // State cleared by onAuthStateChange
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Error message formatter
// Makes raw Supabase/Postgres errors friendlier for end users
// ─────────────────────────────────────────────────────────────────────────────

function formatAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Incorrect email or password. Please try again.'
  if (message.includes('Email not confirmed'))
    return 'Please verify your email address before signing in.'
  if (message.includes('User already registered'))
    return 'An account with this email already exists.'
  if (message.includes('Password should be at least'))
    return 'Password must be at least 6 characters long.'
  if (message.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.'
  return message
}
