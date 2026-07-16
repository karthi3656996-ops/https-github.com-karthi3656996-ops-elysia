import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RiSettings3Line,
  RiVolumeUpLine,
  RiPaletteLine,
  RiCpuLine,
  RiRefreshLine,
  RiSunLine,
  RiMoonLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { useSettings } from '../hooks/useSettings'
import { speechService } from '../services/speechService'

function SettingSection({ title, icon: Icon, children }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <Icon size={16} className="text-purple-400" />
        </div>
        <h2 className="font-display font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, onChange, displayValue }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-gray-400">{label}</label>
        <span className="text-xs font-mono text-purple-300">{displayValue || value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #7C3AED ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 0%)`,
        }}
      />
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const [voices, setVoices] = useState([])

  useEffect(() => {
    const loadVoices = () => {
      const v = speechService?.getVoices() || []
      setVoices(v)
    }
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const testVoice = () => {
    speechService?.updateSettings({
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      volume: settings.voiceVolume,
      voiceName: settings.selectedVoice,
      lang: settings.language,
    })
    speechService?.speak('Hello! This is how Elysia sounds when translating your gestures.')
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <RiSettings3Line size={18} className="text-purple-400" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              <span className="text-gradient">Settings</span>
            </h1>
          </div>
          <p className="text-gray-500 ml-12">Customize your Elysia experience</p>
        </motion.div>

        <div className="space-y-5">
          {/* Appearance */}
          <SettingSection title="Appearance" icon={RiPaletteLine}>
            <div>
              <p className="text-sm text-gray-400 mb-3">Theme</p>
              <div className="flex gap-3">
                {[
                  { value: 'dark', icon: RiMoonLine, label: 'Dark' },
                  { value: 'light', icon: RiSunLine, label: 'Light' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => updateSetting('theme', value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      settings.theme === value
                        ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-3">Subtitle Text Size</p>
              <div className="flex gap-3">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('subtitleSize', size)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                      settings.subtitleSize === size
                        ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </SettingSection>

          {/* Voice */}
          <SettingSection title="Voice & Speech" icon={RiVolumeUpLine}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 font-medium">Auto-speak translations</p>
                <p className="text-xs text-gray-600 mt-0.5">Automatically speak recognized gestures</p>
              </div>
              <button
                id="auto-speak-toggle"
                onClick={() => updateSetting('autoSpeak', !settings.autoSpeak)}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.autoSpeak ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.autoSpeak ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {voices.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Voice</p>
                <select
                  value={settings.selectedVoice}
                  onChange={(e) => updateSetting('selectedVoice', e.target.value)}
                  className="input-neon"
                >
                  <option value="">Default Voice</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}

            <SliderRow
              label="Speed"
              value={settings.voiceRate}
              min={0.5}
              max={2}
              step={0.1}
              onChange={(v) => updateSetting('voiceRate', v)}
              displayValue={`${settings.voiceRate}x`}
            />
            <SliderRow
              label="Pitch"
              value={settings.voicePitch}
              min={0.5}
              max={2}
              step={0.1}
              onChange={(v) => updateSetting('voicePitch', v)}
              displayValue={`${settings.voicePitch}`}
            />
            <SliderRow
              label="Volume"
              value={settings.voiceVolume}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => updateSetting('voiceVolume', v)}
              displayValue={`${Math.round(settings.voiceVolume * 100)}%`}
            />

            <button
              id="test-voice-btn"
              onClick={testVoice}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <RiVolumeUpLine size={18} />
              Test Voice
            </button>
          </SettingSection>

          {/* AI Recognition */}
          <SettingSection title="AI Recognition" icon={RiCpuLine}>
            <SliderRow
              label="Confidence Threshold"
              value={settings.confidenceThreshold}
              min={0.5}
              max={0.99}
              step={0.01}
              onChange={(v) => updateSetting('confidenceThreshold', v)}
              displayValue={`${Math.round(settings.confidenceThreshold * 100)}%`}
            />
            <p className="text-xs text-gray-600">
              Higher = fewer false positives. Lower = more sensitive. Recommended: 75%
            </p>
          </SettingSection>

          {/* Reset */}
          <div className="glass-card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 font-medium">Reset All Settings</p>
              <p className="text-xs text-gray-600 mt-0.5">Restore all settings to their defaults</p>
            </div>
            <button
              id="reset-settings-btn"
              onClick={() => {
                resetSettings()
                toast.success('Settings reset to defaults')
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all"
            >
              <RiRefreshLine size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
