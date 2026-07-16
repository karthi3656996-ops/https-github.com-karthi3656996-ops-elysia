import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  RiBrainLine,
  RiSaveLine,
  RiUploadLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiAddLine,
  RiCheckLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import TrainingRecorder from '../components/TrainingRecorder'
import GestureCard from '../components/GestureCard'
import { useGestureClassifier } from '../hooks/useGestureClassifier'

export default function TrainPage() {
  const {
    addTrainingSample,
    deleteGesture,
    getGestureStats,
    exportModel,
    importModel,
    clearModel,
    trainingCount,
  } = useGestureClassifier()

  const [gestureName, setGestureName] = useState('')
  const [pendingLabel, setPendingLabel] = useState('')
  const [modelTrained, setModelTrained] = useState(false)

  const gestureStats = getGestureStats()

  const handleSample = useCallback((label, landmarks) => {
    addTrainingSample(label, landmarks)
  }, [addTrainingSample])

  const handleStartLabel = () => {
    if (!gestureName.trim()) return
    setPendingLabel(gestureName.trim())
    toast(`Recording gesture: "${gestureName.trim()}"`, { icon: '🎙️' })
  }

  const handleTrainModel = () => {
    if (trainingCount < 5) {
      toast.error('Record at least 5 samples first!')
      return
    }
    // KNN is trained in real-time, so "training" here just confirms it's ready
    setModelTrained(true)
    toast.success(`Model trained with ${trainingCount} samples across ${gestureStats.length} gesture(s)!`)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const success = importModel(ev.target.result)
        if (success) toast.success('Model imported successfully!')
        else toast.error('Failed to import model. Invalid format.')
      }
      reader.readAsText(file)
    }
    input.click()
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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <RiCpuLine size={18} className="text-purple-400" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              AI <span className="text-gradient">Training Dashboard</span>
            </h1>
          </div>
          <p className="text-gray-500 ml-12">Record, label, and train custom gesture models</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Training recorder */}
          <div className="lg:col-span-3 space-y-5">
            {/* Label input */}
            <div className="glass-card p-5">
              <p className="text-sm text-gray-400 mb-3 font-medium">1. Name your gesture</p>
              <div className="flex gap-3">
                <input
                  id="gesture-name-input"
                  type="text"
                  value={gestureName}
                  onChange={(e) => setGestureName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartLabel()}
                  placeholder='e.g. "Water", "Help", "Hello"'
                  className="input-neon flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartLabel}
                  disabled={!gestureName.trim()}
                  id="set-gesture-btn"
                  className="btn-neon flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed px-5"
                >
                  <RiAddLine size={18} />
                  Set
                </motion.button>
              </div>

              {pendingLabel && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20"
                >
                  <RiCheckLine size={14} className="text-purple-400" />
                  <span className="text-sm text-purple-300">
                    Active gesture: <strong>"{pendingLabel}"</strong>
                  </span>
                </motion.div>
              )}
            </div>

            {/* Recorder */}
            <div className="glass-card p-5">
              <p className="text-sm text-gray-400 mb-4 font-medium">2. Record gesture samples</p>
              <TrainingRecorder
                onSample={handleSample}
                onClear={() => {
                  if (pendingLabel) deleteGesture(pendingLabel)
                  toast('Samples cleared', { icon: '🗑️' })
                }}
                currentLabel={pendingLabel}
                sampleCount={gestureStats.find(g => g.name === pendingLabel)?.count || 0}
              />
            </div>

            {/* Model controls */}
            <div className="glass-card p-5">
              <p className="text-sm text-gray-400 mb-4 font-medium">3. Manage model</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="train-model-btn"
                  onClick={handleTrainModel}
                  className="btn-neon flex items-center justify-center gap-2 py-3"
                >
                  <RiBrainLine size={18} />
                  {modelTrained ? 'Re-Train Model' : 'Train Model'}
                </motion.button>

                <button
                  id="export-model-btn"
                  onClick={exportModel}
                  disabled={trainingCount === 0}
                  className="btn-outline flex items-center justify-center gap-2 py-3 disabled:opacity-40"
                >
                  <RiDownloadLine size={18} />
                  Export Model
                </button>

                <button
                  id="import-model-btn"
                  onClick={handleImport}
                  className="btn-outline flex items-center justify-center gap-2 py-3"
                >
                  <RiUploadLine size={18} />
                  Import Model
                </button>

                <button
                  id="clear-model-btn"
                  onClick={() => {
                    if (trainingCount === 0) return
                    clearModel()
                    setPendingLabel('')
                    setModelTrained(false)
                    toast('All training data cleared', { icon: '🗑️' })
                  }}
                  disabled={trainingCount === 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40 font-semibold font-display"
                >
                  <RiDeleteBinLine size={18} />
                  Clear All
                </button>
              </div>

              {/* Model status */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${modelTrained ? 'active' : trainingCount > 0 ? 'processing' : 'inactive'}`} />
                  <span className="text-sm text-gray-400">
                    {modelTrained ? 'Model ready' : trainingCount > 0 ? 'Samples recorded' : 'No data'}
                  </span>
                </div>
                <span className="text-xs text-gray-600">{trainingCount} total samples</span>
              </div>
            </div>
          </div>

          {/* Right: Gesture library */}
          <div className="lg:col-span-2">
            <div className="glass-card p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">
                  Trained Gestures
                </p>
                <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                  {gestureStats.length} gesture{gestureStats.length !== 1 ? 's' : ''}
                </span>
              </div>

              {gestureStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <RiBrainLine size={36} className="text-gray-700 mb-3" />
                  <p className="text-gray-600 text-sm">No gestures trained yet.</p>
                  <p className="text-gray-700 text-xs mt-1">Record your first gesture above.</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto gesture-scroll max-h-[600px] pr-1">
                  {gestureStats.map((g, i) => (
                    <GestureCard
                      key={g.name}
                      name={g.name}
                      count={g.count}
                      index={i}
                      onDelete={(name) => {
                        deleteGesture(name)
                        toast(`Deleted "${name}"`, { icon: '🗑️' })
                        if (pendingLabel === name) setPendingLabel('')
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
