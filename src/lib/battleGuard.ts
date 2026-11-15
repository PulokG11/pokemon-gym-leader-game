import type { RunState } from '../types/game'

// Battles opened since this page loaded. A Daily battle that is marked open in the
// saved run but not in this set was left mid-fight (reload or closed tab).
const openedThisPage = new Set<string>()

export const battleKeyOf = (run: RunState) => `${run.id}:${run.challengerIndex}`

/** Returns true when the battle must be forfeited; otherwise registers it as open. */
export function openBattle(run: RunState, markOpen: (key: string) => void): boolean {
  const key = battleKeyOf(run)
  if (run.mode === 'daily' && run.battleKey === key && !openedThisPage.has(key)) return true
  openedThisPage.add(key)
  if (run.battleKey !== key) markOpen(key)
  return false
}
