import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  RiToggleLine,
  RiToggleFill,
  RiVolumeUpLine,
  RiVolumeMuteLine,
  RiDeleteBinLine,
  RiDownloadLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import CameraFeed from '../components/CameraFeed'
import SubtitleBar from '../components/SubtitleBar'
import ConfidenceIndicator from '../components/ConfidenceIndicator'
import { useGestureClassifier } from '../hooks/useGestureClassifier'
import { useSentenceBuilder } from '../hooks/useSentenceBuilder'
import { speechService } from '../services/speechService'
import { useSettings } from '../hooks/useSettings'

export default function TranslatePage() {
  const { settings } = useSettings()
  const { classify } = useGestureClassifier()
  const { sentence, currentWord, processGesture, clearSentence, getHoldProgress } = useSentenceBuilder()

  const [aiEnabled, setAiEnabled] = useState(true)
  const [voiceMuted, setVoiceMuted] = useState(!settings.voiceEnabled)
  const [currentGesture, setCurrentGesture] = useState(null)
  const [confidence, setConfidence] = useState(0)
  const [history, setHistory] = useState([])
  const lastSpokenRef = useRef('')
  const lastGestureRef = useRef(null)

  // Auto-speak new sentences
  useEffect(() => {
    if (
      settings.autoSpeak &&
      !voiceMuted &&
      sentence &&
      sentence !== lastSpokenRef.current
    ) {
      lastSpokenRef.current = sentence
      speechService.updateSettings({
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        volume: settings.voiceVolume,
        voiceName: settings.selectedVoice,
        lang: settings.language,
      })
      speechService.speak(sentence)
    }
  }, [sentence, settings, voiceMuted])

  const handleResults = useCallback(({ landmarks }) => {
    if (!aiEnabled || !landmarks) {
      if (!landmarks) {
        setCurrentGesture(null)
        setConfidence(0)
        processGesture(null)
      }
      return
    }

    const result = classify(landmarks, settings.confidenceThreshold)

    if (result) {
      setCurrentGesture(result.gesture)
      setConfidence(result.confidence)
      processGesture(result.gesture)

      // Add to history when new gesture detected
      if (result.gesture !== lastGestureRef.current) {
        lastGestureRef.current = result.gesture
        setHistory(prev => [
          { gesture: result.gesture, confidence: result.confidence, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 49),
        ])
      }
    } else {
      setCurrentGesture(null)
      setConfidence(0)
      processGesture(null)
    }
  }, [aiEnabled, classify, processGesture, settings.confidenceThreshold])

  const exportHistory = () => {
    const text = history.map(h => `[${h.time}] ${h.gesture}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'elysia-translation-history.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('History exported!')
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Live <span className="text-gradient">Gesture Translator</span>
          </h1>
          <p className="text-gray-500">Show your hand gestures to the camera and watch them come to life</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Camera + Subtitles */}
          <div className="lg:col-span-2 space-y-4">
            {/* Camera */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CameraFeed onResults={handleResults} enabled={aiEnabled} showFps />
            </motion.div>

            {/* Subtitle bar */}
            <SubtitleBar
              sentence={sentence}
              currentWord={currentWord}
              holdProgress={getHoldProgress()}
              onClear={() => {
                clearSentence()
                lastSpokenRef.current = ''
              }}
            />

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* AI Toggle */}
              <button
                id="ai-toggle"
                onClick={() => {
                  setAiEnabled(!aiEnabled)
                  toast(aiEnabled ? 'AI Recognition paused' : 'AI Recognition started', {
                    icon: aiEnabled ? '⏸️' : '▶️',
                  })
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                  aiEnabled
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {aiEnabled ? <RiToggleFill size={20} /> : <RiToggleLine size={20} />}
                AI Recognition {aiEnabled ? 'ON' : 'OFF'}
              </button>

              {/* Voice toggle */}
              <button
                id="voice-toggle"
                onClick={() => {
                  setVoiceMuted(!voiceMuted)
                  if (voiceMuted) speechService.stop()
                  toast(voiceMuted ? 'Voice enabled' : 'Voice muted', {
                    icon: voiceMuted ? '🔊' : '🔇',
                  })
                }}
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
                  <RiDownloadLine size={16} />
                  Export History
                </button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Confidence */}
            <ConfidenceIndicator
              gesture={currentGesture}
              confidence={confidence}
              isDetecting={aiEnabled}
            />

            {/* Tip card */}
            <div className="glass-card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Tips</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  Keep hand in frame, well-lit
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  Hold gesture 1.5s to confirm word
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  Pause 3s between sentences
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  Train custom gestures in Train AI
                </li>
              </ul>
            </div>

            {/* Detection History */}
            <div className="glass-card p-4 flex flex-col max-h-80">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                  Detection History
                </p>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                    title="Clear history"
                  >
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
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-gray-300 font-medium">{item.gesture}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-400">
                          {Math.round(item.confidence * 100)}%
                        </span>
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
