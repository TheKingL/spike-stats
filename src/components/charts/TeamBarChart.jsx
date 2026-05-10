import { ResponsiveBar } from '@nivo/bar'
import { TEAM_COLORS, ADELAIDE_UNI_TEAMS } from '../../constants'

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

export default function TeamBarChart({ teams }) {
  if (!teams || teams.length === 0) return null

  const data = teams.map(t => ({
    team: t.team.replace('Adelaide Uni', 'Uni').replace(' D1M', '').replace(' D2M', '').replace(' D3M', '').replace(' D4M', ''),
    fullName: t.team,
    'Sets For': t.setsFor,
    'Sets Against': t.setsAgainst,
    isUni: ADELAIDE_UNI_TEAMS.includes(t.team),
  }))

  const getBarColor = (bar) => {
    if (bar.id === 'Sets For') {
      return bar.data.isUni ? '#1a6fce' : '#00c9a7'
    }
    return bar.data.isUni ? 'rgba(26,111,206,0.35)' : 'rgba(248,113,113,0.6)'
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveBar
        data={data}
        keys={['Sets For', 'Sets Against']}
        indexBy="team"
        theme={nivoTheme}
        colors={getBarColor}
        groupMode="grouped"
        margin={{ top: 16, right: 20, bottom: 72, left: 40 }}
        padding={0.3}
        innerPadding={2}
        borderRadius={4}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: -35,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          tickCount: 5,
        }}
        enableLabel={false}
        isInteractive
        tooltip={({ id, value, data: d }) => (
          <div style={{ padding: '8px 12px', background: '#1c2230', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 12 }}>
            <strong>{d.fullName}</strong><br />
            {id}: <strong>{value}</strong>
          </div>
        )}
        legends={[{
          dataFrom: 'keys',
          anchor: 'bottom',
          direction: 'row',
          translateY: 65,
          itemWidth: 100,
          itemHeight: 18,
          symbolSize: 10,
          symbolShape: 'circle',
          itemTextColor: '#94a3b8',
        }]}
      />
    </div>
  )
}
