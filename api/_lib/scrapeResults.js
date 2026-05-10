import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const MONTH_MAP = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

function parseMatchDate(str) {
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

export async function scrapeResults(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  const results = []
  let currentRound = null

  $('tbody tr').each((_, row) => {
    const $row = $(row)

    // Round header
    if ($row.hasClass('head') && $row.hasClass('round')) {
      const text = $row.find('th.team-schedule__round').text().trim()
      const m = text.match(/Round\s+(\d+)/i)
      if (m) currentRound = parseInt(m[1], 10)
      return
    }

    if (!$row.hasClass('result')) return
    if (currentRound === null) return

    // Skip rows with "Results not available" (no td.score)
    const $scoreCell = $row.find('td.score')
    if ($scoreCell.length === 0) return

    const date = parseMatchDate($row.find('td.team-schedule__date').text())

    // Versus cell: <a href="scorecard?result=81770">Home <span>v</span> Away</a>
    const $vsCell = $row.find('td.team-schedule__versus')
    const scorecardHref = $vsCell.find('a').attr('href') || ''
    const scorecardMatch = scorecardHref.match(/result=(\d+)/)
    const scorecardId = scorecardMatch ? parseInt(scorecardMatch[1], 10) : null

    const vsHtml = $vsCell.html() || ''
    const parts = vsHtml.split(/<span>\s*v\s*<\/span>/i)
    if (parts.length < 2) return
    const home = stripHtml(parts[0])
    const away = stripHtml(parts[1])
    if (!home || !away) return

    // Score cell: <b>3</b> (107) <span>-</span> <b>2</b> (92)
    const scoreHtml = $scoreCell.html() || ''
    const boldNums = [...scoreHtml.matchAll(/<b>(\d+)<\/b>/g)].map(m => parseInt(m[1], 10))
    const parenNums = [...scoreHtml.matchAll(/\((\d+)\)/g)].map(m => parseInt(m[1], 10))

    const homeSets = boldNums[0] ?? null
    const awaySets = boldNums[1] ?? null
    const homePoints = parenNums[0] ?? null
    const awayPoints = parenNums[1] ?? null

    results.push({ scorecardId, round: currentRound, date, home, away, homeSets, awaySets, homePoints, awayPoints })
  })

  return results
}
