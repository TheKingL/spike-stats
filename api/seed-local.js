import { writeFileSync, mkdirSync } from 'fs'
import { scrapeStandings } from './_lib/scrapeStandings.js'
import { scrapeFixtures } from './_lib/scrapeFixtures.js'
import { scrapeResults } from './_lib/scrapeResults.js'
import { scrapeScorecard } from './_lib/scrapeScorecard.js'
import { DIVISIONS } from '../src/constants.js'

function write(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`  wrote ${path}`)
}

async function main() {
  mkdirSync('./data/scorecards', { recursive: true })

  const now = new Date().toISOString()
  const standingsOut = { updated: now, divisions: {} }
  const fixturesOut = { updated: now, divisions: {} }
  const resultsOut = { updated: now, divisions: {} }

  for (const div of DIVISIONS) {
    process.stdout.write(`\n[${div.id}] scraping...`)
    const [standings, fixtures, results] = await Promise.all([
      scrapeStandings(div.standingsUrl),
      scrapeFixtures(div.fixturesUrl),
      scrapeResults(div.resultsUrl),
    ])
    standingsOut.divisions[div.id] = standings
    fixturesOut.divisions[div.id] = fixtures
    resultsOut.divisions[div.id] = results
    console.log(` ${standings.length} teams, ${fixtures.length} fixtures, ${results.length} results`)
  }

  write('./data/standings.json', standingsOut)
  write('./data/fixtures.json', fixturesOut)
  write('./data/results.json', resultsOut)

  // Fetch scorecards for all results that have an ID
  const allResults = Object.values(resultsOut.divisions).flat()
  const ids = [...new Set(allResults.map(r => r.scorecardId).filter(Boolean))]
  console.log(`\nFetching ${ids.length} scorecards...`)

  for (const id of ids) {
    try {
      const sc = await scrapeScorecard(id)
      write(`./data/scorecards/${id}.json`, sc)
    } catch (err) {
      console.error(`  scorecard ${id} failed: ${err.message}`)
    }
  }

  console.log('\nDone. Run: npm run dev')
}

main().catch(err => { console.error(err); process.exit(1) })
