import { ADELAIDE_UNI_TEAMS } from '../constants'

function groupByRound(items) {
  const map = {}
  for (const item of items) {
    const r = item.round
    if (!map[r]) map[r] = []
    map[r].push(item)
  }
  return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

const isUni = team => ADELAIDE_UNI_TEAMS.includes(team)

export default function FixturesTable({ fixtures = [], results = [], limit = null }) {
  const resultMap = {}
  for (const r of results) {
    const key = `${r.round}-${r.home}-${r.away}`
    resultMap[key] = r
  }

  let items = [...fixtures]
  if (limit) items = items.slice(0, limit)

  const grouped = groupByRound(items)

  return (
    <div className="space-y-4">
      {grouped.map(([round, matches]) => (
        <div key={round}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 px-1">
            Round {round}
          </h3>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            {matches.map((match, i) => {
              const key = `${match.round}-${match.home}-${match.away}`
              const result = resultMap[key]
              const hasResult = !!result
              const homeIsUni = isUni(match.home)
              const awayIsUni = isUni(match.away)

              return (
                <div
                  key={i}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2 ${i > 0 ? 'border-t border-white/[0.04]' : ''} ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-gray-500 w-20 shrink-0">{formatDate(match.date)}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`truncate ${homeIsUni ? 'text-uni font-bold' : 'text-gray-200'}`}>
                        {match.home}
                      </span>
                      <span className="text-gray-600 text-xs shrink-0">vs</span>
                      <span className={`truncate ${awayIsUni ? 'text-uni font-bold' : 'text-gray-200'}`}>
                        {match.away}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-sm">
                    {hasResult ? (
                      <span className="font-mono font-semibold text-white">
                        {result.homeSets} – {result.awaySets}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">{match.time || 'TBC'}</span>
                    )}
                    {match.venue && (
                      <span className="hidden sm:block text-xs text-gray-600 max-w-[160px] truncate" title={match.venue}>
                        {match.venue}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
