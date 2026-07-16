/**
 * Translation Service
 * All CRUD operations for the `public.translations` table.
 * Each row represents one recognized gesture/word during a session.
 * RLS: users can only read/insert/delete their own rows.
 */

import { supabase } from '@services/supabase'
import type { TranslationRow } from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────

export interface SaveTranslationPayload {
  recognized_text:     string
  translated_language?: string   // defaults to 'en-US'
  confidence_score?:   number
  gesture_name?:       string
  session_id?:         string
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save a single recognized gesture to the translations table.
 * Should be called every time a gesture is confirmed (held for 1.5s).
 *
 * @returns The saved row, or null on failure.
 */
export async function saveTranslation(
  userId: string,
  payload: SaveTranslationPayload,
): Promise<TranslationRow | null> {
  const { data, error } = await supabase
    .from('translations')
    .insert({
      user_id:             userId,
      recognized_text:     payload.recognized_text,
      translated_language: payload.translated_language ?? 'en-US',
      confidence_score:    payload.confidence_score    ?? null,
      gesture_name:        payload.gesture_name        ?? null,
      session_id:          payload.session_id          ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[translationService] saveTranslation error:', error.message)
    return null
  }

  return data
}

/**
 * Fetch the N most recent translations for a user.
 * Ordered by created_at DESC (newest first).
 */
export async function getRecentTranslations(
  userId: string,
  limit = 50,
): Promise<TranslationRow[]> {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[translationService] getRecentTranslations error:', error.message)
    return []
  }

  return data ?? []
}

/**
 * Fetch all translations that belong to a specific history session.
 */
export async function getSessionTranslations(
  sessionId: string,
): Promise<TranslationRow[]> {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[translationService] getSessionTranslations error:', error.message)
    return []
  }

  return data ?? []
}

/**
 * Get aggregated translation stats for dashboard display.
 * Returns total count, a top-gestures breakdown, and daily counts for the last 7 days.
 */
export async function getTranslationStats(userId: string): Promise<{
  total: number
  topGestures: Array<{ name: string; count: number }>
  daily: Array<{ date: string; count: number }>
}> {
  // Total count
  const { count: total } = await supabase
    .from('translations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // All rows to compute top gestures + daily (Supabase free tier doesn't have group-by)
  const { data: rows } = await supabase
    .from('translations')
    .select('gesture_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500)   // generous window for stats

  const gestureMap: Record<string, number> = {}
  const dayMap: Record<string, number> = {}

  for (const row of rows ?? []) {
    // Top gestures
    if (row.gesture_name) {
      gestureMap[row.gesture_name] = (gestureMap[row.gesture_name] ?? 0) + 1
    }

    // Daily breakdown — only last 7 days
    const date = new Date(row.created_at)
    const dayAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (date.getTime() >= dayAgo) {
      const key = date.toLocaleDateString('en-US', { weekday: 'short' })
      dayMap[key] = (dayMap[key] ?? 0) + 1
    }
  }

  const topGestures = Object.entries(gestureMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const daily = days.map(d => ({ date: d, count: dayMap[d] ?? 0 }))

  return { total: total ?? 0, topGestures, daily }
}

/**
 * Delete a single translation row by ID.
 */
export async function deleteTranslation(translationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('translations')
    .delete()
    .eq('id', translationId)

  if (error) {
    console.error('[translationService] deleteTranslation error:', error.message)
    return false
  }

  return true
}

/**
 * Delete all translations for a user (for account reset / GDPR).
 */
export async function clearAllTranslations(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('translations')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('[translationService] clearAllTranslations error:', error.message)
    return false
  }

  return true
}
