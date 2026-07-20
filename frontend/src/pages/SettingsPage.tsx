import { motion } from 'framer-motion'
import { RiSettings3Line, RiVolumeUpLine, RiPaletteLine, RiCpuLine, RiRefreshLine, RiSunLine, RiMoonLine } from 'react-icons/ri'
import toast from 'react-hot-toast'
import { useSettings } from '@hooks/useSettings'
import { speechService } from '@services/speechService'
import { useState, useEffect } from 'react'
import type { AppSettings } from '@/types'

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl icon-sunset flex items-center justify-center" style={{ boxShadow: '0 0 14px rgba(255,122,24,0.3)' }}>
          <Icon size={16} className="text-white" />
        </div>
        <h2 className="font-display font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, onChange, displayValue }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; displayValue?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm" style={{ color: '#C9C9D6' }}>{label}</label>
        <span className="text-xs font-mono font-semibold" style={{ color: '#FF7A18' }}>{displayValue ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #FF7A18 ${pct}%, rgba(255,255,255,0.1) 0%)` }} />
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const load = () => setVoices(speechService?.getVoices() ?? [])
    load()
    window.speechSynthesis?.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load)
  }, [])

  const testVoice = () => {
    speechService?.updateSettings({ rate: settings.voiceRate, pitch: settings.voicePitch, volume: settings.voiceVolume, voiceName: settings.selectedVoice, lang: settings.language })
    speechService?.speak('Hello! This is how Elysia sounds when translating your gestures.')
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 relative overflow-hidden">
      <div className="glow-orb w-96 h-96 top-0 right-0 opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.4), transparent 70%)' }} />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl icon-sunset flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(255,122,24,0.4)' }}>
              <RiSettings3Line size={18} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white"><span className="text-gradient">Settings</span></h1>
          </div>
          <p className="ml-13" style={{ color: '#C9C9D6' }}>Customize your Elysia experience</p>
        </motion.div>

        <div className="space-y-5">
          <Section title="Appearance" icon={RiPaletteLine}>
            <div>
              <p className="text-sm mb-3" style={{ color: '#C9C9D6' }}>Theme</p>
              <div className="flex gap-3">
                {[{ value: 'dark', icon: RiMoonLine, label: 'Dark' }, { value: 'light', icon: RiSunLine, label: 'Light' }].map(({ value, icon: Icon, label }) => (
                  <button key={value} onClick={() => updateSetting('theme', value as AppSettings['theme'])}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: settings.theme === value ? 'rgba(255,122,24,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${settings.theme === value ? 'rgba(255,122,24,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      color: settings.theme === value ? '#FF9A50' : '#C9C9D6',
                    }}>
                    <Icon size={16} />{label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm mb-3" style={{ color: '#C9C9D6' }}>Subtitle Text Size</p>
              <div className="flex gap-3">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button key={size} onClick={() => updateSetting('subtitleSize', size)}
                    className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                    style={{
                      background: settings.subtitleSize === size ? 'rgba(255,122,24,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${settings.subtitleSize === size ? 'rgba(255,122,24,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      color: settings.subtitleSize === size ? '#FF9A50' : '#C9C9D6',
                    }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Voice & Speech" icon={RiVolumeUpLine}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Auto-speak translations</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(201,201,214,0.5)' }}>Automatically speak recognized gestures</p>
              </div>
              <button id="auto-speak-toggle" onClick={() => updateSetting('autoSpeak', !settings.autoSpeak)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: settings.autoSpeak ? '#FF7A18' : 'rgba(255,255,255,0.15)' }}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.autoSpeak ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {voices.length > 0 && (
              <div>
                <p className="text-sm mb-2" style={{ color: '#C9C9D6' }}>Voice</p>
                <select value={settings.selectedVoice} onChange={e => updateSetting('selectedVoice', e.target.value)} className="input-neon">
                  <option value="">Default Voice</option>
                  {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              </div>
            )}
            <SliderRow label="Speed" value={settings.voiceRate} min={0.5} max={2} step={0.1} onChange={v => updateSetting('voiceRate', v)} displayValue={`${settings.voiceRate}x`} />
            <SliderRow label="Pitch" value={settings.voicePitch} min={0.5} max={2} step={0.1} onChange={v => updateSetting('voicePitch', v)} displayValue={`${settings.voicePitch}`} />
            <SliderRow label="Volume" value={settings.voiceVolume} min={0} max={1} step={0.05} onChange={v => updateSetting('voiceVolume', v)} displayValue={`${Math.round(settings.voiceVolume * 100)}%`} />
            <button id="test-voice-btn" onClick={testVoice} className="btn-outline w-full flex items-center justify-center gap-2">
              <RiVolumeUpLine size={18} /> Test Voice
            </button>
          </Section>

          <Section title="AI Recognition" icon={RiCpuLine}>
            <SliderRow label="Confidence Threshold" value={settings.confidenceThreshold} min={0.5} max={0.99} step={0.01}
              onChange={v => updateSetting('confidenceThreshold', v)} displayValue={`${Math.round(settings.confidenceThreshold * 100)}%`} />
            <p className="text-xs" style={{ color: 'rgba(201,201,214,0.4)' }}>Higher = fewer false positives. Lower = more sensitive. Recommended: 75%</p>
          </Section>

          <div className="glass-card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Reset All Settings</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(201,201,214,0.5)' }}>Restore all settings to their defaults</p>
            </div>
            <button id="reset-settings-btn" onClick={() => { resetSettings(); toast.success('Settings reset') }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ border: '1px solid rgba(255,77,157,0.3)', background: 'rgba(255,77,157,0.1)', color: '#FF4D9D' }}>
              <RiRefreshLine size={16} /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
