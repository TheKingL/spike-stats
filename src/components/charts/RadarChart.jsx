import { ResponsiveRadar } from '@nivo/radar'

const nivoTheme = {
  background: 'transparent',
  textColor: '#94a3b8',
  fontSize: 12,
  fontFamily: 'Barlow Condensed, sans-serif',
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

export default function RadarChart({ teamName, teamData, divisionAvg }) {
  if (!teamData || !divisionAvg) return null

  const shortN = teamName.replace('Adelaide Uni', 'Uni').replace(/\s+(D[0-9]M)/, '')

  const data = [
    {
      metric: 'Win Rate',
      [shortN]: +(teamData.played ? (teamData.won / teamData.played) * 100 : 0).toFixed(1),
      'Div Avg': +(divisionAvg.played ? (divisionAvg.won / divisionAvg.played) * 100 : 0).toFixed(1),
    },
    {
      metric: 'Set%',
      [shortN]: +(teamData.setPercent * 100).toFixed(1),
      'Div Avg': +(divisionAvg.setPercent * 100).toFixed(1),
    },
    {
      metric: 'Point%',
      [shortN]: +((teamData.pointPercent || 0) * 100).toFixed(1),
      'Div Avg': +((divisionAvg.pointPercent || 0) * 100).toFixed(1),
    },
  ]

  return (
    <div className="h-72 w-full">
      <ResponsiveRadar
        data={data}
        keys={[shortN, 'Div Avg']}
        indexBy="metric"
        theme={nivoTheme}
        colors={['#1a6fce', '#475569']}
        fillOpacity={0.22}
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
        margin={{ top: 50, right: 80, bottom: 50, left: 80 }}
        isInteractive
        tooltip={({ index, data: d }) => (
          <div style={{ padding: '8px 12px', background: '#1c2230', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{index}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a6fce', display: 'inline-block' }} />
              {shortN}: <strong>{d[shortN]}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#475569', display: 'inline-block' }} />
              Div Avg: <strong>{d['Div Avg']}</strong>
            </div>
          </div>
        )}
        legends={[{
          anchor: 'top-right',
          direction: 'column',
          translateX: 60,
          translateY: -30,
          itemWidth: 70,
          itemHeight: 18,
          symbolSize: 8,
          symbolShape: 'circle',
          data: [
            { id: shortN,     label: shortN,     color: '#1a6fce' },
            { id: 'Div Avg',  label: 'Div Avg',  color: '#475569' },
          ],
          itemTextColor: '#94a3b8',
          effects: [{ on: 'hover', style: { itemTextColor: '#e2e8f0' } }],
        }]}
      />
    </div>
  )
}
