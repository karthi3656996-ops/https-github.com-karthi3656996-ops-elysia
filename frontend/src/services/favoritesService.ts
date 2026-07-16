/**
 * Favorites Service
 * All CRUD operations for the `public.favorites` table.
 * Lets users bookmark gestures they use frequently or want to remember.
 * RLS: users can only read/write their own favorites.
 */

import { supabase } from '@services/supabase'
import type { FavoriteRow } from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all favorite gestures for a user.
 * Ordered by most recently added first.
 */
export async function getFavorites(userId: string): Promise<FavoriteRow[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[favoritesService] getFavorites error:', error.message)
    return []
  }

  return data ?? []
}

/**
 * Add a gesture to the user's favorites.
 * If the gesture is already favorited, this is a no-op (returns existing row).
 *
 * @param gestureName  The gesture label (e.g. "Hello", "I Love You")
 * @param notes        Optional personal note about the gesture
 */
export async function addFavorite(
  userId: string,
  gestureName: string,
  notes?: string,
): Promise<FavoriteRow | null> {
  const { data, error } = await supabase
    .from('favorites')
    .upsert(
      { user_id: userId, gesture_name: gestureName, notes: notes ?? null },
      { onConflict: 'user_id, gesture_name', ignoreDuplicates: true },
    )
    .select()
    .single()

  if (error) {
    console.error('[favoritesService] addFavorite error:', error.message)
    return null
  }

  return data
}

/**
 * Remove a gesture from the user's favorites.
 */
export async function removeFavorite(
  userId: string,
  gestureName: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('gesture_name', gestureName)

  if (error) {
    console.error('[favoritesService] removeFavorite error:', error.message)
    return false
  }

  return true
}

/**
 * Check if a specific gesture is favorited by the user.
 * Efficient — only fetches count, not the full row.
 */
export async function isFavorited(
  userId: string,
  gestureName: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('gesture_name', gestureName)

  if (error) return false
  return (count ?? 0) > 0
}

/**
 * Update the notes on a favorite gesture.
 */
export async function updateFavoriteNotes(
  userId: string,
  gestureName: string,
  notes: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .update({ notes })
    .eq('user_id', userId)
    .eq('gesture_name', gestureName)

  if (error) {
    console.error('[favoritesService] updateFavoriteNotes error:', error.message)
    return false
  }

  return true
}
