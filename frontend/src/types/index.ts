// ─────────────────────────────────────────────────────────────────────────────
// Core Domain Types
// ─────────────────────────────────────────────────────────────────────────────

/** A single MediaPipe hand landmark point */
export interface Landmark {
  x: number
  y: number
  z: number
}

/** Result of gesture classification */
export interface GestureResult {
  gesture: string
  confidence: number
  normalized?: Landmark[]
}

/** A training sample stored for KNN */
export interface TrainingSample {
  label: string
  landmarks: Landmark[]
  timestamp: number
}

/** Stats about a trained gesture */
export interface GestureStat {
  name: string
  count: number
}

/** MediaPipe Hands results */
export interface MediaPipeResults {
  multiHandLandmarks?: Landmark[][]
  multiHandedness?: Array<{ label: string; score: number }>
}

// ─────────────────────────────────────────────────────────────────────────────
// App Settings
// ─────────────────────────────────────────────────────────────────────────────

export type SubtitleSize = 'small' | 'medium' | 'large'
export type AppTheme = 'dark' | 'light'

export interface AppSettings {
  theme: AppTheme
  voiceEnabled: boolean
  voiceRate: number
  voicePitch: number
  voiceVolume: number
  selectedVoice: string
  confidenceThreshold: number
  smoothingFrames: number
  subtitleSize: SubtitleSize
  autoSpeak: boolean
  language: string
}

// ─────────────────────────────────────────────────────────────────────────────
// User & Auth
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string
  totalTranslations: number
  totalSessions: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation History
// ─────────────────────────────────────────────────────────────────────────────

export interface TranslationEntry {
  id: string
  userId: string
  sentence: string
  gestures: string[]
  duration: number        // seconds
  timestamp: number       // unix ms
  language: string
}

export interface TranslationSession {
  id: string
  userId: string
  entries: TranslationEntry[]
  startedAt: number
  endedAt: number
  totalGestures: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Gesture Library
// ─────────────────────────────────────────────────────────────────────────────

export type GestureCategory =
  | 'alphabet'
  | 'numbers'
  | 'greetings'
  | 'emotions'
  | 'common'
  | 'emergency'

export interface GestureLibraryItem {
  id: string
  name: string
  emoji: string
  category: GestureCategory
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  handShape: string
  tips: string
  builtin: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard / Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyStats {
  date: string       // "YYYY-MM-DD"
  gestures: number
  sessions: number
  topGesture: string
}

export interface DashboardData {
  totalTranslations: number
  totalSessions: number
  totalGestures: number
  streak: number
  weeklyStats: DailyStats[]
  topGestures: Array<{ name: string; count: number }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat / AI Assistant
// ─────────────────────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Call
// ─────────────────────────────────────────────────────────────────────────────

export interface PeerTranslation {
  text: string
  time: string
}

export type ConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'

// ─────────────────────────────────────────────────────────────────────────────
// Component Prop Helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface WithClassName {
  className?: string
}

export interface WithChildren {
  children: React.ReactNode
}
