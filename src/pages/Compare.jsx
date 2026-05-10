import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ResponsiveRadar } from '@nivo/radar'
import { ResponsiveBar } from '@nivo/bar'
import { motion } from 'framer-motion'
import { useStats } from '../hooks/useStats'
import { DIVISIONS, ADELAIDE_UNI_TEAMS } from '../constants'
import ScorecardModal from '../components/ScorecardModal'
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
  legends: { text: { fill: '#94a3b8', fontSize: 11 } },
}

const TEAM_A_COLOR = '#1a6fce'
const TEAM_B_COLOR = '#a855f7'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

function shortName(name) {
  return name.replace('Adelaide Uni', 'Uni').replace(/\s+(D[1-5]M)/, '')
}

function StatCompareRow({ label, a, b, higherIsBetter = true, format = v => v }) {
  const aNum = parseFloat(a)
  const bNum = parseFloat(b)
  const aWins = higherIsBetter ? aNum > bNum : aNum < bNum
  const bWins = higherIsBetter ? bNum > aNum : bNum < aNum
  const equal = aNum === bNum

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3 border-b border-white/[0.05]">
      <div className={`text-right font-mono font-bold text-lg transition-colors ${
        aWins && !equal ? 'text-uniGold' : equal ? 'text-gray-400' : 'text-red-400/70'
      }`}>
        {format(a)}
        {aWins && !equal && <span className="ml-1 text-xs text-uniGold">▲</span>}
        {!aWins && !equal && <span className="ml-1 text-xs text-red-500/60">▼</span>}
      </div>
      <div className="text-center px-3">
        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-left font-mono font-bold text-lg transition-colors ${
        bWins && !equal ? 'text-uniGold' : equal ? 'text-gray-400' : 'text-red-400/70'
      }`}>
        {equal && <span className="mr-1 text-[10px] text-gray-600 font-semibold">=</span>}
        {format(b)}
        {bWins && !equal && <span className="ml-1 text-xs text-uniGold">▲</span>}
        {!bWins && !equal && <span className="ml-1 text-xs text-red-500/60">▼</span>}
      </div>
    </div>
  )
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { standings, results, loading, error } = useStats()
  const [modal, setModal] = useState(null)

  const divParam  = searchParams.get('div') || DIVISIONS[4].id
  const teamAParam = searchParams.get('a') || ''
  const teamBParam = searchParams.get('b') || ''

  const activeDivision = DIVISIONS.find(d => d.id === divParam) || DIVISIONS[4]
  const divTeams   = standings?.divisions?.[activeDivision.id] || []
  const divResults  = results?.divisions?.[activeDivision.id] || []

  const teamAData = divTeams.find(t => t.team === teamAParam) || null
  const teamBData = divTeams.find(t => t.team === teamBParam) || null

  const headToHead = useMemo(() =>
    divResults.filter(r =>
      (r.home === teamAParam && r.away === teamBParam) ||
      (r.home === teamBParam && r.away === teamAParam)
    ),
    [divResults, teamAParam, teamBParam]
  )

  const teamAResults = useMemo(() =>
    divResults.filter(r => r.home === teamAParam || r.away === teamAParam),
    [divResults, teamAParam]
  )
  const teamBResults = useMemo(() =>
    divResults.filter(r => r.home === teamBParam || r.away === teamBParam),
    [divResults, teamBParam]
  )

  function setParam(key, val) {
    const next = new URLSearchParams(searchParams)
    next.set(key, val)
    setSearchParams(next)
  }

  const canCompare = teamAData && teamBData && teamAParam !== teamBParam

  const snA = canCompare ? shortName(teamAParam) : 'A'
  const snB = canCompare ? shortName(teamBParam) : 'B'

  // Radar data — 3 clear percentage metrics, keyed by real team names
  const radarData = canCompare ? [
    { metric: 'Win Rate', [snA]: +((teamAData.won / Math.max(1, teamAData.played)) * 100).toFixed(1), [snB]: +((teamBData.won / Math.max(1, teamBData.played)) * 100).toFixed(1) },
    { metric: 'Set%',     [snA]: +(teamAData.setPercent * 100).toFixed(1),   [snB]: +(teamBData.setPercent * 100).toFixed(1) },
    { metric: 'Point%',   [snA]: +((teamAData.pointPercent || 0) * 100).toFixed(1), [snB]: +((teamBData.pointPercent || 0) * 100).toFixed(1) },
  ] : []

  // Split bar data: sets vs points
  const setsBarData = canCompare ? [
    { stat: 'Sets For',    [shortName(teamAParam)]: teamAData.setsFor,     [shortName(teamBParam)]: teamBData.setsFor },
    { stat: 'Sets Against', [shortName(teamAParam)]: teamAData.setsAgainst, [shortName(teamBParam)]: teamBData.setsAgainst },
  ] : []

  const ptsBarData = canCompare ? [
    { stat: 'Points For',     [shortName(teamAParam)]: teamAData.pointsFor,     [shortName(teamBParam)]: teamBData.pointsFor },
    { stat: 'Points Against', [shortName(teamAParam)]: teamAData.pointsAgainst, [shortName(teamBParam)]: teamBData.pointsAgainst },
  ] : []

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorMessage message={error} />

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={stagger}>

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display font-black text-4xl text-white tracking-tight mb-1">Compare Teams</h1>
        <p className="text-gray-500 text-sm">Head-to-head stats comparison within the same division</p>
      </motion.div>

      {/* Division selector */}
      <motion.div variants={fadeUp}>
        <p className="stat-label mb-2">Division</p>
        <div className="flex gap-1.5 flex-wrap">
          {DIVISIONS.map(div => (
            <button
              key={div.id}
              onClick={() => {
                const next = new URLSearchParams()
                next.set('div', div.id)
                setSearchParams(next)
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer
                ${activeDivision.id === div.id
                  ? 'bg-uni text-white shadow-glow'
                  : 'bg-s2 text-gray-400 border border-white/[0.07] hover:text-white hover:border-white/20'}`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Team selectors */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Team A */}
        <div>
          <p className="stat-label mb-2" style={{ color: TEAM_A_COLOR }}>Team A</p>
          <div className="relative">
            <select
              value={teamAParam}
              onChange={e => setParam('a', e.target.value)}
              className="w-full bg-s2 border border-[#1a6fce]/40 text-white rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer appearance-none focus:outline-none focus:border-[#1a6fce] transition-colors"
              style={{ borderColor: teamAParam ? TEAM_A_COLOR + '60' : undefined }}
            >
              <option value="">Select Team A…</option>
              {divTeams.map(t => (
                <option key={t.team} value={t.team} disabled={t.team === teamBParam}>
                  #{t.rank} {t.team}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</div>
          </div>
          {teamAParam && (
            <Link to={`/team/${encodeURIComponent(teamAParam)}`} className="text-xs text-[#1a6fce] hover:text-uniGold transition-colors mt-1 inline-block cursor-pointer">
              View {shortName(teamAParam)} page →
            </Link>
          )}
        </div>

        {/* Team B */}
        <div>
          <p className="stat-label mb-2" style={{ color: TEAM_B_COLOR }}>Team B</p>
          <div className="relative">
            <select
              value={teamBParam}
              onChange={e => setParam('b', e.target.value)}
              className="w-full bg-s2 border border-grape/40 text-white rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer appearance-none focus:outline-none focus:border-grape transition-colors"
              style={{ borderColor: teamBParam ? TEAM_B_COLOR + '60' : undefined }}
            >
              <option value="">Select Team B…</option>
              {divTeams.map(t => (
                <option key={t.team} value={t.team} disabled={t.team === teamAParam}>
                  #{t.rank} {t.team}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</div>
          </div>
          {teamBParam && (
            <Link to={`/team/${encodeURIComponent(teamBParam)}`} className="text-xs text-grape hover:text-uniGold transition-colors mt-1 inline-block cursor-pointer">
              View {shortName(teamBParam)} page →
            </Link>
          )}
        </div>
      </motion.div>

      {!canCompare && (
        <motion.div variants={fadeUp} className="card p-8 text-center">
          <p className="text-2xl mb-2">⚡</p>
          <p className="text-gray-400 text-sm">Select two different teams from the same division to compare</p>
        </motion.div>
      )}

      {canCompare && (
        <>
          {/* Vs header */}
          <motion.div variants={fadeUp} className="card p-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${TEAM_A_COLOR}18 0%, transparent 40%, ${TEAM_B_COLOR}18 100%)` }}
            />
            <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="text-center">
                <Link to={`/team/${encodeURIComponent(teamAParam)}`} className="font-display font-black text-xl sm:text-2xl text-white hover:text-[#1a6fce] transition-colors cursor-pointer block">
                  {teamAParam}
                </Link>
                <p className="text-sm font-mono mt-1" style={{ color: TEAM_A_COLOR }}>
                  #{teamAData.rank} · {teamAData.won}W/{teamAData.lost}L
                </p>
              </div>
              <div className="text-center">
                <span className="font-display font-black text-2xl text-gray-600">VS</span>
              </div>
              <div className="text-center">
                <Link to={`/team/${encodeURIComponent(teamBParam)}`} className="font-display font-black text-xl sm:text-2xl text-white hover:text-grape transition-colors cursor-pointer block">
                  {teamBParam}
                </Link>
                <p className="text-sm font-mono mt-1" style={{ color: TEAM_B_COLOR }}>
                  #{teamBData.rank} · {teamBData.won}W/{teamBData.lost}L
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stat rows comparison */}
          <motion.div variants={fadeUp} className="card p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] mb-3">
              <p className="text-right text-xs font-bold uppercase tracking-wider" style={{ color: TEAM_A_COLOR }}>{shortName(teamAParam)}</p>
              <div className="w-20" />
              <p className="text-left text-xs font-bold uppercase tracking-wider" style={{ color: TEAM_B_COLOR }}>{shortName(teamBParam)}</p>
            </div>
            <StatCompareRow label="Rank" a={teamAData.rank} b={teamBData.rank} higherIsBetter={false} format={v => `#${v}`} />
            <StatCompareRow label="Played" a={teamAData.played} b={teamBData.played} higherIsBetter={true} />
            <StatCompareRow label="Won" a={teamAData.won} b={teamBData.won} />
            <StatCompareRow label="Lost" a={teamAData.lost} b={teamBData.lost} higherIsBetter={false} />
            <StatCompareRow label="Sets For" a={teamAData.setsFor} b={teamBData.setsFor} />
            <StatCompareRow label="Sets Agnst" a={teamAData.setsAgainst} b={teamBData.setsAgainst} higherIsBetter={false} />
            <StatCompareRow label="Set%" a={(teamAData.setPercent * 100).toFixed(1)} b={(teamBData.setPercent * 100).toFixed(1)} format={v => `${v}%`} />
            <StatCompareRow label="Point%" a={((teamAData.pointPercent || 0) * 100).toFixed(1)} b={((teamBData.pointPercent || 0) * 100).toFixed(1)} format={v => `${v}%`} />
            <StatCompareRow label="League Pts" a={teamAData.leaguePoints} b={teamBData.leaguePoints} />
          </motion.div>

          {/* Radar chart */}
          <motion.div variants={fadeUp}>
            <h2 className="font-display font-bold text-xl text-white mb-3 tracking-wide">Stat Radar</h2>
            <div className="card p-4 h-72">
              <ResponsiveRadar
                data={radarData}
                keys={[snA, snB]}
                indexBy="metric"
                theme={{
                  ...nivoTheme,
                  textColor: '#94a3b8',
                  fontSize: 13,
                  fontFamily: 'Barlow Condensed, sans-serif',
                }}
                colors={[TEAM_A_COLOR, TEAM_B_COLOR]}
                fillOpacity={0.2}
                borderWidth={2.5}
                borderColor={{ from: 'color' }}
                gridLevels={4}
                gridShape="circular"
                dotSize={8}
                dotColor={{ theme: 'background' }}
                dotBorderWidth={2.5}
                dotBorderColor={{ from: 'color' }}
                enableDotLabel={false}
                maxValue={100}
                margin={{ top: 50, right: 90, bottom: 50, left: 90 }}
                isInteractive
                tooltip={({ index, data: d }) => (
                  <div style={{ padding: '8px 12px', background: '#1c2230', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 12, lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{index}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: TEAM_A_COLOR, flexShrink: 0 }} />
                      {snA}: <strong>{d[snA]}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: TEAM_B_COLOR, flexShrink: 0 }} />
                      {snB}: <strong>{d[snB]}</strong>
                    </div>
                  </div>
                )}
                legends={[{
                  anchor: 'top-right',
                  direction: 'column',
                  translateX: 70,
                  translateY: -35,
                  itemWidth: 80,
                  itemHeight: 18,
                  symbolSize: 8,
                  symbolShape: 'circle',
                  data: [
                    { id: snA, label: snA, color: TEAM_A_COLOR },
                    { id: snB, label: snB, color: TEAM_B_COLOR },
                  ],
                  itemTextColor: '#94a3b8',
                  effects: [{ on: 'hover', style: { itemTextColor: '#e2e8f0' } }],
                }]}
              />
            </div>
          </motion.div>

          {/* Sets bar chart */}
          <motion.div variants={fadeUp}>
            <h2 className="font-display font-bold text-xl text-white mb-3 tracking-wide">Sets Comparison</h2>
            <div className="card p-4 h-52">
              <ResponsiveBar
                data={setsBarData}
                keys={[shortName(teamAParam), shortName(teamBParam)]}
                indexBy="stat"
                theme={nivoTheme}
                colors={[TEAM_A_COLOR, TEAM_B_COLOR]}
                groupMode="grouped"
                margin={{ top: 10, right: 20, bottom: 40, left: 36 }}
                padding={0.4}
                innerPadding={3}
                borderRadius={5}
                axisBottom={{ tickSize: 0, tickPadding: 8 }}
                axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: Array.from({ length: Math.max(setsBarData[0]?.[shortName(teamAParam)] ?? 0, setsBarData[0]?.[shortName(teamBParam)] ?? 0, setsBarData[1]?.[shortName(teamAParam)] ?? 0, setsBarData[1]?.[shortName(teamBParam)] ?? 0) + 1 }, (_, i) => i) }}
                enableLabel={false}
                legends={[{
                  dataFrom: 'keys',
                  anchor: 'bottom',
                  direction: 'row',
                  translateY: 38,
                  itemWidth: 120,
                  itemHeight: 16,
                  symbolSize: 8,
                  symbolShape: 'circle',
                  itemTextColor: '#94a3b8',
                }]}
              />
            </div>
          </motion.div>

          {/* Points bar chart */}
          <motion.div variants={fadeUp}>
            <h2 className="font-display font-bold text-xl text-white mb-3 tracking-wide">Points Comparison</h2>
            <div className="card p-4 h-52">
              <ResponsiveBar
                data={ptsBarData}
                keys={[shortName(teamAParam), shortName(teamBParam)]}
                indexBy="stat"
                theme={nivoTheme}
                colors={[TEAM_A_COLOR, TEAM_B_COLOR]}
                groupMode="grouped"
                margin={{ top: 10, right: 20, bottom: 40, left: 48 }}
                padding={0.4}
                innerPadding={3}
                borderRadius={5}
                axisBottom={{ tickSize: 0, tickPadding: 8 }}
                axisLeft={{ tickSize: 0, tickPadding: 8, tickCount: 5 }}
                enableLabel={false}
                legends={[{
                  dataFrom: 'keys',
                  anchor: 'bottom',
                  direction: 'row',
                  translateY: 38,
                  itemWidth: 120,
                  itemHeight: 16,
                  symbolSize: 8,
                  symbolShape: 'circle',
                  itemTextColor: '#94a3b8',
                }]}
              />
            </div>
          </motion.div>

          {/* Head-to-head */}
          {headToHead.length > 0 && (
            <motion.div variants={fadeUp}>
              <h2 className="font-display font-bold text-xl text-white mb-3 tracking-wide">
                Head to Head ({headToHead.length} match{headToHead.length !== 1 ? 'es' : ''})
              </h2>
              <div className="card overflow-hidden">
                {headToHead.map((match, i) => {
                  const aIsHome = match.home === teamAParam
                  const aSets = aIsHome ? match.homeSets : match.awaySets
                  const bSets = aIsHome ? match.awaySets : match.homeSets
                  const aWon  = aSets > bSets

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-5 py-3 gap-4 row-clickable hover:bg-white/[0.04] ${i > 0 ? 'border-t border-white/[0.05]' : ''}`}
                      onClick={() => match.scorecardId && setModal(match)}
                    >
                      <span className="text-xs text-gray-600 font-mono w-20 shrink-0">R{match.round} · {match.date}</span>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`text-sm font-semibold truncate ${aWon ? 'text-[#1a6fce]' : 'text-gray-500'}`}>{teamAParam}</span>
                        <span className="font-display font-black text-base text-white shrink-0">{aSets} – {bSets}</span>
                        <span className={`text-sm font-semibold truncate ${!aWon ? 'text-grape' : 'text-gray-500'}`}>{teamBParam}</span>
                      </div>
                      {match.scorecardId && (
                        <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Match history side by side */}
          <motion.div variants={fadeUp}>
            <h2 className="font-display font-bold text-xl text-white mb-3 tracking-wide">Match History</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: teamAParam, res: teamAResults, color: TEAM_A_COLOR, sn: snA },
                { name: teamBParam, res: teamBResults, color: TEAM_B_COLOR, sn: snB },
              ].map(({ name, res, color, sn }) => (
                <div key={name} className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                    <Link
                      to={`/team/${encodeURIComponent(name)}`}
                      className="text-xs font-black uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color }}
                    >
                      {sn} →
                    </Link>
                    <span className="text-[10px] text-gray-600 font-semibold">{res.length} match{res.length !== 1 ? 'es' : ''}</span>
                  </div>
                  {res.length === 0 && (
                    <p className="px-4 py-4 text-xs text-gray-600 text-center">No results yet</p>
                  )}
                  {res.map((match, i) => {
                    const isOwnHome = match.home === name
                    const mySets  = isOwnHome ? match.homeSets  : match.awaySets
                    const oppSets = isOwnHome ? match.awaySets  : match.homeSets
                    const won     = mySets > oppSets
                    const opp     = isOwnHome ? match.away : match.home
                    return (
                      <div key={i} className={i > 0 ? 'border-t border-white/[0.04]' : ''}>
                      <div
                        className={`flex items-center gap-3 px-4 py-2.5 row-clickable hover:bg-white/[0.04] transition-colors
                          ${won ? 'border-l-2 border-surf' : 'border-l-2 border-red-500/50'}`}
                        onClick={() => match.scorecardId && setModal(match)}
                      >
                        <span className="text-[10px] text-gray-600 font-mono w-6 shrink-0">R{match.round}</span>
                        <span className={won ? 'badge-win' : 'badge-loss'}>{won ? 'W' : 'L'}</span>
                        <span className="text-xs text-gray-400 truncate flex-1">
                          vs{' '}
                          <Link
                            to={`/team/${encodeURIComponent(opp)}`}
                            onClick={e => e.stopPropagation()}
                            className="hover:text-white hover:underline underline-offset-2 cursor-pointer transition-colors"
                          >
                            {shortName(opp)}
                          </Link>
                        </span>
                        <span className={`text-xs font-mono font-black shrink-0 ${won ? 'text-surf' : 'text-red-400'}`}>
                          {mySets}–{oppSets}
                        </span>
                        {match.scorecardId && (
                          <svg className="w-3 h-3 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {modal && (
        <ScorecardModal scorecardId={modal.scorecardId} match={modal} onClose={() => setModal(null)} />
      )}
    </motion.div>
  )
}
