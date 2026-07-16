// CallPage — TypeScript stub (full implementation in Phase 9)
import { motion } from 'framer-motion'
import { RiVideoLine, RiPhoneLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'

export default function CallPage() {
  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <RiVideoLine size={18} className="text-purple-400" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              Video <span className="text-gradient">Call with Translation</span>
            </h1>
          </div>
          <p className="text-gray-500 ml-12">Real-time sign language translation during video calls</p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <div className="glass-card p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto">
              <RiVideoLine size={36} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Video Calls Coming Soon</h2>
              <p className="text-gray-500 text-sm">WebRTC video calling with live sign language subtitles is in active development. Phase 9 of the roadmap.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {['WebRTC P2P video', 'Live gesture subtitles', 'Peer translation panel', 'Socket.io signaling'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />{f}
                </div>
              ))}
            </div>
            <Link to="/translate">
              <button className="btn-neon w-full flex items-center justify-center gap-2 py-3">
                <RiPhoneLine size={18} /> Try Translator Instead
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
