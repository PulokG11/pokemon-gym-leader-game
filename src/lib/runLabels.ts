import type { RunState } from '../types/game'
import { questChallengerTitle } from './progression'

export const modeName = (run: RunState) => (run.mode === 'daily' ? 'Daily Challenge' : 'Gym Quest')

/** e.g. "Challenger 4 / 15 · Trainer" or "Challenger #12" for the endless Daily. */
export function challengerLabel(run: RunState, index = run.challengerIndex): string {
  if (run.totalChallengers === null) return `Challenger #${index + 1}`
  return `Challenger ${index + 1} / ${run.totalChallengers} · ${questChallengerTitle(index)}`
}

export function progressLabel(run: RunState): string {
  const wins = run.challengerIndex
  if (run.totalChallengers === null) return `${wins} ${wins === 1 ? 'win' : 'wins'} so far`
  return `${wins} / ${run.totalChallengers} challengers down`
}
