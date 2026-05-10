import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

// Column indices (verified against live site):
// 0:rank 1:team 2:played 3:won 4:lost 5:drawn 6:other
// 7:setsFor 8:setsAgainst 9:setPercent
// 10:pointsFor 11:pointsAgainst 12:pointPercent
// 13:leaguePoints 14:matchRatio

export async function scrapeStandings(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch standings: ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  const teams = []

  $('table.table tbody tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 14) return

    const get = (i) => $(cells[i]).text().trim()
    const int = (i) => parseInt(get(i), 10) || 0
    const float = (i) => parseFloat(get(i)) || 0

    const rank = int(0)
    const team = get(1)
    if (!team || isNaN(rank)) return

    teams.push({
      rank,
      team,
      played: int(2),
      won: int(3),
      lost: int(4),
      drawn: int(5),
      other: int(6),
      setsFor: int(7),
      setsAgainst: int(8),
      setPercent: float(9),
      pointsFor: int(10),
      pointsAgainst: int(11),
      pointPercent: float(12),
      leaguePoints: float(13),
    })
  })

  return teams
}
