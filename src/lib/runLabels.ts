import type { RunState } from '../types/game'
import { questChallengerTitle } from './progression'
import { regionOf } from './regions'

export const modeName = (run: RunState) =>
  run.mode === 'daily' ? 'Daily Challenge' : run.mode === 'regional' ? 'Regional Quest' : run.endless ? 'Gym Quest · Endless' : 'Gym Quest'

/** Battles won. In Endless, challengerIndex also counts the challengers you lost to. */
export const winsOf = (run: RunState) => run.challengerIndex - (run.losses ?? 0)

/** "Fire Gym" for Gym Quest and Daily, "Kanto" for a Regional Quest. */
export const runPlace = (run: RunState) =>
  run.mode === 'regional' ? regionOf(run.region).name : `${run.gymType[0].toUpperCase()}${run.gymType.slice(1)} Gym`

/** e.g. "Challenger 4 / 15 · Trainer", "Challenger #12" for the endless Daily, "Battle 3 / 13 · Lt. Surge" for a Regional Quest. */
export function challengerLabel(run: RunState, index = run.challengerIndex): string {
  if (run.mode === 'regional') {
    const region = regionOf(run.region)
    const t = region.trainers[Math.min(index, region.trainers.length - 1)]
    return `Battle ${index + 1} / ${region.trainers.length} · ${t.name}`
  }
  if (run.totalChallengers === null) return `Challenger #${index + 1}`
  return `Challenger ${index + 1} / ${run.totalChallengers} · ${questChallengerTitle(index)}`
}

export function progressLabel(run: RunState): string {
  const wins = winsOf(run)
  if (run.endless) return `${wins} ${wins === 1 ? 'win' : 'wins'}, ${run.losses ?? 0} ${run.losses === 1 ? 'loss' : 'losses'}`
  if (run.mode === 'regional') return `${wins} / ${run.totalChallengers} battles won`
  if (run.totalChallengers === null) return `${wins} ${wins === 1 ? 'win' : 'wins'} so far`
  return `${wins} / ${run.totalChallengers} challengers down`
}
