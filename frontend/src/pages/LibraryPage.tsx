import { useState } from 'react'
import { motion } from 'framer-motion'
import { RiSearchLine, RiBookLine, RiAddLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import GestureCard from '@components/features/GestureCard'
import { useGestureClassifier } from '@hooks/useGestureClassifier'
import toast from 'react-hot-toast'

const BUILT_IN_GESTURES = [
  { name: 'Hello', count: 20, builtin: true }, { name: 'Help', count: 20, builtin: true },
  { name: 'Water', count: 20, builtin: true }, { name: 'Thank You', count: 20, builtin: true },
  { name: 'Please', count: 20, builtin: true }, { name: 'Yes / Good', count: 20, builtin: true },
  { name: 'No / Bad', count: 20, builtin: true }, { name: 'Stop', count: 20, builtin: true },
  { name: 'I Love You', count: 20, builtin: true }, { name: 'Peace / 2', count: 20, builtin: true },
  { name: 'Point / 1', count: 20, builtin: true }, { name: 'L', count: 20, builtin: true },
  { name: 'Y', count: 20, builtin: true }, { name: 'A', count: 20, builtin: true }, { name: '4', count: 20, builtin: true },
]

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'builtin' | 'custom'>('builtin')
  const { getGestureStats, deleteGesture } = useGestureClassifier()
  const customGestures = getGestureStats()
  const filteredBuiltin = BUILT_IN_GESTURES.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
  const filteredCustom = customGestures.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center"><RiBookLine size={18} className="text-purple-400" /></div>
                <h1 className="font-display font-bold text-3xl text-white">Gesture <span className="text-gradient">Library</span></h1>
              </div>
              <p className="text-gray-500 ml-12">Browse and manage your sign language gesture database</p>
            </div>
            <Link to="/train">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-neon flex items-center gap-2">
                <RiAddLine size={18} /> Add Gesture
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <RiSearchLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input id="gesture-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gestures..." className="input-neon pl-9" />
          </div>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {(['builtin', 'custom'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                {t === 'builtin' ? `Built-in (${BUILT_IN_GESTURES.length})` : `My Gestures (${customGestures.length})`}
              </button>
            ))}
          </div>
        </div>

        {tab === 'builtin' ? (
          filteredBuiltin.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBuiltin.map((g, i) => <GestureCard key={g.name} name={g.name} count={g.count} index={i} />)}
            </div>
          ) : <EmptyState query={search} />
        ) : (
          customGestures.length === 0 && !search ? (
            <div className="glass-card p-12 text-center">
              <RiBookLine size={40} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">No custom gestures yet</p>
              <Link to="/train"><button className="btn-neon flex items-center gap-2 mx-auto mt-4"><RiAddLine size={18} />Train First Gesture</button></Link>
            </div>
          ) : filteredCustom.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCustom.map((g, i) => (
                <GestureCard key={g.name} name={g.name} count={g.count} index={i}
                  onDelete={(name) => { deleteGesture(name); toast(`Deleted "${name}"`, { icon: '🗑️' }) }} />
              ))}
            </div>
          ) : <EmptyState query={search} />
        )}

        <div className="mt-8 glass-card p-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">{tab === 'builtin' ? filteredBuiltin.length : filteredCustom.length} gesture(s) shown</span>
          <span className="text-xs text-gray-600">{BUILT_IN_GESTURES.length} built-in · {customGestures.length} custom</span>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="glass-card p-12 text-center">
      <RiSearchLine size={36} className="text-gray-700 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">No gestures match "{query}"</p>
    </div>
  )
}
