import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const MONTH_MAP = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

function parseMatchDate(str) {
  // Input: "Saturday, Apr 11" or "Saturday, May 9"
  const m = str.trim().match(/\w+,?\s+(\w{3})\s+(\d{1,2})/)
  if (!m) return null
  const month = MONTH_MAP[m[1]]
  if (!month) return null
  const year = new Date().getFullYear()
  return `${year}-${month}-${m[2].padStart(2, '0')}`
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '').trim()
}

export async function scrapeFixtures(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch fixtures: ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  const fixtures = []
  let currentRound = null

  // Iterate all tbody rows — includes past (display:none) and upcoming rows
  $('tbody tr').each((_, row) => {
    const $row = $(row)

    // Round header: <tr class="head round [past]">
    if ($row.hasClass('head') && $row.hasClass('round')) {
      const text = $row.find('th.team-schedule__round').text().trim()
      const m = text.match(/Round\s+(\d+)/i)
      if (m) currentRound = parseInt(m[1], 10)
      return
    }

    // Match row: <tr class="result [last] [past]">
    if (!$row.hasClass('result')) return
    if (currentRound === null) return

    const date = parseMatchDate($row.find('td.team-schedule__date').text())
    const time = $row.find('td.team-schedule__time').text().trim() || null
    const venue = $row.find('td.team-schedule__venue').text().trim() || null

    // Parse home/away from the versus cell.
    // Structure: "Home [+duty badge] <span>v</span> Away [+duty badge] [hidden divs]"
    // Clone, strip badges and hidden divs, then split on <span>v</span>.
    const $vs = $row.find('td.team-schedule__versus').clone()
    $vs.find('a.btn, div').remove()

    const vsHtml = $vs.html() || ''
    const parts = vsHtml.split(/<span>\s*v\s*<\/span>/i)
    if (parts.length < 2) return

    const home = stripHtml(parts[0])
    const away = stripHtml(parts[1])
    if (!home || !away) return

    fixtures.push({ round: currentRound, date, time, home, away, venue })
  })

  return fixtures
}
