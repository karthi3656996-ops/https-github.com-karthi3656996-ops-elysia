/**
 * User Profile Service
 * All CRUD operations for the `public.users` table.
 * RLS ensures users can only read/write their own row.
 */

import { supabase } from '@services/supabase'
import type { UserRow } from '@/types/database'
import type { User } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a single user profile from public.users by ID.
 * Returns null if no profile exists yet.
 */
export async function getUserProfile(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // PGRST116 = row not found — not a real error
    if (error.code === 'PGRST116') return null
    console.error('[userService] getUserProfile error:', error.message)
    return null
  }

  return data
}

/**
 * Create a new profile row for a freshly registered user.
 * Called automatically by AuthContext on first sign-in if no row exists.
 * The database trigger handles this too, but this is a safety fallback.
 */
export async function createUserProfile(supabaseUser: User): Promise<UserRow | null> {
  const meta = supabaseUser.user_metadata ?? {}

  const newProfile = {
    id:                 supabaseUser.id,
    email:              supabaseUser.email ?? '',
    display_name:       (meta.full_name as string | undefined) ??
                        (meta.display_name as string | undefined) ??
                        (meta.name as string | undefined) ??
                        null,
    avatar_url:         (meta.avatar_url as string | undefined) ??
                        (meta.picture as string | undefined) ??
                        null,
    total_translations: 0,
    total_sessions:     0,
  }

  const { data, error } = await supabase
    .from('users')
    .insert(newProfile)
    .select()
    .single()

  if (error) {
    // 23505 = unique violation — profile already exists (race condition)
    if (error.code === '23505') return getUserProfile(supabaseUser.id)
    console.error('[userService] createUserProfile error:', error.message)
    return null
  }

  return data
}

/**
 * Upsert a user profile — creates it if missing, updates it if it exists.
 * Safe to call on every login.
 */
export async function upsertUserProfile(supabaseUser: User): Promise<UserRow | null> {
  const meta = supabaseUser.user_metadata ?? {}

  const profile = {
    id:          supabaseUser.id,
    email:       supabaseUser.email ?? '',
    display_name:
      (meta.full_name as string | undefined) ??
      (meta.display_name as string | undefined) ??
      (meta.name as string | undefined) ??
      null,
    avatar_url:
      (meta.avatar_url as string | undefined) ??
      (meta.picture as string | undefined) ??
      null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('[userService] upsertUserProfile error:', error.message)
    return null
  }

  return data
}

/**
 * Update mutable fields of the user's profile (display name, avatar).
 */
export async function updateUserProfile(
  userId: string,
  updates: { display_name?: string; avatar_url?: string },
): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('[userService] updateUserProfile error:', error.message)
    return null
  }

  return data
}

/**
 * Increment the translation counter for a user.
 * Called every time a sentence is saved.
 */
export async function incrementTranslationCount(userId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_translations', { user_id_arg: userId })
  if (error) console.error('[userService] incrementTranslationCount error:', error.message)
}

/**
 * Increment the session counter for a user.
 * Called when a new history session is created.
 */
export async function incrementSessionCount(userId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_sessions', { user_id_arg: userId })
  if (error) console.error('[userService] incrementSessionCount error:', error.message)
}
