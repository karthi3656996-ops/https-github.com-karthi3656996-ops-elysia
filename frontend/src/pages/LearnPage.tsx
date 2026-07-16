import { useState } from 'react'
import { motion } from 'framer-motion'
import { RiSearchLine, RiBookOpenLine, RiFilter3Line } from 'react-icons/ri'

type Category = 'all' | 'greetings' | 'emotions' | 'common' | 'emergency' | 'alphabet'

const gestureLibrary = [
  { id: '1', name: 'Hello', emoji: '👋', category: 'greetings', difficulty: 'easy', desc: 'Open hand, wave gently side to side', tips: 'Keep fingers together, wrist relaxed' },
  { id: '2', name: 'Thank You', emoji: '🙏', category: 'greetings', difficulty: 'easy', desc: 'Flat hand from chin, moving forward', tips: 'Touch fingertips to chin, extend outward' },
  { id: '3', name: 'Please', emoji: '🤲', category: 'common', difficulty: 'easy', desc: 'Flat hand, circular motion on chest', tips: 'Rub palm clockwise on your chest' },
  { id: '4', name: 'I Love You', emoji: '🤟', category: 'emotions', difficulty: 'easy', desc: 'Thumb, index finger, and pinky extended', tips: 'Combine I, L, and Y into one handshape' },
  { id: '5', name: 'Help', emoji: '🆘', category: 'emergency', difficulty: 'medium', desc: 'Fist on open palm, both hands rise', tips: 'Make a thumbs-up, place on other palm and lift' },
  { id: '6', name: 'Stop', emoji: '✋', category: 'common', difficulty: 'easy', desc: 'Open hand held up, palm facing out', tips: 'Keep fingers together, arm extended' },
  { id: '7', name: 'Yes', emoji: '✅', category: 'common', difficulty: 'easy', desc: 'Fist nods up and down like a head nod', tips: 'Make a fist, move it up and down at wrist' },
  { id: '8', name: 'No', emoji: '❌', category: 'common', difficulty: 'easy', desc: 'Index and middle finger tap thumb twice', tips: 'Like a crocodile snapping — index+middle to thumb' },
  { id: '9', name: 'Water', emoji: '💧', category: 'common', difficulty: 'medium', desc: 'W handshape tapped on chin twice', tips: 'Form a W with three fingers, tap chin' },
  { id: '10', name: 'Peace', emoji: '✌️', category: 'emotions', difficulty: 'easy', desc: 'Index and middle fingers raised in a V', tips: 'Keep other fingers curled, thumb tucked' },
  { id: '11', name: 'A', emoji: '🅰️', category: 'alphabet', difficulty: 'easy', desc: 'Fist with thumb resting on side', tips: 'Keep thumb to the side, not over fingers' },
  { id: '12', name: 'B', emoji: '🅱️', category: 'alphabet', difficulty: 'easy', desc: 'Flat hand, fingers together, thumb tucked', tips: 'Four fingers straight up, thumb across palm' },
]

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'greetings', label: 'Greetings' },
  { key: 'emotions', label: 'Emotions' },
  { key: 'common', label: 'Common' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'alphabet', label: 'Alphabet' },
]

const difficultyColor = { easy: 'text-green-400 bg-green-400/10', medium: 'text-yellow-400 bg-yellow-400/10', hard: 'text-red-400 bg-red-400/10' }

export default function LearnPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [selected, setSelected] = useState<typeof gestureLibrary[0] | null>(null)

  const filtered = gestureLibrary.filter(g =>
    (category === 'all' || g.category === category) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <RiBookOpenLine size={18} className="text-purple-400" />
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              Learn <span className="text-gradient">Sign Language</span>
            </h1>
          </div>
          <p className="text-gray-500 ml-12">Master common signs with interactive guides and tips</p>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <RiSearchLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gestures…" className="input-neon pl-9" />
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
            <RiFilter3Line size={14} className="text-gray-500 ml-2 flex-shrink-0" />
            {categories.map(({ key, label }) => (
              <button key={key} onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${category === key ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gesture Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(g)} className={`glass-card-hover p-4 cursor-pointer ${selected?.id === g.id ? 'border-purple-500/50 bg-purple-500/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {g.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold text-white">{g.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${difficultyColor[g.difficulty as keyof typeof difficultyColor]}`}>{g.difficulty}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{g.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-2 glass-card p-12 text-center">
                <RiSearchLine size={36} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No gestures match your search</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="glass-card p-6 h-fit sticky top-24">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-6">
                  <div className="text-7xl mb-3">{selected.emoji}</div>
                  <h2 className="font-display font-bold text-2xl text-white">{selected.name}</h2>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full font-medium capitalize ${difficultyColor[selected.difficulty as keyof typeof difficultyColor]}`}>{selected.difficulty}</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-sm text-gray-300">{selected.desc}</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Pro Tip</p>
                    <p className="text-sm text-gray-300">{selected.tips}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Category</span>
                    <span className="text-xs text-purple-300 capitalize">{selected.category}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">👈</div>
                <p className="text-gray-500 text-sm">Select a gesture to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
