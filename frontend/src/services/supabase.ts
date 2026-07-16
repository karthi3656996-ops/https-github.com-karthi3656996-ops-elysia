import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Client Singleton
//
// Usage:
//   import { supabase } from '@services/supabase'
//
// The client is typed against our Database schema for fully type-safe queries.
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from the .env file.
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Elysia] ⚠️  Supabase env vars missing.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
    'See: https://supabase.com/dashboard → Project Settings → API'
  )
}

/**
 * Typed Supabase client — singleton, safe to import anywhere.
 * All queries are fully typed against the Database schema.
 */
export const supabase = createClient<Database>(
  supabaseUrl  ?? 'http://placeholder',
  supabaseKey  ?? 'placeholder',
  {
    auth: {
      // Persist session in localStorage (survives page refresh)
      persistSession: true,
      // Automatically refresh the JWT before it expires
      autoRefreshToken: true,
      // Detect the OAuth redirect callback on page load
      detectSessionInUrl: true,
    },
  }
)
