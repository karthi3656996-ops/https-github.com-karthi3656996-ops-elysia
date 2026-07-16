import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiRecordCircleLine, RiStopLine, RiSaveLine, RiDeleteBinLine } from 'react-icons/ri'
import toast from 'react-hot-toast'
import CameraFeed from './CameraFeed'

export default function TrainingRecorder({ onSample, onClear, currentLabel, sampleCount = 0 }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedFrames, setRecordedFrames] = useState(0)
  const landmarksRef = useRef(null)
  const recordIntervalRef = useRef(null)
  const TARGET_SAMPLES = 20

  const handleResults = useCallback(({ landmarks }) => {
    landmarksRef.current = landmarks
  }, [])

  const startRecording = () => {
    if (!currentLabel) {
      toast.error('Enter a gesture name first!')
      return
    }
    setIsRecording(true)
    setRecordedFrames(0)

    recordIntervalRef.current = setInterval(() => {
      if (landmarksRef.current) {
        onSample?.(currentLabel, landmarksRef.current)
        setRecordedFrames(prev => {
          if (prev + 1 >= TARGET_SAMPLES) {
            stopRecording()
            toast.success(`Recorded ${TARGET_SAMPLES} samples for "${currentLabel}"!`)
            return TARGET_SAMPLES
          }
          return prev + 1
        })
      }
    }, 150) // capture every 150ms
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current)
      recordIntervalRef.current = null
    }
  }

  const progress = Math.min((recordedFrames / TARGET_SAMPLES) * 100, 100)

  return (
    <div className="space-y-4">
      {/* Camera with recording border */}
      <div
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
          isRecording ? 'ring-2 ring-red-500/60 ring-offset-2 ring-offset-dark-950' : ''
        }`}
      >
        <CameraFeed onResults={handleResults} enabled={true} showFps={false} />

        {/* Recording overlay badge */}
        {isRecording && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-900/80 border border-red-500/50 backdrop-blur-sm rounded-full px-3 py-1">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-400"
            />
            <span className="text-xs font-medium text-red-300">
              Recording {recordedFrames}/{TARGET_SAMPLES}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {(isRecording || recordedFrames > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-xs text-gray-500">
              <span>Samples captured</span>
              <span>{recordedFrames} / {TARGET_SAMPLES}</span>
            </div>
            <div className="confidence-bar">
              <motion.div
                className="confidence-fill bg-gradient-to-r from-red-500 to-rose-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startRecording}
            className="btn-neon flex-1 flex items-center justify-center gap-2"
          >
            <RiRecordCircleLine size={18} />
            {sampleCount > 0 ? 'Record More' : 'Start Recording'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold font-display text-white bg-red-600 hover:bg-red-500 transition-colors"
          >
            <RiStopLine size={18} />
            Stop Recording
          </motion.button>
        )}

        {sampleCount > 0 && onClear && (
          <button
            onClick={onClear}
            title="Clear samples"
            className="btn-outline p-3"
          >
            <RiDeleteBinLine size={18} />
          </button>
        )}
      </div>

      {sampleCount > 0 && (
        <p className="text-center text-xs text-gray-500">
          {sampleCount} total sample{sampleCount !== 1 ? 's' : ''} recorded for this gesture
        </p>
      )}
    </div>
  )
}
