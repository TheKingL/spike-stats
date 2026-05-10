import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStats } from '../hooks/useStats'
import { DIVISIONS, ADELAIDE_UNI_TEAMS } from '../constants'
import StandingsTable from '../components/StandingsTable'
import ScorecardModal from '../components/ScorecardModal'
import LadderBumpChart from '../components/charts/LadderBumpChart'
import TeamBarChart from '../components/charts/TeamBarChart'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

function buildBumpData(results, teams) {
  if (!results || results.length === 0 || !teams || teams.length === 0) return null
  const rounds = [...new Set(results.map(r => r.round))].sort((a, b) => a - b)
  if (rounds.length < 2) return null

  const teamNames = teams.map(t => t.team)
  const winsPerRound = {}
  for (const name of teamNames) {
    winsPerRound[name] = {}
    for (const r of rounds) winsPerRound[name][r] = 0
  }
  for (const r of results) {
    if (winsPerRound[r.home] && r.homeSets > r.awaySets) winsPerRound[r.home][r.round]++
    if (winsPerRound[r.away] && r.awaySets > r.homeSets) winsPerRound[r.away][r.round]++
  }
  const cumulativeWins = {}
  for (const name of teamNames) {
    cumulativeWins[name] = {}
    let total = 0
    for (const r of rounds) {
      total += winsPerRound[name][r]
      cumulativeWins[name][r] = total
    }
  }
  return teamNames.map(name => ({
    id: name,
    data: rounds.map(r => {
      const sorted = [...teamNames].sort((a, b) => (cumulativeWins[b][r] || 0) - (cumulativeWins[a][r] || 0))
      return { x: `R${r}`, y: sorted.indexOf(name) + 1 }
    }),
  }))
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function Division() {
  const { gradeId } = useParams()
  const { standings, fixtures, results, loading, error } = useStats()
  const [modal, setModal] = useState(null)
  const [roundFilter, setRoundFilter] = useState('all')

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorMessage message={error} />

  const division = DIVISIONS.find(d => d.gradeId === gradeId)
  if (!division) return <ErrorMessage message={`Unknown division: ${gradeId}`} />

  const divTeams    = standings?.divisions?.[division.id] || []
  const divFixtures = fixtures?.divisions?.[division.id] || []
  const divResults  = results?.divisions?.[division.id] || []

  const bumpData = buildBumpData(divResults, divTeams)

  const allMatches = divFixtures.map(f => {
    const result = divResults.find(r => r.round === f.round && r.home === f.home && r.away === f.away)
    return result ? { ...f, ...result, hasResult: true } : { ...f, hasResult: false }
  })

  const rounds = [...new Set(allMatches.map(m => m.round))].sort((a, b) => a - b)
  const filteredMatches = roundFilter === 'all' ? allMatches : allMatches.filter(m => m.round === Number(roundFilter))

  return (
    <motion.div className="space-y-10" initial="hidden" animate="visible" variants={stagger}>

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-tight">{division.label}</h1>
          <p className="text-sm text-gray-500 mt-1">South Australian Volleyball League</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/compare?div=${division.id}`}
            className="px-4 py-2 rounded-xl border border-grape/40 text-grape text-sm font-semibold hover:bg-grape/10 transition-colors cursor-pointer"
          >
            ⚡ Compare Teams
          </Link>
        </div>
      </motion.div>

      {/* Standings */}
      <motion.section variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-xl text-white tracking-wide">Standings</h2>
          {divTeams.length > 0 && (
            <span className="text-xs text-gray-600">{divTeams.length} teams</span>
          )}
        </div>
        {divTeams.length > 0
          ? <StandingsTable teams={divTeams} />
          : <p className="text-gray-500 text-sm">No standings data yet.</p>
        }
      </motion.section>

      {/* Ladder bump chart */}
      {bumpData && (
        <motion.section variants={fadeUp}>
          <h2 className="font-display font-bold text-xl text-white mb-3 tracking-wide">Ladder Progression</h2>
          <div className="card p-4">
            <LadderBumpChart data={bumpData} />
          </div>
        </motion.section>
      )}

      {/* Sets For vs Against bar chart */}
      {divTeams.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="font-display font-bold text-xl text-white mb-3 tracking-wide">Sets For vs Against</h2>
          <div className="card p-4">
            <TeamBarChart teams={divTeams} />
          </div>
        </motion.section>
      )}

      {/* Fixtures & Results */}
      <motion.section variants={fadeUp}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display font-bold text-xl text-white tracking-wide">Fixtures & Results</h2>
          {rounds.length > 1 && (
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setRoundFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap
                  ${roundFilter === 'all' ? 'bg-uni text-white' : 'text-gray-500 hover:text-white bg-s2 border border-white/[0.06]'}`}
              >
                All
              </button>
              {rounds.map(r => (
                <button
                  key={r}
                  onClick={() => setRoundFilter(r === roundFilter ? 'all' : r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap
                    ${roundFilter === r ? 'bg-uni text-white' : 'text-gray-500 hover:text-white bg-s2 border border-white/[0.06]'}`}
                >
                  R{r}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredMatches.length > 0 ? (
          <div className="space-y-3">
            {[...new Set(filteredMatches.map(m => m.round))].sort((a, b) => a - b).map(round => (
              <div key={round}>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2 px-1">
                  Round {round}
                </p>
                <div className="rounded-xl border border-white/[0.07] overflow-hidden shadow-card">
                  {filteredMatches.filter(m => m.round === round).map((match, i) => {
                    const homeIsUni = ADELAIDE_UNI_TEAMS.includes(match.home)
                    const awayIsUni = ADELAIDE_UNI_TEAMS.includes(match.away)
                    const homeWon   = match.hasResult && match.homeSets > match.awaySets
                    const awayWon   = match.hasResult && match.awaySets > match.homeSets

                    return (
                      <div
                        key={i}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2
                          ${i > 0 ? 'border-t border-white/[0.04]' : ''}
                          ${i % 2 !== 0 ? 'bg-white/[0.015]' : ''}
                          ${match.hasResult ? 'row-clickable hover:bg-white/[0.05]' : ''}`}
                        onClick={match.hasResult ? () => setModal(match) : undefined}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs text-gray-600 w-20 shrink-0 font-mono">{match.date}</span>
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <Link
                              to={`/team/${encodeURIComponent(match.home)}`}
                              onClick={e => e.stopPropagation()}
                              className={`font-semibold text-sm cursor-pointer hover:underline underline-offset-2 transition-colors
                                ${homeIsUni ? 'text-uniLight hover:text-uniGold' : 'text-gray-200 hover:text-white'}
                                ${match.hasResult && homeWon ? 'opacity-100' : match.hasResult ? 'opacity-60' : ''}`}
                            >
                              {match.home}
                            </Link>
                            <span className="text-gray-600 text-xs shrink-0 font-bold">vs</span>
                            <Link
                              to={`/team/${encodeURIComponent(match.away)}`}
                              onClick={e => e.stopPropagation()}
                              className={`font-semibold text-sm cursor-pointer hover:underline underline-offset-2 transition-colors
                                ${awayIsUni ? 'text-uniLight hover:text-uniGold' : 'text-gray-200 hover:text-white'}
                                ${match.hasResult && awayWon ? 'opacity-100' : match.hasResult ? 'opacity-60' : ''}`}
                            >
                              {match.away}
                            </Link>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-3">
                          {match.hasResult ? (
                            <>
                              <span className="font-mono font-bold text-white text-base">
                                {match.homeSets} – {match.awaySets}
                              </span>
                              <span className="text-xs text-gray-600">
                                ({match.homePoints}–{match.awayPoints} pts)
                              </span>
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          ) : (
                            <span className="text-xs text-gray-600 font-mono">{match.time || 'TBC'}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No fixtures data yet.</p>
        )}
      </motion.section>

      {modal && (
        <ScorecardModal scorecardId={modal.scorecardId} match={modal} onClose={() => setModal(null)} />
      )}
    </motion.div>
  )
}
