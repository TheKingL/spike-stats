import { useState, useEffect } from 'react'
import { RAW_BASE_URL } from '../constants'

const DATA_BASE = import.meta.env.DEV ? '' : RAW_BASE_URL

const scorecardCache = {}

export function useScorecard(id) {
  const [state, setState] = useState({ scorecard: null, loading: false, error: null })

  useEffect(() => {
    if (!id) return

    if (scorecardCache[id]) {
      setState({ scorecard: scorecardCache[id], loading: false, error: null })
      return
    }

    setState({ scorecard: null, loading: true, error: null })

    fetch(`${DATA_BASE}/data/scorecards/${id}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Scorecard not found')
        return res.json()
      })
      .then(data => {
        scorecardCache[id] = data
        setState({ scorecard: data, loading: false, error: null })
      })
      .catch(err => {
        setState({ scorecard: null, loading: false, error: err.message })
      })
  }, [id])

  return state
}
