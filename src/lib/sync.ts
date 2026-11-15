import type { DailyResult } from '../store/recordsStore'
import type { SyncedResult } from '../store/playerStore'

const dayBefore = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** Local Daily results the server doesn't have yet. The server only accepts today and yesterday (UTC). */
export function pendingSubmissions(
  daily: Record<string, DailyResult>, synced: Record<string, SyncedResult>, today: string,
): DailyResult[] {
  const open = new Set([today, dayBefore(today)])
  return Object.values(daily).filter(r => {
    if (!open.has(r.date)) return false
    const s = synced[r.date]
    return !s || s.wins !== r.wins || s.finished !== r.finished
  })
}
