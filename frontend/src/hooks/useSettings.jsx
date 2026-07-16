import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('elysia-settings')
      return saved ? JSON.parse(saved) : {
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
    } catch {
      return {
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

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings({
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
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
