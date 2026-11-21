import { simulateDreamTeam } from '../lib/dreamSim'
import type { RegionId } from '../lib/regions'

/** Runs the Dream Team's 13-battle simulation off the main thread. */
self.onmessage = (e: MessageEvent<{ region: RegionId; picks: string[] }>) => {
  try {
    self.postMessage({ ok: true, result: simulateDreamTeam(e.data.region, e.data.picks) })
  } catch (err) {
    self.postMessage({ ok: false, message: String(err) })
  }
}
