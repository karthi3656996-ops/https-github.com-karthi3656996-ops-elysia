import { motion } from 'framer-motion'
import { RiBarChartLine } from 'react-icons/ri'

const confidenceColors = (score) => {
  if (score >= 0.85) return 'from-green-500 to-emerald-400'
  if (score >= 0.7) return 'from-purple-500 to-purple-400'
  return 'from-yellow-500 to-orange-400'
}

export default function ConfidenceIndicator({ gesture, confidence, isDetecting }) {
  const pct = Math.round((confidence || 0) * 100)

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <RiBarChartLine size={16} />
          <span>Confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`status-dot ${isDetecting ? 'active' : 'inactive'}`} />
          <span className="text-xs text-gray-500">{isDetecting ? 'Detecting' : 'Idle'}</span>
        </div>
      </div>

      {gesture ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-white text-lg">{gesture}</span>
            <span className="text-sm font-mono text-purple-300">{pct}%</span>
          </div>
          <div className="confidence-bar">
            <motion.div
              className={`confidence-fill bg-gradient-to-r ${confidenceColors(confidence)}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 italic text-sm">No gesture detected</span>
            <span className="text-sm font-mono text-gray-700">--</span>
          </div>
          <div className="confidence-bar">
            <div className="confidence-fill w-0" />
          </div>
        </div>
      )}
    </div>
  )
}
