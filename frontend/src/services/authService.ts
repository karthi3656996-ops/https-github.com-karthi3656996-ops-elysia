/**
 * Authentication Service
 * Wraps all Supabase Auth operations in clean, typed helpers.
 * Import these functions wherever auth actions are needed — never call
 * supabase.auth directly from components.
 */

import { supabase } from '@services/supabase'
import type { AuthError, Session, User } from '@supabase/supabase-js'

// ─── Return type helpers ──────────────────────────────────────────────────────

interface AuthResult {
  user: User | null
  session: Session | null
  error: AuthError | null
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * Supabase automatically sends a confirmation email (configure in dashboard).
 * After sign-up, a trigger creates a corresponding row in public.users.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Store display_name in user metadata so the trigger can use it
      data: { display_name: displayName, full_name: displayName },
    },
  })
  return { user: data.user, session: data.session, error }
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

/** Sign in an existing user with email + password. */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, session: data.session, error }
}

/**
 * Initiate Google OAuth sign-in.
 * Redirects the user to Google, then back to /auth/callback.
 * Supabase handles the token exchange automatically.
 *
 * Configure in Supabase Dashboard:
 *   Authentication → Providers → Google → Enable → add Client ID + Secret
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // After OAuth, redirect back to the app
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { error }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

/** Sign out the current user and clear the local session. */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ─── Session Helpers ──────────────────────────────────────────────────────────

/** Get the current active session (if any). Returns null if not logged in. */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Get the currently authenticated user (if any). */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user
}

/**
 * Subscribe to auth state changes (login, logout, token refresh, etc.)
 * Call unsubscribe() when the component unmounts to prevent memory leaks.
 *
 * @example
 *   const { unsubscribe } = onAuthStateChange((user, session) => { ... })
 *   useEffect(() => () => unsubscribe(), [])
 */
export function onAuthStateChange(
  callback: (user: User | null, session: Session | null) => void,
) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session)
  })
  return { unsubscribe: () => data.subscription.unsubscribe() }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

/** Send a password reset email to the given address. */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  return { error }
}
