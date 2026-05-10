import { ResponsiveBump } from '@nivo/bump'
import { ADELAIDE_UNI_TEAMS, TEAM_COLORS } from '../../constants'

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
}

function getSerieColor(id) {
  if (TEAM_COLORS[id]) return TEAM_COLORS[id]
  if (ADELAIDE_UNI_TEAMS.includes(id)) return '#004F9E'
  const palette = ['#00c9a7', '#f97316', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899']
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

export default function LadderBumpChart({ data }) {
  if (!data || data.length === 0) return null

  const maxY = Math.max(...data.map(s => Math.max(...s.data.map(d => d.y))))

  return (
    <div className="h-80 w-full">
      <ResponsiveBump
        data={data}
        theme={nivoTheme}
        colors={d => getSerieColor(d.id)}
        lineWidth={2.5}
        activeLineWidth={5}
        inactiveLineWidth={1.5}
        inactiveOpacity={0.15}
        pointSize={10}
        activePointSize={14}
        inactivePointSize={0}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2.5}
        activePointBorderWidth={3}
        pointBorderColor={{ from: 'serie.color' }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
          legend: 'Round',
          legendPosition: 'middle',
          legendOffset: 38,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          legend: '← Better',
          legendPosition: 'middle',
          legendOffset: -50,
          tickValues: Array.from({ length: maxY }, (_, i) => i + 1),
        }}
        margin={{ top: 20, right: 130, bottom: 50, left: 65 }}
        enableGridX={false}
        enableGridY
        isInteractive
        tooltip={({ serie, point }) => (
          <div style={{ padding: '8px 12px', background: '#1c2230', borderRadius: 8, border: `1px solid ${getSerieColor(serie.id)}40`, color: '#e2e8f0', fontSize: 12 }}>
            <span style={{ color: getSerieColor(serie.id), fontWeight: 700 }}>{serie.id}</span>
            <br />
            {point.data.x} — <strong>Rank #{point.data.y}</strong>
          </div>
        )}
      />
    </div>
  )
}
