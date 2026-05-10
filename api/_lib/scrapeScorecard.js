import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

function parseDate(str) {
  // "Saturday 2nd May 2026, 11:00am"
  const m = str.trim().match(/\w+\s+(\d+)\w*\s+(\w+)\s+(\d{4})/)
  if (!m) return null
  const months = { January:'01', February:'02', March:'03', April:'04', May:'05', June:'06',
    July:'07', August:'08', September:'09', October:'10', November:'11', December:'12' }
  const month = months[m[2]]
  if (!month) return null
  return `${m[3]}-${month}-${m[1].padStart(2, '0')}`
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '').trim()
}

export async function scrapeScorecard(id) {
  const url = `https://www.volleyballsa.com.au/indoor/savl/scorecard?result=${id}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch scorecard ${id}: ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  const $xrow = $('.xrow')

  // Home / away from "Central D1M <span>v</span> Adelaide Uni D1M"
  const titleHtml = $xrow.find('p.display-6').html() || ''
  const titleParts = titleHtml.split(/<span>\s*v\s*<\/span>/i)
  const home = stripHtml(titleParts[0] || '')
  const away = stripHtml(titleParts[1] || '')

  // Round
  const roundText = $xrow.find('p.round').text().trim()
  const roundMatch = roundText.match(/Round\s+(\d+)/i)
  const round = roundMatch ? parseInt(roundMatch[1], 10) : null

  // Date
  const dateText = $xrow.find('p.date').text().trim()
  const date = parseDate(dateText)

  // Total sets + points from the first table (home row, away row)
  const $firstTable = $xrow.find('table').first()
  const firstRows = $firstTable.find('tbody tr')
  const homeSets = parseInt($(firstRows[0]).find('b').text().trim(), 10) || 0
  const homePoints = parseInt($(firstRows[0]).find('td').eq(2).text().replace(/[()]/g, '').trim(), 10) || 0
  const awaySets = parseInt($(firstRows[1]).find('b').text().trim(), 10) || 0
  const awayPoints = parseInt($(firstRows[1]).find('td').eq(2).text().replace(/[()]/g, '').trim(), 10) || 0

  // Set-by-set from the Summary table
  // Each row: <th>Set N</th> <td>Home name</td> <td><b>score</b></td> <td>Away name</td> <td><b>score</b></td>
  const sets = []
  $xrow.find('table').eq(1).find('tbody tr').each((_, row) => {
    const $cells = $(row).find('th, td')
    const setLabel = $($cells[0]).text().trim()
    const setMatch = setLabel.match(/Set\s+(\d+)/i)
    if (!setMatch) return

    const setNum = parseInt(setMatch[1], 10)
    const homeScore = parseInt($($cells[2]).text().trim(), 10) || 0
    const awayScore = parseInt($($cells[4]).text().trim(), 10) || 0

    // Skip unplayed sets (both 0)
    if (homeScore === 0 && awayScore === 0) return

    sets.push({ set: setNum, home: homeScore, away: awayScore })
  })

  return { id, round, date, home, away, homeSets, awaySets, homePoints, awayPoints, sets }
}
