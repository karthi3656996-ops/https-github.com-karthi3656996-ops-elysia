import { motion } from 'framer-motion'
import { RiLoader4Line } from 'react-icons/ri'

export default function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="text-purple-400"
      >
        <RiLoader4Line size={36} />
      </motion.div>
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  )
}
