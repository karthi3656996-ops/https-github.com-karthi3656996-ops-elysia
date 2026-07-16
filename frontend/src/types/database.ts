/**
 * Supabase Database Type Definitions
 * These types mirror the exact schema created in supabase-schema.sql.
 * Pass this as the generic to createClient<Database> for end-to-end type safety.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      /** Stores public user profile data, linked 1-to-1 with auth.users */
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          total_translations: number
          total_sessions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          total_translations?: number
          total_sessions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          total_translations?: number
          total_sessions?: number
          updated_at?: string
        }
      }

      /**
       * Each row = one recognized gesture / word during a translation session.
       * Linked to a user and optionally to a history session row.
       */
      translations: {
        Row: {
          id: string
          user_id: string
          recognized_text: string
          translated_language: string
          confidence_score: number | null
          gesture_name: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recognized_text: string
          translated_language?: string
          confidence_score?: number | null
          gesture_name?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          recognized_text?: string
          translated_language?: string
          confidence_score?: number | null
        }
      }

      /**
       * Represents a complete translation session (one sitting at the translator).
       * A session can have many translations.
       */
      history: {
        Row: {
          id: string
          user_id: string
          full_sentence: string | null
          total_gestures: number
          language: string
          session_start: string
          session_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_sentence?: string | null
          total_gestures?: number
          language?: string
          session_start?: string
          session_end?: string | null
          created_at?: string
        }
        Update: {
          full_sentence?: string | null
          total_gestures?: number
          session_end?: string | null
        }
      }

      /** User-bookmarked / favourite gestures */
      favorites: {
        Row: {
          id: string
          user_id: string
          gesture_name: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gesture_name: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          notes?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── Convenience row aliases ───────────────────────────────────────────────

export type UserRow        = Database['public']['Tables']['users']['Row']
export type TranslationRow = Database['public']['Tables']['translations']['Row']
export type HistoryRow     = Database['public']['Tables']['history']['Row']
export type FavoriteRow    = Database['public']['Tables']['favorites']['Row']
