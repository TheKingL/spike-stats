import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar } from '@nivo/bar'
import { motion } from 'framer-motion'
import { useStats } from '../hooks/useStats'
import { DIVISIONS, ADELAIDE_UNI_TEAMS } from '../constants'
import ScorecardModal from '../components/ScorecardModal'
import RadarChart from '../components/charts/RadarChart'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const nivoTheme = {
  background: 'transparent',
  textColor: '#64748b',
  fontSize: 11,
  fontFamily: 'Barlow, sans-serif',
  axis: {
    domain: { line: { stroke: '#1e293b' } },
    ticks: { line: { stroke: '#1e293b' }, text: { fill: '#64748b', fontSize: 11 } },
    legend: { text: { fill: '#475569', fontSize: 11 } },
  },
  grid: { line: { stroke: '#1e293b', strokeDasharray: '3 3' } },
  tooltip: {
    container: {
      background: '#1c2230',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      color: '#e2e8f0',
      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      fontSize: 12,
      padding: '8px 12px',
    },
  },
  crosshair: { line: { stroke: '#004F9E', strokeWidth: 1, strokeOpacity: 0.5, strokeDasharray: '4 4' } },
}

function findDivisionForTeam(teamName, standings) {
  for (const div of DIVISIONS) {
    const teams = standings?.divisions?.[div.id] || []
    if (teams.find(t => t.team === teamName)) return div
  }
  return null
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function Team() {
  const { teamName: encodedName } = useParams()
  const teamName = decodeURIComponent(encodedName)
  const { standings, fixtures, results, loading, error } = useStats()
  const [modal, setModal] = useState(null)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  const division = findDivisionForTeam(teamName, standings)
  if (!division) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Team not found: <span className="text-white font-semibold">{teamName}</span></p>
      </div>
    )
  }

  const divTeams  = standings?.divisions?.[division.id] || []
  const divResults = results?.divisions?.[division.id] || []

  const teamStanding = divTeams.find(t => t.team === teamName)

  const teamResults = divResults
    .filter(r => r.home === teamName || r.away === teamName)
    .sort((a, b) => a.round - b.round)

  const divAvg = divTeams.length > 0 ? {
    setPercent:   divTeams.reduce((s, t) => s + t.setPercent, 0) / divTeams.length,
    pointPercent: divTeams.reduce((s, t) => s + (t.pointPercent || 0), 0) / divTeams.length,
    won:   divTeams.reduce((s, t) => s + t.won, 0) / divTeams.length,
    played: divTeams.reduce((s, t) => s + t.played, 0) / divTeams.length,
  } : null

  const isUni = ADELAIDE_UNI_TEAMS.includes(teamName)

  // Points per match line data — two series (team + opponent for context)
  const lineData = teamResults.length > 0 ? [
    {
      id: 'Points Scored',
      color: '#004F9E',
      data: teamResults.map(r => ({
        x: `R${r.round}`,
        y: r.home === teamName ? r.homePoints : r.awayPoints,
      })),
    },
    {
      id: 'Opponent',
      color: '#475569',
      data: teamResults.map(r => ({
        x: `R${r.round}`,
        y: r.home === teamName ? r.awayPoints : r.homePoints,
      })),
    },
  ] : null

  // Set scores bar data per round
  const setBarData = teamResults.length > 0
    ? teamResults.map(r => {
        const isHome = r.home === teamName
        return {
          round: `R${r.round}`,
          'Sets Won':  isHome ? r.homeSets  : r.awaySets,
          'Sets Lost': isHome ? r.awaySets  : r.homeSets,
        }
      })
    : null

  const maxSets = setBarData
    ? Math.max(...setBarData.flatMap(d => [d['Sets Won'], d['Sets Lost']]))
    : 3
  const setYTicks = Array.from({ length: maxSets + 1 }, (_, i) => i)

  const winsCount  = teamResults.filter(r => (r.home === teamName ? r.homeSets : r.awaySets) > (r.home === teamName ? r.awaySets : r.homeSets)).length
  const winRate    = teamResults.length > 0 ? ((winsCount / teamResults.length) * 100).toFixed(0) : '-'

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={stagger}>

      {/* Header card */}
      <motion.div variants={fadeUp}
        className={`rounded-2xl p-6 border relative overflow-hidden ${
          isUni
            ? 'bg-uni/10 border-uni/25 shadow-glow'
            : 'bg-s2 border-white/[0.07] shadow-card'
        }`}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: isUni
              ? 'radial-gradient(ellipse 60% 80% at 100% 50%, rgba(0,79,158,0.15) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 80% at 100% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className={`font-display font-black text-3xl sm:text-4xl tracking-tight ${isUni ? 'text-uniLight' : 'text-white'}`}>
                {teamName}
              </h1>
              <p className="text-sm text-gray-400 mt-1">{division.label} · South Australian Volleyball League</p>
            </div>
            <Link
              to={`/compare?div=${division.id}&a=${encodeURIComponent(teamName)}`}
              className="px-3 py-1.5 rounded-lg border border-grape/40 text-grape text-xs font-semibold hover:bg-grape/10 transition-colors cursor-pointer"
            >
              ⚡ Compare
            </Link>
          </div>

          {teamStanding && (
            <div className="flex flex-wrap gap-6 mt-5">
              {[
                { label: 'Rank',    value: `#${teamStanding.rank}`, color: teamStanding.rank <= 3 ? 'text-uniGold' : 'text-white' },
                { label: 'Record',  value: `${teamStanding.won}W / ${teamStanding.lost}L` },
                { label: 'Set%',    value: `${(teamStanding.setPercent * 100).toFixed(1)}%` },
                { label: 'Pts',     value: teamStanding.leaguePoints },
                { label: 'Win Rate', value: winRate !== '-' ? `${winRate}%` : '-' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="stat-label">{label}</p>
                  <p className={`font-display font-black text-2xl ${color || 'text-white'}`}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Points per match chart */}
      {lineData && (
        <motion.div variants={fadeUp}>
          <h2 className="font-display font-bold text-lg text-white mb-3 tracking-wide">Points Per Match</h2>
          <div className="card p-4 h-64">
            <ResponsiveLine
              data={lineData}
              theme={nivoTheme}
              colors={d => d.color}
              margin={{ top: 16, right: 90, bottom: 40, left: 48 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              axisBottom={{ tickSize: 0, tickPadding: 8 }}
              axisLeft={{ tickSize: 0, tickPadding: 8, tickCount: 5 }}
              pointSize={7}
              pointColor="#0d1117"
              pointBorderWidth={2.5}
              pointBorderColor={{ from: 'serieColor' }}
              enableArea
              areaOpacity={0.08}
              enableGridX={false}
              useMesh
              legends={[{
                anchor: 'right',
                direction: 'column',
                translateX: 80,
                itemWidth: 76,
                itemHeight: 20,
                symbolSize: 8,
                symbolShape: 'circle',
                itemTextColor: '#64748b',
              }]}
              tooltip={({ point }) => (
                <div style={{ padding: '8px 12px', background: '#1c2230', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 12 }}>
                  <strong>{point.serieId}</strong> — {point.data.xFormatted}: <strong>{point.data.yFormatted} pts</strong>
                </div>
              )}
            />
          </div>
        </motion.div>
      )}

      {/* Set scores per round bar chart */}
      {setBarData && setBarData.length > 0 && (
        <motion.div variants={fadeUp}>
          <h2 className="font-display font-bold text-lg text-white mb-3 tracking-wide">Sets Won / Lost per Round</h2>
          <div className="card p-4 h-52">
            <ResponsiveBar
              data={setBarData}
              keys={['Sets Won', 'Sets Lost']}
              indexBy="round"
              theme={nivoTheme}
              colors={['#00c9a7', '#f87171']}
              groupMode="grouped"
              margin={{ top: 10, right: 20, bottom: 36, left: 32 }}
              padding={0.35}
              borderRadius={3}
              axisBottom={{ tickSize: 0, tickPadding: 8 }}
              axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: setYTicks }}
              enableLabel={false}
              isInteractive
              tooltip={({ id, value, indexValue }) => (
                <div style={{ padding: '8px 12px', background: '#1c2230', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 12 }}>
                  {indexValue} — <strong>{id}: {value}</strong>
                </div>
              )}
            />
          </div>
        </motion.div>
      )}

      {/* Radar vs division avg */}
      {teamStanding && divAvg && (
        <motion.div variants={fadeUp}>
          <h2 className="font-display font-bold text-lg text-white mb-3 tracking-wide">vs Division Average</h2>
          <div className="card p-4">
            <RadarChart teamName={teamName} teamData={teamStanding} divisionAvg={divAvg} />
          </div>
        </motion.div>
      )}

      {/* Match history */}
      <motion.div variants={fadeUp}>
        <h2 className="font-display font-bold text-lg text-white mb-3 tracking-wide">Match History</h2>
        {teamResults.length > 0 ? (
          <div className="rounded-xl border border-white/[0.07] overflow-hidden shadow-card">
            {teamResults.map((match, i) => {
              const isHome   = match.home === teamName
              const teamSets = isHome ? match.homeSets : match.awaySets
              const oppSets  = isHome ? match.awaySets : match.homeSets
              const won      = teamSets > oppSets
              const opponent = isHome ? match.away : match.home

              return (
                <div key={i} className={i > 0 ? 'border-t border-white/[0.04]' : ''}>
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-3 row-clickable hover:bg-white/[0.04] ${won ? 'border-l-[3px] border-surf' : 'border-l-[3px] border-red-500/70'}`}
                    onClick={() => match.scorecardId && setModal(match)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-gray-600 w-8 shrink-0 font-mono">R{match.round}</span>
                      <span className={won ? 'badge-win' : 'badge-loss'}>{won ? 'W' : 'L'}</span>
                      <span className="text-sm text-gray-300 truncate">
                        vs{' '}
                        <Link
                          to={`/team/${encodeURIComponent(opponent)}`}
                          onClick={e => e.stopPropagation()}
                          className={`hover:underline underline-offset-2 cursor-pointer transition-colors ${
                            ADELAIDE_UNI_TEAMS.includes(opponent) ? 'text-uniLight font-bold hover:text-uniGold' : 'hover:text-white'
                          }`}
                        >
                          {opponent}
                        </Link>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono font-bold text-white text-base">{teamSets} – {oppSets}</span>
                      <span className="text-xs text-gray-500 font-mono">
                        {isHome ? match.homePoints : match.awayPoints} pts
                      </span>
                      {match.scorecardId && (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No results yet.</p>
        )}
      </motion.div>

      {modal && (
        <ScorecardModal scorecardId={modal.scorecardId} match={modal} onClose={() => setModal(null)} />
      )}
    </motion.div>
  )
}
