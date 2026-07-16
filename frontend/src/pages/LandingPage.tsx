import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiHandHeartLine, RiVolumeUpLine, RiCpuLine, RiVideoLine, RiArrowRightLine, RiPlayCircleLine, RiHeartLine, RiGlobalLine, RiRobotLine, RiBookOpenLine } from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'

const features = [
  { icon: RiHandHeartLine, title: 'Real-Time Gesture Translation', desc: 'MediaPipe AI detects hand landmarks and translates sign language into text instantly with sub-100ms latency.', color: 'from-purple-500 to-violet-600' },
  { icon: RiCpuLine, title: 'Custom AI Training', desc: 'Record your own gestures, label them, and train a personal model that learns your unique signing style.', color: 'from-violet-500 to-purple-700' },
  { icon: RiVolumeUpLine, title: 'Natural Voice Output', desc: 'Translated gestures are converted into natural speech using AI voice synthesis for fluid two-way conversation.', color: 'from-purple-600 to-pink-600' },
  { icon: RiVideoLine, title: 'Video Calls with Live Subtitles', desc: 'Join video calls with real-time sign language translation and auto-generated subtitles powered by WebRTC.', color: 'from-indigo-500 to-purple-600' },
  { icon: RiRobotLine, title: 'AI Sign Language Assistant', desc: 'Chat with our AI assistant to learn gestures, get tips, and ask anything about sign language communication.', color: 'from-blue-500 to-purple-600' },
  { icon: RiGlobalLine, title: 'Gesture Library', desc: 'Explore a curated library of ASL gestures. Search, filter by category, and add them to your personal model.', color: 'from-violet-600 to-purple-500' },
]

const stats = [
  { value: '<100ms', label: 'Latency' },
  { value: '21', label: 'Hand Landmarks' },
  { value: '∞', label: 'Custom Gestures' },
  { value: '100%', label: 'Browser-based' },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[500, 700, 900].map((size, i) => (
            <motion.div key={size} animate={{ scale: [1, 1.05 + i * 0.01, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              className={`absolute w-[${size}px] h-[${size}px] rounded-full border border-purple-500/${20 - i * 5}`}
              style={{ width: size, height: size }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <RiHeartLine size={12} /> AI-Powered Accessibility Platform
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold text-6xl md:text-8xl lg:text-9xl text-white mb-4 leading-none tracking-tight"
          style={{ textShadow: '0 0 80px rgba(168, 85, 247, 0.5), 0 0 160px rgba(124, 58, 237, 0.25)' }}>
          Elysia
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-3 leading-relaxed">
          Breaking barriers through <span className="text-gradient font-semibold"> AI-powered sign language translation</span>
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.35 }}
          className="text-gray-500 text-base max-w-lg mb-10">
          Helping deaf and mute individuals communicate naturally using real-time hand gesture recognition. No apps. No hardware. Just your hands.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to="/translate">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} id="hero-cta-translate"
              className="btn-neon flex items-center gap-2 text-base px-8 py-4">
              <RiPlayCircleLine size={20} /> Start Translating
            </motion.button>
          </Link>
          <Link to="/learn">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} id="hero-cta-learn"
              className="btn-outline flex items-center gap-2 text-base px-8 py-4">
              <RiBookOpenLine size={20} /> Learn Sign Language <RiArrowRightLine size={16} />
            </motion.button>
          </Link>
        </motion.div>

        {user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4">
            <Link to="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm underline underline-offset-4 transition-colors">
              Go to your Dashboard →
            </Link>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border border-gray-600 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-purple-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ value, label }, i) => (
                <motion.div key={label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center">
                  <p className="font-display font-bold text-4xl text-white mb-1" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>{value}</p>
                  <p className="text-gray-500 text-sm">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-purple-400 text-sm font-medium uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Everything you need to <br /><span className="text-gradient">communicate freely</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Elysia combines cutting-edge AI, real-time computer vision, and seamless UX to create the most accessible sign language platform available.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-12 gradient-border">
            <RiHeartLine size={40} className="text-purple-400 mx-auto mb-6" />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Communication is a human right.</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">Elysia was built for the millions who communicate through sign language, and the billions who want to understand them.</p>
            <Link to="/translate">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} id="bottom-cta-translate"
                className="btn-neon flex items-center gap-2 mx-auto text-base px-8 py-4">
                <RiHandHeartLine size={20} /> Open Translator <RiArrowRightLine size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2025 Elysia. Built for accessibility. Powered by AI.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/karthi3656996-ops/https-github.com-karthi3656996-ops-elysia"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors text-sm group"
            >
              {/* GitHub SVG icon inline */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Source Code</span>
            </a>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <RiHeartLine size={14} className="text-purple-500" />
              <span>Made with love for the deaf community</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
