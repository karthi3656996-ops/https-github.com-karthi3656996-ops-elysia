import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  RiToggleLine, RiToggleFill, RiVolumeUpLine, RiVolumeMuteLine,
  RiDeleteBinLine, RiDownloadLine, RiLoader4Line,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import CameraFeed from '@components/features/CameraFeed'
import SubtitleBar from '@components/features/SubtitleBar'
import ConfidenceIndicator from '@components/features/ConfidenceIndicator'
import { useGestureClassifier } from '@hooks/useGestureClassifier'
import { useSentenceBuilder } from '@hooks/useSentenceBuilder'
import { speechService } from '@services/speechService'
import { useSettings } from '@hooks/useSettings'
import { useAuth } from '@store/AuthContext'
import { saveTranslation } from '@services/translationService'
import { createSession, closeSession } from '@services/historyService'
import type { Landmark, GestureResult } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────

interface DetectionRecord {
  gesture:    string
  confidence: number
  time:       string
  saved:      boolean   // true once persisted to Supabase
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TranslatePage() {
  const { settings }      = useSettings()
  const { user }          = useAuth()
  const { classify }      = useGestureClassifier()
  const {
    sentence, currentWord,
    processGesture, clearSentence, getHoldProgress,
  } = useSentenceBuilder()

  // ── UI state ────────────────────────────────────────────────────────────────
  const [aiEnabled,    setAiEnabled]    = useState(true)
  const [voiceMuted,   setVoiceMuted]   = useState(!settings.voiceEnabled)
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)
  const [confidence,   setConfidence]   = useState(0)
  const [history,      setHistory]      = useState<DetectionRecord[]>([])
  const [saving,       setSaving]       = useState(false)

  // ── Supabase session tracking ────────────────────────────────────────────────
  const sessionIdRef       = useRef<string | null>(null)
  const confirmedWordCount = useRef(0)
  const lastSpokenRef      = useRef('')
  const lastGestureRef     = useRef<string | null>(null)
  const prevSentenceRef    = useRef('')

  // ── Open a Supabase history session when the page mounts ───────────────────
  useEffect(() => {
    if (!user) return
    createSession(user.id, settings.language).then(session => {
      if (session) sessionIdRef.current = session.id
    })

    // Close the session when the user leaves this page
    return () => {
      if (sessionIdRef.current && user) {
        void closeSession(
          sessionIdRef.current,
          prevSentenceRef.current,
          confirmedWordCount.current,
        )
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Auto-speak on sentence change ──────────────────────────────────────────
  useEffect(() => {
    if (settings.autoSpeak && !voiceMuted && sentence && sentence !== lastSpokenRef.current) {
      lastSpokenRef.current = sentence
      prevSentenceRef.current = sentence
      speechService?.updateSettings({
        rate: settings.voiceRate, pitch: settings.voicePitch,
        volume: settings.voiceVolume, voiceName: settings.selectedVoice, lang: settings.language,
      })
      speechService?.speak(sentence)
    }
  }, [sentence, settings, voiceMuted])

  // ── Gesture detection callback ─────────────────────────────────────────────
  const handleResults = useCallback(
    ({ landmarks }: { landmarks: Landmark[] | null }) => {
      if (!aiEnabled || !landmarks) {
        setCurrentGesture(null); setConfidence(0); processGesture(null)
        return
      }

      const result: GestureResult | null = classify(landmarks, settings.confidenceThreshold)

      if (result) {
        setCurrentGesture(result.gesture)
        setConfidence(result.confidence)
        processGesture(result.gesture)

        // Add to local history (dedup same gesture consecutively)
        if (result.gesture !== lastGestureRef.current) {
          lastGestureRef.current = result.gesture
          setHistory(prev => [
            { gesture: result.gesture, confidence: result.confidence, time: new Date().toLocaleTimeString(), saved: false },
            ...prev.slice(0, 49),
          ])
        }
      } else {
        setCurrentGesture(null); setConfidence(0); processGesture(null)
      }
    },
    [aiEnabled, classify, processGesture, settings.confidenceThreshold],
  )

  // ── Save to Supabase once sentence updates ─────────────────────────────────
  // We watch sentence: whenever a new word is appended, save that word.
  const prevWordCountRef = useRef(0)
  useEffect(() => {
    if (!user || !sentence) return
    const words = sentence.trim().split(' ').filter(Boolean)
    if (words.length <= prevWordCountRef.current) return   // no new word added

    prevWordCountRef.current = words.length
    const latestWord = words[words.length - 1]
    confirmedWordCount.current++

    // Fire-and-forget save — show a subtle "saved" indicator
    setSaving(true)
    saveTranslation(user.id, {
      recognized_text:     latestWord,
      translated_language: settings.language,
      confidence_score:    confidence,
      gesture_name:        latestWord,
      session_id:          sessionIdRef.current ?? undefined,
    }).then(saved => {
      if (saved) {
        // Mark that history entry as saved
        setHistory(prev =>
          prev.map((h, i) => (i === 0 || h.gesture === latestWord ? { ...h, saved: true } : h))
        )
      }
      setSaving(false)
    })
  }, [sentence, user, confidence, settings.language])

  // ── Clear handler ──────────────────────────────────────────────────────────
  const handleClear = () => {
    clearSentence()
    lastSpokenRef.current = ''
    prevSentenceRef.current = ''
    prevWordCountRef.current = 0
    confirmedWordCount.current = 0
  }

  // ── Export history ─────────────────────────────────────────────────────────
  const exportHistory = () => {
    const lines = history.map(h => `[${h.time}] ${h.gesture} (${Math.round(h.confidence * 100)}%)`).join('\n')
    const blob  = new Blob([lines], { type: 'text/plain' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href = url; a.download = 'elysia-translation-history.txt'; a.click()
    URL.revokeObjectURL(url); toast.success('History exported!')
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-3xl text-white mb-1">
                Live <span className="text-gradient">Gesture Translator</span>
              </h1>
              <p className="text-gray-500">Show your hand gestures to the camera and watch them come to life</p>
            </div>

            {/* Save indicator */}
            {saving && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                <RiLoader4Line size={12} className="animate-spin" />
                Saving…
              </motion.div>
            )}
          </div>

          {/* Guest notice */}
          {!user && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 px-3 py-2 rounded-xl w-fit">
              <span>💡</span>
              <span>
                <a href="/login" className="text-purple-400 hover:underline">Sign in</a> to save your translations and access history
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: camera + subtitle + controls */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <CameraFeed onResults={handleResults} enabled={aiEnabled} showFps />
            </motion.div>

            <SubtitleBar
              sentence={sentence}
              currentWord={currentWord}
              holdProgress={getHoldProgress()}
              onClear={handleClear}
            />

            {/* Control buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="ai-toggle"
                onClick={() => { setAiEnabled(v => !v); toast(aiEnabled ? 'AI paused' : 'AI started', { icon: aiEnabled ? '⏸️' : '▶️' }) }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                  aiEnabled
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {aiEnabled ? <RiToggleFill size={20} /> : <RiToggleLine size={20} />}
                AI {aiEnabled ? 'ON' : 'OFF'}
              </button>

              <button
                id="voice-toggle"
                onClick={() => { setVoiceMuted(v => !v); if (!voiceMuted) speechService?.stop() }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                  !voiceMuted
                    ? 'bg-green-600/20 border-green-500/40 text-green-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {voiceMuted ? <RiVolumeMuteLine size={18} /> : <RiVolumeUpLine size={18} />}
                Voice {voiceMuted ? 'OFF' : 'ON'}
              </button>

              {history.length > 0 && (
                <button
                  onClick={exportHistory}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-gray-200 text-sm transition-all"
                >
                  <RiDownloadLine size={16} /> Export
                </button>
              )}
            </div>
          </div>

          {/* Right: confidence + tips + history */}
          <div className="space-y-4">
            <ConfidenceIndicator
              gesture={currentGesture}
              confidence={confidence}
              isDetecting={aiEnabled}
            />

            {/* Quick tips */}
            <div className="glass-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Tips</p>
              <ul className="space-y-2 text-sm text-gray-400">
                {[
                  'Keep hand in frame, well-lit',
                  'Hold gesture 1.5s to confirm word',
                  'Pause 3s between sentences',
                  'Train custom gestures in Train AI',
                  user ? '✓ Translations saving to your account' : 'Sign in to save history',
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">→</span>
                    <span className={tip.startsWith('✓') ? 'text-green-400' : ''}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detection history */}
            <div className="glass-card p-4 flex flex-col max-h-80">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Detection Log</p>
                {history.length > 0 && (
                  <button onClick={() => setHistory([])} className="text-gray-600 hover:text-red-400 transition-colors">
                    <RiDeleteBinLine size={14} />
                  </button>
                )}
              </div>

              <div className="overflow-y-auto gesture-scroll space-y-1.5 flex-1">
                {history.length === 0 ? (
                  <p className="text-gray-600 text-xs italic text-center py-4">No gestures detected yet</p>
                ) : (
                  history.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.03] hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-gray-300 font-medium">{item.gesture}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-400">{Math.round(item.confidence * 100)}%</span>
                        {user && (
                          <span className={`text-[10px] ${item.saved ? 'text-green-600' : 'text-gray-700'}`}>
                            {item.saved ? '✓' : '…'}
                          </span>
                        )}
                        <span className="text-xs text-gray-600">{item.time}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
