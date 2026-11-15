import { useRecordsStore } from '../store/recordsStore'
import { usePlayerStore } from '../store/playerStore'
import { LeaderboardFailure, leaderboardEnabled, submitDaily } from './leaderboard'
import { pendingSubmissions } from './sync'
import { utcDate } from './daily'

let running: Promise<void> | null = null
let again = false

async function run() {
  const { playerId, token, synced, markSynced } = usePlayerStore.getState()
  if (!playerId || !token) return
  for (const r of pendingSubmissions(useRecordsStore.getState().daily, synced, utcDate())) {
    try {
      await submitDaily(playerId, token, r)
      markSynced(r.date, { wins: r.wins, finished: r.finished })
    } catch (e) {
      // A closed day can never be accepted; stop retrying it. Anything else retries next time.
      if (e instanceof LeaderboardFailure && e.code === 'day_closed') markSynced(r.date, { wins: r.wins, finished: r.finished })
      else return
    }
  }
}

/** Sends any unsent Daily results; safe to call often (calls are coalesced). */
export function syncDailyResults(): Promise<void> {
  if (!leaderboardEnabled()) return Promise.resolve()
  if (running) {
    again = true
    return running
  }
  running = run().finally(() => {
    running = null
    if (again) {
      again = false
      void syncDailyResults()
    }
  })
  return running
}

/** Keeps the server in step with local Daily results for the life of the app. */
export function startDailySync() {
  void syncDailyResults()
  useRecordsStore.subscribe((s, prev) => { if (s.daily !== prev.daily) void syncDailyResults() })
  usePlayerStore.subscribe((s, prev) => { if (s.playerId !== prev.playerId) void syncDailyResults() })
  window.addEventListener('online', () => void syncDailyResults())
}
