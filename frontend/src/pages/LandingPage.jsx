import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  RiHandHeartLine,
  RiVolumeUpLine,
  RiCpuLine,
  RiVideoLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiPlayCircleLine,
  RiHeartLine,
  RiGlobalLine,
} from 'react-icons/ri'

const features = [
  {
    icon: RiHandHeartLine,
    title: 'Real-Time Gesture Translation',
    desc: 'MediaPipe AI detects hand landmarks and translates sign language into text instantly with sub-100ms latency.',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: RiCpuLine,
    title: 'Custom AI Training',
    desc: 'Record your own gestures, label them, and train a personal model that learns your unique signing style.',
    color: 'from-violet-500 to-purple-700',
  },
  {
    icon: RiVolumeUpLine,
    title: 'Natural Voice Output',
    desc: 'Translated gestures are converted into natural speech using AI voice synthesis, enabling fluid two-way conversation.',
    color: 'from-purple-600 to-pink-600',
  },
  {
    icon: RiVideoLine,
    title: 'Video Calls with Live Subtitles',
    desc: 'Join video calls with real-time sign language translation and auto-generated subtitles powered by WebRTC.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: RiShieldCheckLine,
    title: 'Private & Offline-Ready',
    desc: 'AI processing runs entirely in your browser. No video is ever sent to the cloud. Your conversations stay private.',
    color: 'from-purple-700 to-violet-500',
  },
  {
    icon: RiGlobalLine,
    title: 'Gesture Library',
    desc: 'Explore a curated library of common sign gestures. Search, preview, and add them directly to your personal model.',
    color: 'from-violet-600 to-purple-500',
  },
]

const stats = [
  { value: '<100ms', label: 'Latency' },
  { value: '21', label: 'Hand Landmarks' },
  { value: '∞', label: 'Custom Gestures' },
  { value: '100%', label: 'Browser-based' },
]

function FeatureCard({ icon: Icon, title, desc, color, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card-hover p-6 group"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

export default function LandingPage() {
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute w-[500px] h-[500px] rounded-full border border-purple-500/20"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.15, 0.07] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            className="absolute w-[700px] h-[700px] rounded-full border border-purple-700/15"
          />
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            className="absolute w-[900px] h-[900px] rounded-full border border-purple-900/10"
          />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <RiHeartLine size={12} />
            AI-Powered Accessibility Platform
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h1
            className="font-display font-bold text-6xl md:text-8xl lg:text-9xl text-white mb-4 leading-none tracking-tight"
            style={{
              textShadow: '0 0 80px rgba(168, 85, 247, 0.5), 0 0 160px rgba(124, 58, 237, 0.25)',
            }}
          >
            Elysia
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-3 leading-relaxed"
        >
          Breaking barriers through
          <span className="text-gradient font-semibold"> AI-powered sign language translation</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-gray-500 text-base max-w-lg mb-10"
        >
          Helping deaf and mute individuals communicate naturally using real-time hand gesture recognition. No apps. No hardware. Just your hands.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link to="/translate">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              id="hero-cta-translate"
              className="btn-neon flex items-center gap-2 text-base px-8 py-4 animate-glow-pulse"
            >
              <RiPlayCircleLine size={20} />
              Start Translating
            </motion.button>
          </Link>

          <Link to="/library">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              id="hero-cta-library"
              className="btn-outline flex items-center gap-2 text-base px-8 py-4"
            >
              <RiHandHeartLine size={20} />
              Explore Gesture Guide
              <RiArrowRightLine size={16} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border border-gray-600 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-purple-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <p
                    className="font-display font-bold text-4xl text-white mb-1"
                    style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
                  >
                    {value}
                  </p>
                  <p className="text-gray-500 text-sm">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-purple-400 text-sm font-medium uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Everything you need to
              <br />
              <span className="text-gradient">communicate freely</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Elysia combines cutting-edge AI, real-time computer vision, and seamless UX to create the most accessible sign language platform available.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 gradient-border"
          >
            <RiHeartLine size={40} className="text-purple-400 mx-auto mb-6" />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Communication is a human right.
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Elysia was built for the millions of people who communicate through sign language, and the billions who want to understand them. Start breaking barriers today.
            </p>
            <Link to="/translate">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                id="bottom-cta-translate"
                className="btn-neon flex items-center gap-2 mx-auto text-base px-8 py-4"
              >
                <RiHandHeartLine size={20} />
                Open Translator
                <RiArrowRightLine size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2025 Elysia. Built for accessibility. Powered by AI.
          </p>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <RiHeartLine size={14} className="text-purple-500" />
            <span>Made with love for the deaf community</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
