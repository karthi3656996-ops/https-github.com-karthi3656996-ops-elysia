import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiHandHeartLine, RiVolumeUpLine, RiCpuLine,
  RiVideoLine, RiArrowRightLine, RiPlayCircleLine,
  RiHeartLine, RiGlobalLine, RiRobotLine,
  RiBookOpenLine, RiShieldCheckLine, RiFlashlightLine,
} from 'react-icons/ri'
import { useAuth } from '@store/AuthContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  { icon: RiHandHeartLine, title: 'Real-Time Translation', desc: 'MediaPipe AI tracks 21 hand landmarks and converts sign language to text in under 100ms.', gradient: 'icon-sunset' },
  { icon: RiCpuLine,       title: 'Custom AI Training',  desc: 'Record your own gestures and train a personal model that learns your unique signing style.', gradient: 'icon-purple' },
  { icon: RiVolumeUpLine,  title: 'Natural Voice Output', desc: 'Converted gestures speak aloud with lifelike AI voices for fluid two-way conversation.', gradient: 'icon-pink' },
  { icon: RiVideoLine,     title: 'Video Calls + Subtitles', desc: 'Join video calls with real-time sign language subtitles powered by WebRTC.', gradient: 'icon-orange' },
  { icon: RiRobotLine,     title: 'AI Sign Assistant',   desc: 'Chat with our AI to learn gestures, get tips and ask anything about sign language.', gradient: 'icon-aurora' },
  { icon: RiGlobalLine,    title: 'Gesture Library',     desc: 'Browse 15+ built-in ASL gestures, search by category, and add your own custom signs.', gradient: 'icon-fire' },
]

const stats = [
  { value: '<100ms', label: 'Recognition Latency' },
  { value: '21',     label: 'Hand Landmarks' },
  { value: '∞',      label: 'Custom Gestures' },
  { value: '100%',   label: 'Browser-Based' },
]

const steps = [
  { n: '01', title: 'Open Translator', desc: 'Allow camera access. MediaPipe instantly starts tracking your hands.' },
  { n: '02', title: 'Sign a Gesture',  desc: 'Hold any ASL sign for 1.5 seconds to confirm a word.' },
  { n: '03', title: 'Hear & Read',     desc: 'Watch the translation appear and listen to it spoken aloud in real time.' },
]

// ─── Particle component ────────────────────────────────────────────────────────

function Particles() {
  const colors = ['#FF7A18', '#FF4D9D', '#7B2FF7', '#FF9A50']
  return (
    <div className="particles-container">
      {Array.from({ length: 20 }).map((_, i) => {
        const size = Math.random() * 4 + 2
        const left = Math.random() * 100
        const duration = Math.random() * 15 + 10
        const delay = Math.random() * 15
        const color = colors[i % colors.length]
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: size, height: size,
              left: `${left}%`,
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Neural Network SVG ────────────────────────────────────────────────────────

function NeuralNetwork() {
  const nodes = [
    { cx: 60,  cy: 80  }, { cx: 60,  cy: 200 }, { cx: 60,  cy: 320 },
    { cx: 190, cy: 50  }, { cx: 190, cy: 150 }, { cx: 190, cy: 260 }, { cx: 190, cy: 360 },
    { cx: 320, cy: 100 }, { cx: 320, cy: 210 }, { cx: 320, cy: 310 },
    { cx: 450, cy: 140 }, { cx: 450, cy: 250 },
    { cx: 560, cy: 195 },
  ]
  const edges = [
    [0,3],[0,4],[1,3],[1,4],[1,5],[2,4],[2,5],[2,6],
    [3,7],[3,8],[4,7],[4,8],[4,9],[5,8],[5,9],[6,9],
    [7,10],[7,11],[8,10],[8,11],[9,11],
    [10,12],[11,12],
  ]
  const delays = nodes.map((_, i) => (i * 0.2).toFixed(1))

  return (
    <svg viewBox="0 0 620 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nodeGradOrange" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9A50" />
          <stop offset="100%" stopColor="#FF7A18" />
        </radialGradient>
        <radialGradient id="nodeGradPink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7ABB" />
          <stop offset="100%" stopColor="#FF4D9D" />
        </radialGradient>
        <radialGradient id="nodeGradPurple" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7B2FF7" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="url(#nodeGradOrange)" strokeWidth="1"
          className="neural-line"
          style={{ animationDelay: `${(i * 0.1) % 3}s` }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const grad = i < 3 ? 'nodeGradOrange' : i < 7 ? 'nodeGradPink' : i < 10 ? 'nodeGradPurple' : i < 12 ? 'nodeGradOrange' : 'nodeGradPink'
        return (
          <circle key={i} cx={n.cx} cy={n.cy} r={i === 12 ? 10 : 5}
            fill={`url(#${grad})`} filter="url(#glow)"
            className="neural-node"
            style={{ animationDelay: `${delays[i]}s` }}
          />
        )
      })}

      {/* Central output glow */}
      <circle cx={560} cy={195} r={20} fill="none"
        stroke="#FF7A18" strokeWidth="1.5" opacity="0.4"
        style={{ animation: 'node-pulse 2s ease-in-out infinite' }}
      />
      <circle cx={560} cy={195} r={32} fill="none"
        stroke="#FF4D9D" strokeWidth="1" opacity="0.2"
        style={{ animation: 'node-pulse 2s ease-in-out infinite', animationDelay: '0.5s' }}
      />
    </svg>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-10 overflow-hidden">

        <Particles />

        {/* Glow orbs */}
        <div className="glow-orb w-[500px] h-[500px] top-[-100px] left-[-150px] opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.4), transparent 70%)' }} />
        <div className="glow-orb w-[400px] h-[400px] top-[50px] right-[-100px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(123,47,247,0.5), transparent 70%)' }} />
        <div className="glow-orb w-[350px] h-[350px] bottom-[-50px] left-[30%] opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(255,77,157,0.4), transparent 70%)' }} />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold border"
            style={{ borderColor: 'rgba(255,122,24,0.4)', background: 'rgba(255,122,24,0.1)', color: '#FF9A50', letterSpacing: '0.08em' }}>
            <RiHeartLine size={12} />
            AI-Powered Accessibility Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-white mb-4 leading-none tracking-tight relative z-10"
          style={{ textShadow: '0 0 80px rgba(255,122,24,0.4), 0 0 160px rgba(123,47,247,0.2)' }}
        >
          <span className="text-gradient">Elysia</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl max-w-2xl mb-3 leading-relaxed relative z-10"
          style={{ color: '#C9C9D6' }}
        >
          Breaking barriers through{' '}
          <span className="text-gradient font-semibold">AI-powered sign language translation</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.35 }}
          className="max-w-lg mb-10 text-base relative z-10"
          style={{ color: 'rgba(201,201,214,0.6)' }}
        >
          Helping deaf and mute individuals communicate naturally using real-time hand gesture recognition. No apps. No hardware. Just your hands.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 items-center relative z-10 mb-6"
        >
          <Link to="/translate">
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
              id="hero-cta-translate"
              className="btn-neon flex items-center gap-2 text-base px-10 py-4 text-lg">
              <RiPlayCircleLine size={22} /> Try Live Translation
            </motion.button>
          </Link>
          <Link to="/learn">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              id="hero-cta-learn"
              className="btn-outline flex items-center gap-2 text-base px-10 py-4 text-lg">
              <RiBookOpenLine size={20} /> Watch Demo <RiArrowRightLine size={16} />
            </motion.button>
          </Link>
        </motion.div>

        {user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
            <Link to="/dashboard" style={{ color: '#FF9A50' }} className="text-sm underline underline-offset-4 hover:opacity-80 transition-opacity">
              Go to your Dashboard →
            </Link>
          </motion.div>
        )}

        {/* Neural Network illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.6 }}
          className="animate-float mt-12 w-full max-w-lg mx-auto relative z-10 opacity-80"
        >
          <NeuralNetwork />
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: '1px solid rgba(255,122,24,0.4)' }}>
            <div className="w-1 h-2 rounded-full" style={{ background: '#FF7A18' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card-glow p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ value, label }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center">
                  <p className="font-display font-black text-4xl mb-1 text-gradient">{value}</p>
                  <p className="text-sm" style={{ color: '#C9C9D6' }}>{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF7A18' }}>How It Works</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Sign. Translate. <span className="text-gradient">Speak.</span>
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: '#C9C9D6' }}>Three simple steps to break the communication barrier.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                className="glass-card p-7 text-center group relative overflow-hidden">
                <div className="absolute -top-3 -right-3 font-black text-8xl opacity-[0.04] text-white select-none">{n}</div>
                <div className="w-14 h-14 rounded-2xl icon-sunset flex items-center justify-center mx-auto mb-5 text-2xl font-black text-white shadow-lg"
                  style={{ boxShadow: '0 8px 24px rgba(255,122,24,0.4)' }}>
                  {n}
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#C9C9D6' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF4D9D' }}>Capabilities</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Everything you need to <br /><span className="text-gradient">communicate freely</span>
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: '#C9C9D6' }}>
              Elysia combines cutting-edge AI, real-time computer vision, and premium UX to create the most accessible sign language platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, gradient }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card-hover p-7 group">
                <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  style={{ boxShadow: '0 6px 20px rgba(255,122,24,0.3)' }}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#C9C9D6' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card gradient-border p-14 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(255,122,24,0.4), transparent 70%)' }} />

            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}
              className="relative z-10">
              <RiHeartLine size={44} className="mx-auto mb-6" style={{ color: '#FF7A18' }} />
            </motion.div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4 relative z-10">
              Communication is a human right.
            </h2>
            <p className="mb-8 leading-relaxed relative z-10" style={{ color: '#C9C9D6' }}>
              Elysia was built for the millions who communicate through sign language, and the billions who want to understand them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center relative z-10">
              <Link to="/translate">
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
                  id="bottom-cta-translate"
                  className="btn-neon flex items-center gap-2 text-base px-10 py-4">
                  <RiHandHeartLine size={20} /> Open Translator <RiArrowRightLine size={16} />
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="btn-outline flex items-center gap-2 text-base px-10 py-4">
                  <RiFlashlightLine size={18} /> Create Free Account
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="section-divider mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg icon-sunset flex items-center justify-center">
                <RiHandHeartLine size={14} className="text-white" />
              </div>
              <span className="font-display font-bold text-white">Elysia</span>
              <span className="text-xs ml-2" style={{ color: 'rgba(201,201,214,0.4)' }}>© 2025</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-5">
              <a
                href="https://github.com/karthi3656996-ops/https-github.com-karthi3656996-ops-elysia"
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm transition-all hover:opacity-80"
                style={{ color: '#C9C9D6' }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                Source Code
              </a>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(201,201,214,0.5)' }}>
                <RiHeartLine size={14} style={{ color: '#FF7A18' }} />
                Made with love for the deaf community
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
