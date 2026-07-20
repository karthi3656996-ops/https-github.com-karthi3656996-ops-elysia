import { motion } from 'framer-motion'
import { RiHandHeartLine, RiSearchLine, RiHeartLine, RiHeartFill, RiBookOpenLine } from 'react-icons/ri'
import { useState } from 'react'

const GESTURES = [
  { name: 'Hello',       emoji: '👋', category: 'Greetings',  desc: 'Open hand, wave side to side' },
  { name: 'Thank You',   emoji: '🙏', category: 'Courtesy',   desc: 'Flat hand from chin forward' },
  { name: 'Please',      emoji: '🤲', category: 'Courtesy',   desc: 'Circular motion on chest' },
  { name: 'I Love You',  emoji: '🤟', category: 'Feelings',   desc: 'Pinky, index, and thumb extended' },
  { name: 'Yes',         emoji: '✅', category: 'Basic',      desc: 'Fist nodding up and down' },
  { name: 'No',          emoji: '❌', category: 'Basic',      desc: 'Index and middle finger tap thumb' },
  { name: 'Help',        emoji: '🆘', category: 'Emergency',  desc: 'Thumb up on flat palm, lift upward' },
  { name: 'Stop',        emoji: '✋', category: 'Emergency',  desc: 'Flat hand pushed forward' },
  { name: 'Water',       emoji: '💧', category: 'Needs',      desc: 'W hand shape tapping chin' },
  { name: 'Food',        emoji: '🍽️', category: 'Needs',      desc: 'Fingers pinched to lips' },
  { name: 'Good',        emoji: '👍', category: 'Basic',      desc: 'Thumbs up gesture' },
  { name: 'Bad',         emoji: '👎', category: 'Basic',      desc: 'Thumbs down gesture' },
  { name: 'Peace',       emoji: '✌️', category: 'Greetings',  desc: 'Index and middle finger up' },
  { name: 'Call Me',     emoji: '🤙', category: 'Greetings',  desc: 'Pinky and thumb extended' },
  { name: 'Point',       emoji: '☝️', category: 'Basic',      desc: 'Index finger pointing up' },
]

const CATEGORIES = ['All', ...Array.from(new Set(GESTURES.map(g => g.category)))]

export default function LibraryPage() {
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const filtered = GESTURES.filter(g =>
    (category === 'All' || g.category === category) &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || g.category.toLowerCase().includes(search.toLowerCase()))
  )

  const toggle = (name: string) => setFavorites(prev => {
    const next = new Set(prev)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 relative overflow-hidden">
      <div className="glow-orb w-96 h-96 top-0 left-[-100px] opacity-15" style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.5), transparent 70%)' }} />
      <div className="glow-orb w-80 h-80 bottom-20 right-[-80px] opacity-15" style={{ background: 'radial-gradient(circle, rgba(123,47,247,0.5), transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl icon-sunset flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(255,122,24,0.4)' }}>
              <RiBookOpenLine size={18} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white"><span className="text-gradient">Gesture Library</span></h1>
          </div>
          <p className="ml-13" style={{ color: '#C9C9D6' }}>Browse and learn {GESTURES.length}+ ASL gestures</p>
        </motion.div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          <div className="relative flex-1">
            <RiSearchLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(201,201,214,0.5)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search gestures…" className="input-neon pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: category === cat ? 'rgba(255,122,24,0.18)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${category === cat ? 'rgba(255,122,24,0.45)' : 'rgba(255,255,255,0.1)'}`,
                  color: category === cat ? '#FF9A50' : '#C9C9D6',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((g, i) => (
            <motion.div key={g.name}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card-hover p-5 group relative">
              <button onClick={() => toggle(g.name)}
                className="absolute top-4 right-4 transition-transform hover:scale-110"
                style={{ color: favorites.has(g.name) ? '#FF4D9D' : 'rgba(201,201,214,0.3)' }}>
                {favorites.has(g.name) ? <RiHeartFill size={16} /> : <RiHeartLine size={16} />}
              </button>
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{g.emoji}</div>
              <h3 className="font-display font-bold text-white mb-1">{g.name}</h3>
              <p className="text-xs mb-2" style={{ color: '#FF9A50' }}>{g.category}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#C9C9D6' }}>{g.desc}</p>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <RiHandHeartLine size={40} className="mx-auto mb-3" style={{ color: 'rgba(201,201,214,0.3)' }} />
              <p style={{ color: 'rgba(201,201,214,0.5)' }}>No gestures found for "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
