-- ═══════════════════════════════════════════════════════════════════════════
-- Elysia – AI Sign Language Translator
-- Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO USE:
--   1. Open https://supabase.com/dashboard
--   2. Select your project
--   3. Go to SQL Editor → New query
--   4. Paste this entire file and click Run
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─── 1. users ─────────────────────────────────────────────────────────────────
-- Public profile data linked 1-to-1 with auth.users.
-- Row is created automatically by a trigger when a new auth user signs up.

CREATE TABLE IF NOT EXISTS public.users (
  id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT        NOT NULL,
  display_name       TEXT,
  avatar_url         TEXT,
  total_translations INTEGER     NOT NULL DEFAULT 0,
  total_sessions     INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security: users can only see / edit their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: insert own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users: update own" ON public.users
  FOR UPDATE USING (auth.uid() = id);


-- ─── 2. translations ──────────────────────────────────────────────────────────
-- Each row = one recognized gesture confirmed during a session.

CREATE TABLE IF NOT EXISTS public.translations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recognized_text     TEXT        NOT NULL,
  translated_language TEXT        NOT NULL DEFAULT 'en-US',
  confidence_score    FLOAT,
  gesture_name        TEXT,
  session_id          UUID,       -- references history(id), nullable for offline use
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS translations_user_id_idx    ON public.translations(user_id);
CREATE INDEX IF NOT EXISTS translations_session_id_idx ON public.translations(session_id);
CREATE INDEX IF NOT EXISTS translations_created_at_idx ON public.translations(created_at DESC);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translations: select own" ON public.translations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "translations: insert own" ON public.translations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "translations: delete own" ON public.translations
  FOR DELETE USING (auth.uid() = user_id);


-- ─── 3. history ───────────────────────────────────────────────────────────────
-- Each row = one translation session (open translator → close translator).

CREATE TABLE IF NOT EXISTS public.history (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_sentence  TEXT,
  total_gestures INTEGER     NOT NULL DEFAULT 0,
  language       TEXT        NOT NULL DEFAULT 'en-US',
  session_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS history_user_id_idx    ON public.history(user_id);
CREATE INDEX IF NOT EXISTS history_created_at_idx ON public.history(created_at DESC);

ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "history: select own" ON public.history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "history: insert own" ON public.history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "history: update own" ON public.history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "history: delete own" ON public.history
  FOR DELETE USING (auth.uid() = user_id);


-- ─── 4. favorites ─────────────────────────────────────────────────────────────
-- User-bookmarked gestures.

CREATE TABLE IF NOT EXISTS public.favorites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gesture_name TEXT        NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, gesture_name)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites: select own" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites: insert own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites: update own" ON public.favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "favorites: delete own" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);


-- ─── 5. Auto-create profile trigger ──────────────────────────────────────────
-- When a new user signs up via Supabase Auth, automatically create their
-- profile row in public.users.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop if it already exists to allow re-running this script safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 6. updated_at trigger ────────────────────────────────────────────────────
-- Automatically set updated_at on every UPDATE of the users table.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── 7. RPC helpers ───────────────────────────────────────────────────────────
-- Called by the app to safely increment counter columns server-side,
-- avoiding read-modify-write race conditions.

CREATE OR REPLACE FUNCTION public.increment_translations(user_id_arg UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.users
  SET total_translations = total_translations + 1,
      updated_at = NOW()
  WHERE id = user_id_arg;
$$;

CREATE OR REPLACE FUNCTION public.increment_sessions(user_id_arg UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.users
  SET total_sessions = total_sessions + 1,
      updated_at = NOW()
  WHERE id = user_id_arg;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- Done! Your Elysia database is ready.
-- Next steps:
--   1. Copy VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from
--      Supabase Dashboard → Project Settings → API
--   2. Paste them into your frontend/.env file
--   3. (Optional) Enable Google OAuth:
--      Authentication → Providers → Google → Enable
-- ═══════════════════════════════════════════════════════════════════════════
