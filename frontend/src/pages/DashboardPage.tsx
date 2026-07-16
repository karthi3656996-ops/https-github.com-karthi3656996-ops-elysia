import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiDashboardLine, RiHandHeartLine, RiTimeLine,
  RiBarChartLine, RiArrowUpLine, RiTranslate2,
  RiLoader4Line, RiRefreshLine,
} from 'react-icons/ri'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { useAuth } from '@store/AuthContext'
import { getTranslationStats } from '@services/translationService'
import { getSessionCount } from '@services/historyService'

// ─────────────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalTranslations: number
  totalSessions:     number
  topGestures:       Array<{ name: string; count: number }>
  daily:             Array<{ date: string; count: number }>
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:  React.ElementType
  label: string
  value: string | number
  sub:   string
  color: string
  loading?: boolean
}

function StatCard({ icon: Icon, label, value, sub, color, loading }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-display font-bold text-white">{value}</p>
      )}
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
        <RiArrowUpLine size={12} />{sub}
      </p>
    </motion.div>
  )
}

// ─── Tooltip styles ────────────────────────────────────────────────────────────

const tooltipStyle = {
  background:   'rgba(10,10,26,0.9)',
  border:       '1px solid rgba(168,85,247,0.3)',
  borderRadius: 8,
  color:        '#F9FAFB',
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()

  const [stats,        setStats]        = useState<DashboardStats | null>(null)
  const [dataLoading,  setDataLoading]  = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  // Redirect unauthenticated users
  if (!authLoading && !user) return <Navigate to="/login" replace />

  // ── Fetch stats ─────────────────────────────────────────────────────────────

  const fetchStats = async () => {
    if (!user) return
    setDataLoading(true)
    setError(null)

    try {
      const [translationStats, sessionCount] = await Promise.all([
        getTranslationStats(user.id),
        getSessionCount(user.id),
      ])

      setStats({
        totalTranslations: translationStats.total,
        totalSessions:     sessionCount,
        topGestures:       translationStats.topGestures,
        daily:             translationStats.daily,
      })
      setLastRefreshed(new Date())
    } catch (e) {
      setError('Failed to load dashboard data. Please refresh.')
      console.error('[DashboardPage]', e)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (user) void fetchStats()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <RiDashboardLine size={18} className="text-purple-400" />
                </div>
                <h1 className="font-display font-bold text-3xl text-white">
                  Welcome back,{' '}
                  <span className="text-gradient">
                    {profile?.display_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Signer'}
                  </span>
                </h1>
              </div>
              <p className="text-gray-500 ml-12">Your sign language journey at a glance</p>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => void fetchStats()}
              disabled={dataLoading}
              title="Refresh stats"
              className="p-2 rounded-lg text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-40"
            >
              <RiRefreshLine size={18} className={dataLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Last refreshed */}
          <p className="text-xs text-gray-700 mt-2 ml-12">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Error banner */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => void fetchStats()} className="text-red-400 hover:text-red-300 underline text-xs">
              Retry
            </button>
          </motion.div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard loading={dataLoading} icon={RiHandHeartLine} label="Total Gestures"
            value={stats?.totalTranslations ?? 0} sub="All time" color="from-purple-500 to-violet-600" />
          <StatCard loading={dataLoading} icon={RiTranslate2} label="Translations"
            value={stats?.totalTranslations ?? 0} sub="Words recognized" color="from-violet-500 to-purple-700" />
          <StatCard loading={dataLoading} icon={RiTimeLine} label="Sessions"
            value={stats?.totalSessions ?? 0} sub="Translation sessions" color="from-purple-600 to-pink-600" />
          <StatCard loading={dataLoading} icon={RiBarChartLine} label="Profile"
            value={profile ? '✓ Active' : '–'} sub="Supabase connected" color="from-indigo-500 to-purple-600" />
        </div>

        {/* Charts */}
        {dataLoading ? (
          /* Skeleton loaders */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2].map(i => (
              <div key={i} className={`glass-card p-6 ${i === 1 ? 'lg:col-span-2' : ''}`}>
                <div className="h-5 w-40 bg-white/5 rounded-lg animate-pulse mb-4" />
                <div className="h-[220px] bg-white/[0.02] rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Weekly area chart */}
            <div className="lg:col-span-2 glass-card p-6">
              <h2 className="font-display font-semibold text-white mb-4">Gestures This Week</h2>
              {(stats?.daily.every(d => d.count === 0)) ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-center">
                  <RiHandHeartLine size={36} className="text-gray-700 mb-3" />
                  <p className="text-gray-500 text-sm">No translation data yet</p>
                  <Link to="/translate" className="text-purple-400 hover:text-purple-300 text-xs mt-2 underline">
                    Start translating →
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats?.daily ?? []}>
                    <defs>
                      <linearGradient id="gestureGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#A855F7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#4B5563" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis stroke="#4B5563" tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="count" name="Gestures" stroke="#A855F7" strokeWidth={2} fill="url(#gestureGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top gestures bar chart */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-white mb-4">Top Gestures</h2>
              {!stats?.topGestures.length ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-center">
                  <RiBarChartLine size={36} className="text-gray-700 mb-3" />
                  <p className="text-gray-500 text-sm">No gesture data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.topGestures} layout="vertical">
                    <XAxis type="number" stroke="#4B5563" tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={65} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Uses" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { to: '/translate', label: 'Start Translating',   icon: RiHandHeartLine, color: 'from-purple-500 to-violet-600' },
            { to: '/train',     label: 'Train New Gesture',   icon: RiBarChartLine,  color: 'from-violet-500 to-purple-700' },
            { to: '/learn',     label: 'Learn Sign Language', icon: RiTimeLine,       color: 'from-purple-600 to-pink-600'  },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card-hover p-5 flex items-center gap-4 cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="font-medium text-gray-200">{label}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Loading overlay for auth state */}
        {authLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RiLoader4Line size={36} className="text-purple-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
