import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AppSettings } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  voiceEnabled: true,
  voiceRate: 1,
  voicePitch: 1,
  voiceVolume: 1,
  selectedVoice: '',
  confidenceThreshold: 0.75,
  smoothingFrames: 10,
  subtitleSize: 'medium',
  autoSpeak: true,
  language: 'en-US',
}

interface SettingsContextValue {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('elysia-settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    localStorage.setItem('elysia-settings', JSON.stringify(settings))
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => setSettings(DEFAULT_SETTINGS)

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
