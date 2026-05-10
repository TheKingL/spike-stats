import { useState, useEffect } from 'react'
import { RAW_BASE_URL } from '../constants'

// In dev, Vite serves the project root as static files, so data/ is reachable directly.
const DATA_BASE = import.meta.env.DEV ? '' : RAW_BASE_URL

let cache = null

export function useStats() {
  const [state, setState] = useState({
    standings: null,
    fixtures: null,
    results: null,
    loading: true,
    error: null,
    lastUpdated: null,
  })

  useEffect(() => {
    if (cache) {
      setState({ ...cache, loading: false, error: null })
      return
    }

    async function fetchAll() {
      try {
        const [standingsRes, fixturesRes, resultsRes] = await Promise.all([
          fetch(`${DATA_BASE}/data/standings.json`),
          fetch(`${DATA_BASE}/data/fixtures.json`),
          fetch(`${DATA_BASE}/data/results.json`),
        ])

        if (standingsRes.status === 404 && fixturesRes.status === 404 && resultsRes.status === 404) {
          setState({ standings: null, fixtures: null, results: null, loading: false, error: null, lastUpdated: null })
          return
        }

        const [standings, fixtures, results] = await Promise.all([
          standingsRes.ok ? standingsRes.json() : null,
          fixturesRes.ok ? fixturesRes.json() : null,
          resultsRes.ok ? resultsRes.json() : null,
        ])

        const lastUpdated = standings?.updated || fixtures?.updated || results?.updated || null

        cache = { standings, fixtures, results, lastUpdated }
        setState({ standings, fixtures, results, loading: false, error: null, lastUpdated })
      } catch (err) {
        setState(s => ({ ...s, loading: false, error: err.message }))
      }
    }

    fetchAll()
  }, [])

  return state
}
