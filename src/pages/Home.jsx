import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStats } from '../hooks/useStats'
import { DIVISIONS, DEFAULT_DIVISION_ID, ADELAIDE_UNI_TEAMS } from '../constants'
import StandingsTable from '../components/StandingsTable'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

function formatUpdated(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Australia/Adelaide',
  }) + ' ACST'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function Home() {
  const { standings, fixtures, results, loading, error } = useStats()
  const [activeDivId, setActiveDivId] = useState(DEFAULT_DIVISION_ID)

  if (loading) return <LoadingSpinner message="Loading stats..." />
  if (error) return <ErrorMessage message={error} />

  const noData = !standings && !fixtures && !results
  if (noData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="text-5xl">🏐</div>
        <h2 className="text-xl font-display font-bold text-white">No data yet</h2>
        <p className="text-gray-400 max-w-sm">Check back after the next Saturday at 22:00 ACST.</p>
      </div>
    )
  }

  const activeDivision = DIVISIONS.find(d => d.id === activeDivId)
  const divTeams = standings?.divisions?.[activeDivId] || []
  const divFixtures = fixtures?.divisions?.[activeDivId] || []
  const divResults = results?.divisions?.[activeDivId] || []

  const leader = divTeams[0]
  const uniTeams = divTeams.filter(t => activeDivision.adelaideUniTeams.includes(t.team))

  const completedKeys = new Set(divResults.map(r => `${r.round}-${r.home}-${r.away}`))
  const upcomingFixtures = divFixtures
    .filter(f => !completedKeys.has(`${f.round}-${f.home}-${f.away}`))
    .filter(f => activeDivision.adelaideUniTeams.some(t => t === f.home || t === f.away))
    .slice(0, activeDivId === 'D5M' ? 6 : 3)

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={stagger}>

      {/* Hero */}
      <motion.div variants={fadeUp} className="text-center py-10 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(0,79,158,0.18) 0%, transparent 70%)',
          }}
        />
        <h1 className="font-display font-black text-5xl sm:text-6xl tracking-tight mb-2 relative">
          <span className="text-uniLight">Spike</span>
          <span className="text-white">Stats</span>
        </h1>
        <p className="text-gray-400 text-base relative">
          Adelaide Uni SAVL tracker · updated every Saturday night
        </p>
        {standings?.updated && (
          <p className="mt-2 text-xs text-gray-600 relative">Last updated: {formatUpdated(standings.updated)}</p>
        )}
      </motion.div>

      {/* Division tab switcher — preview only */}
      <motion.div variants={fadeUp}>
        <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-2 px-1">
          Quick Preview by Division
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {DIVISIONS.map(div => (
            <button
              key={div.id}
              onClick={() => setActiveDivId(div.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${activeDivId === div.id
                ? 'tab-active ring-1 ring-uni/40'
                : 'tab-inactive bg-s2 border border-white/[0.06]'
                }`}
            >
              {div.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-1.5 px-1">
          For full standings, charts and results →{' '}
          <Link to={`/division/${activeDivision.gradeId}`} className="text-uniLight hover:text-uniGold transition-colors cursor-pointer">
            open {activeDivision.label} page
          </Link>
        </p>
      </motion.div>

      {/* Adelaide Uni stat cards */}
      {(leader || uniTeams.length > 0) && (
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {leader && (
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl p-4 cursor-pointer group"
              style={{
                background: 'linear-gradient(135deg, #1a1200 0%, #2a1e00 50%, #1c1500 100%)',
                border: '1px solid rgba(255,184,28,0.25)',
                boxShadow: '0 0 28px rgba(255,184,28,0.08), inset 0 1px 0 rgba(255,184,28,0.12)',
              }}
              onClick={() => window.location.href = `/team/${encodeURIComponent(leader.team)}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.18 }}
            >
              {/* Gold radial glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 90% 10%, rgba(255,184,28,0.18) 0%, transparent 65%)' }}
              />
              {/* Trophy watermark */}
              <div className="absolute right-3 bottom-1 text-5xl opacity-[0.07] pointer-events-none select-none leading-none">
                🏆
              </div>

              <p className="relative text-[10px] font-black uppercase tracking-[0.18em] text-uniGold/70 mb-2">
                Leader
              </p>
              <p className="relative font-display font-black text-xl text-white leading-tight truncate group-hover:text-uniGold transition-colors duration-200">
                {leader.team}
              </p>
              <div className="relative flex items-end gap-3 mt-2">
                <span className="font-display font-black text-3xl text-uniGold leading-none">{leader.leaguePoints}</span>
                <span className="text-xs text-uniGold/50 font-semibold mb-0.5">pts</span>
                <span className="text-xs text-gray-500 font-mono mb-0.5 ml-1">
                  {leader.won}W&nbsp;/&nbsp;{leader.lost}L
                </span>
              </div>
            </motion.div>
          )}
          {uniTeams.map(t => (
            <motion.div key={t.team} variants={fadeUp}
              className="bg-uni/10 border border-uni/20 rounded-2xl p-4 card-hover cursor-pointer shadow-glow/40 transition-all duration-200 hover:bg-uni/15 hover:border-uni/35"
              onClick={() => window.location.href = `/team/${encodeURIComponent(t.team)}`}
            >
              <p className="text-xs text-uniLight uppercase tracking-widest font-semibold mb-1 truncate">{t.team}</p>
              <p className="font-display font-black text-2xl text-white">#{t.rank}</p>
              <p className="text-sm text-gray-400 font-mono">{t.won}W / {t.lost}L · {(t.setPercent * 100).toFixed(0)}%</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Standings preview */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg text-white tracking-wide">
            {activeDivision.label} Standings
          </h2>
          <Link
            to={`/division/${activeDivision.gradeId}`}
            className="text-xs text-uniLight hover:text-uniGold transition-colors font-semibold cursor-pointer"
          >
            Full division →
          </Link>
        </div>
        {divTeams.length > 0
          ? <StandingsTable teams={divTeams} />
          : <p className="text-gray-500 text-sm">No standings data yet.</p>
        }
      </motion.div>

      {/* Upcoming Adelaide Uni fixtures */}
      {upcomingFixtures.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-white tracking-wide">
              Upcoming Adelaide Uni Fixtures
            </h2>
            <span className="text-xs text-gray-600">Next {upcomingFixtures.length} match{upcomingFixtures.length !== 1 ? 'es' : ''}</span>
          </div>
          <div className="space-y-2">
            {upcomingFixtures.map((f, i) => {
              const homeIsUni = ADELAIDE_UNI_TEAMS.includes(f.home)
              const awayIsUni = ADELAIDE_UNI_TEAMS.includes(f.away)
              return (
                <div key={i} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rd {f.round}</span>
                    <span className="text-xs text-gray-500">{formatDate(f.date)}</span>
                    {f.time && <span className="text-xs text-gray-600">{f.time}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Link
                      to={`/team/${encodeURIComponent(f.home)}`}
                      className={`font-semibold text-sm truncate cursor-pointer transition-colors ${homeIsUni ? 'text-uniLight hover:text-uniGold' : 'text-gray-300 hover:text-white'}`}
                    >
                      {f.home}
                    </Link>
                    <span className="text-gray-600 text-xs font-bold shrink-0">vs</span>
                    <Link
                      to={`/team/${encodeURIComponent(f.away)}`}
                      className={`font-semibold text-sm truncate cursor-pointer transition-colors ${awayIsUni ? 'text-uniLight hover:text-uniGold' : 'text-gray-300 hover:text-white'}`}
                    >
                      {f.away}
                    </Link>
                  </div>
                  {f.venue && (
                    <span className="text-xs text-gray-600 truncate max-w-[160px] hidden sm:block" title={f.venue}>
                      📍 {f.venue}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Compare teaser */}
      <motion.div variants={fadeUp}>
        <Link
          to={`/compare?div=${activeDivId}`}
          className="block card card-hover p-4 group cursor-pointer border-dashed"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-display font-bold text-white text-base group-hover:text-grape transition-colors">
                Compare Teams Head-to-Head
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Pick any two teams from {activeDivision.label} and see a full stat breakdown
              </p>
            </div>
            <span className="ml-auto text-gray-600 group-hover:text-grape transition-colors text-lg">→</span>
          </div>
        </Link>
      </motion.div>

    </motion.div>
  )
}
