import { scrapeStandings } from './_lib/scrapeStandings.js'
import { scrapeFixtures } from './_lib/scrapeFixtures.js'
import { scrapeResults } from './_lib/scrapeResults.js'
import { scrapeScorecard } from './_lib/scrapeScorecard.js'
import { getFile, putFile, listDir } from './_lib/githubApi.js'
import { DIVISIONS } from '../src/constants.js'

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'

  if (!token || !owner || !repo) {
    return res.status(500).json({ error: 'Missing required environment variables' })
  }

  const summary = { divisions: {}, scorecards: { fetched: 0, skipped: 0, errors: 0 } }
  const now = new Date().toISOString()

  const standingsOut = { updated: now, divisions: {} }
  const fixturesOut = { updated: now, divisions: {} }
  const resultsOut = { updated: now, divisions: {} }

  for (const div of DIVISIONS) {
    try {
      const [standings, fixtures, results] = await Promise.all([
        scrapeStandings(div.standingsUrl),
        scrapeFixtures(div.fixturesUrl),
        scrapeResults(div.resultsUrl),
      ])

      standingsOut.divisions[div.id] = standings
      fixturesOut.divisions[div.id] = fixtures
      resultsOut.divisions[div.id] = results

      summary.divisions[div.id] = {
        teams: standings.length,
        fixtures: fixtures.length,
        results: results.length,
      }
    } catch (err) {
      summary.divisions[div.id] = { error: err.message }
    }
  }

  const allResults = Object.values(resultsOut.divisions).flat()
  const scorecardIds = [...new Set(allResults.map(r => r.scorecardId).filter(Boolean))]

  const existingFiles = new Set(await listDir(token, owner, repo, 'data/scorecards', branch))

  for (const id of scorecardIds) {
    if (existingFiles.has(`${id}.json`)) {
      summary.scorecards.skipped++
      continue
    }
    try {
      const scorecard = await scrapeScorecard(id)
      await putFile(token, owner, repo, `data/scorecards/${id}.json`, branch, scorecard, null)
      summary.scorecards.fetched++
    } catch (err) {
      summary.scorecards.errors++
      console.error(`Scorecard ${id} error:`, err.message)
    }
  }

  // Fetch SHAs after scorecard writes so they reflect the latest commit
  const [standingsFile, fixturesFile, resultsFile] = await Promise.all([
    getFile(token, owner, repo, 'data/standings.json', branch),
    getFile(token, owner, repo, 'data/fixtures.json', branch),
    getFile(token, owner, repo, 'data/results.json', branch),
  ])

  await putFile(token, owner, repo, 'data/standings.json', branch, standingsOut, standingsFile?.sha)
  await putFile(token, owner, repo, 'data/fixtures.json', branch, fixturesOut, fixturesFile?.sha)
  await putFile(token, owner, repo, 'data/results.json', branch, resultsOut, resultsFile?.sha)

  return res.status(200).json({ success: true, updated: now, summary })
}
