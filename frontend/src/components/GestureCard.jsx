import { motion } from 'framer-motion'
import { RiDeleteBinLine, RiEditLine } from 'react-icons/ri'

const gestureEmojis = {
  'Hello': '👋',
  'Help': '🆘',
  'Water': '💧',
  'Food': '🍽️',
  'Thank You': '🙏',
  'Please': '🤲',
  'Yes': '✅',
  'No': '❌',
  'Stop': '✋',
  'I Love You': '🤟',
  'Peace / 2': '✌️',
  'Point / 1': '☝️',
}

export default function GestureCard({ name, count, onDelete, onEdit, index = 0 }) {
  const emoji = gestureEmojis[name] || '🤚'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card-hover p-4 flex items-center gap-4"
    >
      {/* Emoji icon */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0"
        style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}
      >
        {emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-white truncate">{name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {count} {count === 1 ? 'sample' : 'samples'}
        </p>
        {/* Sample bar */}
        <div className="mt-1.5 confidence-bar w-24">
          <div
            className="confidence-fill transition-all duration-500"
            style={{ width: `${Math.min((count / 20) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(name)}
            className="p-2 rounded-lg text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
            title="Edit"
          >
            <RiEditLine size={15} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(name)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <RiDeleteBinLine size={15} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
