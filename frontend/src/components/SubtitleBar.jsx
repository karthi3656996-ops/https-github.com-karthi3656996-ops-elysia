import { motion, AnimatePresence } from 'framer-motion'
import { RiVolumeUpLine, RiDeleteBinLine } from 'react-icons/ri'
import { speechService } from '../services/speechService'
import { useSettings } from '../hooks/useSettings'

const sizeMap = {
  small: 'text-lg',
  medium: 'text-2xl',
  large: 'text-3xl',
}

export default function SubtitleBar({ sentence, currentWord, holdProgress = 0, onClear }) {
  const { settings } = useSettings()
  const displaySize = sizeMap[settings.subtitleSize] || 'text-2xl'

  const handleSpeak = () => {
    if (!sentence && !currentWord) return
    speechService.updateSettings({
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      volume: settings.voiceVolume,
      voiceName: settings.selectedVoice,
      lang: settings.language,
    })
    speechService.speak(sentence || currentWord)
  }

  return (
    <div className="glass-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            Live Translation
          </span>
          {currentWord && (
            <div className="flex items-center gap-1">
              <div className="confidence-bar w-16">
                <motion.div
                  className="confidence-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${holdProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-xs text-purple-400">hold to confirm</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(sentence || currentWord) && (
            <>
              <button
                onClick={handleSpeak}
                title="Speak"
                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
              >
                <RiVolumeUpLine size={16} />
              </button>
              {onClear && (
                <button
                  onClick={onClear}
                  title="Clear"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <RiDeleteBinLine size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Subtitle text area */}
      <div
        className="min-h-[60px] flex items-center rounded-xl bg-dark-900/50 border border-white/5 px-4 py-3"
      >
        <AnimatePresence mode="wait">
          {sentence ? (
            <motion.p
              key={sentence}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${displaySize} font-display font-semibold text-white leading-snug`}
            >
              {sentence}
              {currentWord && sentence.split(' ').pop() !== currentWord && (
                <span className="text-purple-400 ml-2 opacity-70">{currentWord}...</span>
              )}
            </motion.p>
          ) : currentWord ? (
            <motion.p
              key={currentWord}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${displaySize} font-display font-semibold text-purple-300 opacity-70`}
            >
              {currentWord}...
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 text-base italic"
            >
              Make a hand gesture to start translating...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
