import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ADELAIDE_UNI_TEAMS } from '../constants'

const COLUMNS = [
  { key: 'rank',         label: '#',     fullLabel: 'Rank',            numeric: true  },
  { key: 'team',         label: 'Team',  fullLabel: 'Team',            numeric: false },
  { key: 'won',          label: 'W',     fullLabel: 'Won',             numeric: true,  cellColor: 'text-surf'        },
  { key: 'lost',         label: 'L',     fullLabel: 'Lost',            numeric: true,  cellColor: 'text-red-400/70'  },
  { key: 'played',       label: 'P',     fullLabel: 'Played',          numeric: true,  cellColor: 'text-uniGold/80'  },
  { key: 'setsFor',      label: 'SF',    fullLabel: 'Sets For',        numeric: true,  cellColor: 'text-surf/60'     },
  { key: 'setsAgainst',  label: 'SA',    fullLabel: 'Sets Against',    numeric: true,  cellColor: 'text-red-400/50'  },
  { key: 'setPercent',   label: 'Set%',  fullLabel: 'Set Percentage',  numeric: true,  format: v => (v * 100).toFixed(1) + '%' },
  { key: 'leaguePoints', label: 'Pts',   fullLabel: 'League Points',   numeric: true,  cellColor: 'text-uniGold font-bold' },
]

function RankDisplay({ rank }) {
  if (rank === 1) return <span className="rank-1">1</span>
  if (rank === 2) return <span className="rank-2">2</span>
  if (rank === 3) return <span className="rank-3">3</span>
  return <span className="text-gray-500">{rank}</span>
}

const rowVariants = {
  hidden: { opacity: 0, x: -4 },
  visible: i => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.2 } }),
}

export default function StandingsTable({ teams = [] }) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState('rank')
  const [sortAsc, setSortAsc] = useState(true)

  function handleSort(key) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(key === 'rank') }
  }

  const sorted = [...teams].sort((a, b) => {
    const av = a[sortKey]; const bv = b[sortKey]
    if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortAsc ? av - bv : bv - av
  })

  const isUni = team => ADELAIDE_UNI_TEAMS.includes(team)

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.07] shadow-card">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-s2/80">
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                title={col.fullLabel}
                aria-label={col.fullLabel}
                className={[
                  'py-2.5 select-none whitespace-nowrap cursor-pointer transition-colors hover:text-white',
                  col.key === 'rank' ? 'px-2 text-center w-8 sticky left-0 z-20 bg-s2' : '',
                  col.key === 'team' ? 'px-3 text-left sticky left-8 z-20 bg-s2 border-r border-white/[0.05]' : '',
                  col.key !== 'rank' && col.key !== 'team' ? `px-3 ${col.numeric ? 'text-right' : 'text-left'}` : '',
                  sortKey === col.key ? 'text-uniGold' : 'text-gray-500',
                ].join(' ')}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (
                    <span className="text-uniGold text-xs">{sortAsc ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const uni = isUni(row.team)
            const isOdd = i % 2 !== 0
            const stickyBg = uni ? 'sticky-uni' : isOdd ? 'sticky-alt' : 'sticky-dark'

            return (
              <motion.tr
                key={row.team}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className={[
                  'border-t border-white/[0.04] transition-colors duration-150',
                  uni ? 'uni-highlight hover:bg-uni/20' : 'hover:bg-white/[0.04]',
                  isOdd && !uni ? 'bg-white/[0.015]' : '',
                ].join(' ')}
              >
                {/* Rank — sticky */}
                <td className={`sticky left-0 z-10 px-2 py-2.5 text-center w-8 font-mono font-semibold ${stickyBg}`}>
                  <RankDisplay rank={row.rank} />
                </td>

                {/* Team — sticky */}
                <td
                  className={`sticky left-8 z-10 px-3 py-2.5 text-left border-r border-white/[0.05] font-medium cursor-pointer group ${stickyBg}`}
                  onClick={() => navigate(`/team/${encodeURIComponent(row.team)}`)}
                >
                  <span className={[
                    'transition-colors duration-150 group-hover:underline underline-offset-2',
                    uni ? 'text-uniLight font-bold' : 'text-gray-200 group-hover:text-white',
                  ].join(' ')}>
                    {row.team}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-500 text-xs">→</span>
                </td>

                {/* Other columns */}
                {COLUMNS.slice(2).map(col => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 ${col.numeric ? 'text-right tabular-nums font-mono' : 'text-left'} ${col.cellColor || 'text-gray-300'}`}
                  >
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
