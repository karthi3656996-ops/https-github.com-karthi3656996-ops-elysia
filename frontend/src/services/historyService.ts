/**
 * History Service
 * All CRUD operations for the `public.history` table.
 * A "history" row represents one complete translation session
 * (the user opens Translate, signs, and closes — that's one session).
 * RLS: users can only access their own history rows.
 */

import { supabase } from '@services/supabase'
import type { HistoryRow } from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new translation session row.
 * Call this when the user opens the Translate page.
 * Store the returned session ID and attach it to all `translations` rows.
 *
 * @returns The created session row (with its auto-generated UUID), or null.
 */
export async function createSession(
  userId: string,
  language = 'en-US',
): Promise<HistoryRow | null> {
  const { data, error } = await supabase
    .from('history')
    .insert({
      user_id:       userId,
      language,
      total_gestures: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('[historyService] createSession error:', error.message)
    return null
  }

  return data
}

/**
 * Close an existing session by recording the end time, total gesture count,
 * and the full assembled sentence.
 *
 * @param sessionId   UUID of the open session
 * @param fullSentence  The complete space-joined translation
 * @param totalGestures How many gestures were confirmed in this session
 */
export async function closeSession(
  sessionId: string,
  fullSentence: string,
  totalGestures: number,
): Promise<HistoryRow | null> {
  const { data, error } = await supabase
    .from('history')
    .update({
      full_sentence:  fullSentence,
      total_gestures: totalGestures,
      session_end:    new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('[historyService] closeSession error:', error.message)
    return null
  }

  return data
}

/**
 * Fetch recent history rows for a user (paginated).
 * Returns sessions ordered newest → oldest.
 *
 * @param limit  Number of sessions to fetch (default 20)
 * @param offset For pagination — skip this many rows
 */
export async function getHistory(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<HistoryRow[]> {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[historyService] getHistory error:', error.message)
    return []
  }

  return data ?? []
}

/**
 * Fetch a single session row by its ID.
 */
export async function getSession(sessionId: string): Promise<HistoryRow | null> {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('[historyService] getSession error:', error.message)
    return null
  }

  return data
}

/**
 * Get the total number of sessions for a user (for dashboard stats).
 */
export async function getSessionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('[historyService] getSessionCount error:', error.message)
    return 0
  }

  return count ?? 0
}

/**
 * Delete a session (and its associated translations via FK cascade).
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('history')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('[historyService] deleteSession error:', error.message)
    return false
  }

  return true
}
