import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScorecard } from '../hooks/useScorecard'
import LoadingSpinner from './LoadingSpinner'
import { ADELAIDE_UNI_TEAMS } from '../constants'

const isUni = t => ADELAIDE_UNI_TEAMS.includes(t)

function setLabel(teamName) {
  if (!teamName) return ''
  if (ADELAIDE_UNI_TEAMS.includes(teamName)) return teamName.split(' ').slice(-2).join(' ')
  return teamName.split(' ')[0]
}

function SetBar({ home, total }) {
  const pct = total > 0 ? (home / total) * 100 : 50
  return (
    <div className="h-1 rounded-full overflow-hidden bg-white/[0.06] flex">
      <div style={{ width: `${pct}%` }} className="bg-uni/70 rounded-full transition-all duration-500" />
    </div>
  )
}

export default function ScorecardModal({ scorecardId, match, onClose }) {
  const { scorecard, loading, error } = useScorecard(scorecardId)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const data = scorecard || match
  const validSets = data?.sets?.filter(s => !(s.home === 0 && s.away === 0)) || []

  const homeWonMatch = (data?.homeSets ?? 0) > (data?.awaySets ?? 0)
  const homeIsUni = isUni(data?.home)
  const awayIsUni = isUni(data?.away)

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
          style={{ border: '1px solid rgba(255,255,255,0.09)' }}
        >
          {/* Header band */}
          <div className="relative bg-s2 px-5 py-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Round {data?.round}</span>
              <span className="text-xs text-gray-700 ml-2">{data?.date}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/[0.07]"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Loading / error */}
          {loading && (
            <div className="bg-s2 px-5 pb-6">
              <LoadingSpinner message="Loading scorecard…" />
            </div>
          )}
          {error && (
            <div className="bg-s2 px-5 pb-6">
              <p className="text-red-400 text-sm text-center py-4">Could not load scorecard details.</p>
            </div>
          )}

          {data && (
            <>
              {/* Teams hero */}
              <div
                className="relative px-6 pt-5 pb-6"
                style={{
                  background: 'linear-gradient(160deg, #0f1929 0%, #111827 60%, #0d1117 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Subtle glow behind winner */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: homeWonMatch
                      ? `radial-gradient(ellipse 60% 70% at 15% 50%, ${homeIsUni ? 'rgba(0,79,158,0.22)' : 'rgba(0,201,167,0.12)'} 0%, transparent 70%)`
                      : `radial-gradient(ellipse 60% 70% at 85% 50%, ${awayIsUni ? 'rgba(0,79,158,0.22)' : 'rgba(0,201,167,0.12)'} 0%, transparent 70%)`,
                  }}
                />

                {/* Team names + score */}
                <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  {/* Home */}
                  <div className="text-center">
                    <p className={`font-display font-black text-lg leading-tight ${
                      homeIsUni ? 'text-uniLight' : homeWonMatch ? 'text-white' : 'text-gray-400'
                    }`}>
                      {data.home}
                    </p>
                    {homeWonMatch && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surf/20 text-surf border border-surf/30">
                        Winner
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-center shrink-0 px-2">
                    <p className="font-display font-black text-4xl text-white tracking-tight leading-none">
                      <span className={homeWonMatch ? 'text-white' : 'text-gray-500'}>{data.homeSets}</span>
                      <span className="text-gray-700 mx-1.5 text-3xl">—</span>
                      <span className={!homeWonMatch ? 'text-white' : 'text-gray-500'}>{data.awaySets}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-semibold uppercase tracking-widest">Sets</p>
                  </div>

                  {/* Away */}
                  <div className="text-center">
                    <p className={`font-display font-black text-lg leading-tight ${
                      awayIsUni ? 'text-uniLight' : !homeWonMatch ? 'text-white' : 'text-gray-400'
                    }`}>
                      {data.away}
                    </p>
                    {!homeWonMatch && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surf/20 text-surf border border-surf/30">
                        Winner
                      </span>
                    )}
                  </div>
                </div>

                {/* Total points row */}
                {data.homePoints != null && (
                  <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-4 pt-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-center font-mono font-semibold text-white text-base">{data.homePoints}</p>
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-600 w-16">Total pts</p>
                    <p className="text-center font-mono font-semibold text-white text-base">{data.awayPoints}</p>
                  </div>
                )}
              </div>

              {/* Set-by-set breakdown */}
              {validSets.length > 0 && (
                <div className="bg-s1 px-5 py-4">
                  {/* Column headers */}
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-3 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 w-10">Set</span>
                    <div className="grid grid-cols-[1fr_1fr] text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 truncate">
                        {setLabel(data.home)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 truncate">
                        {setLabel(data.away)}
                      </span>
                    </div>
                    <span className="w-0" />
                  </div>

                  <div className="space-y-2">
                    {validSets.map((s, i) => {
                      const homeWonSet = s.home > s.away
                      const total = s.home + s.away
                      return (
                        <motion.div
                          key={s.set}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                          className="rounded-xl overflow-hidden"
                          style={{
                            background: homeWonSet
                              ? 'linear-gradient(90deg, rgba(0,79,158,0.12) 0%, rgba(255,255,255,0.025) 100%)'
                              : 'linear-gradient(90deg, rgba(255,255,255,0.025) 0%, rgba(168,85,247,0.08) 100%)',
                            border: `1px solid ${homeWonSet ? 'rgba(0,79,158,0.2)' : 'rgba(168,85,247,0.15)'}`,
                          }}
                        >
                          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5">
                            <span className="text-xs font-bold text-gray-600 w-10">Set {s.set}</span>
                            <div className="grid grid-cols-2 text-center gap-2">
                              <span className={`font-mono font-black text-lg leading-none ${homeWonSet ? 'text-white' : 'text-gray-500'}`}>
                                {s.home}
                              </span>
                              <span className={`font-mono font-black text-lg leading-none ${!homeWonSet ? 'text-white' : 'text-gray-500'}`}>
                                {s.away}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md w-auto ${
                              homeWonSet
                                ? 'text-uniLight bg-uni/20'
                                : 'text-grape bg-grape/15'
                            }`}>
                              {homeWonSet
                                ? setLabel(data.home)
                                : setLabel(data.away)
                              }
                            </span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="px-3 pb-2.5">
                            <SetBar home={s.home} total={total} />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
