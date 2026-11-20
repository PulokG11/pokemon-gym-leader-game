import { DEX, species } from './dex'
import type { Rng } from './progression'

/** Legendary Conquerer: build an imaginary Pokémon one stat at a time and beat a legendary's base stat total. */

export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const
export type StatKey = (typeof STAT_KEYS)[number]
export const STAT_NAMES: Record<StatKey, string> = { hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed' }
export const LEGEND_SKIPS = 2

export interface Pick { species: string; value: number }

export interface LegendRound {
  legend: string                          // the legendary to beat
  roll: string | null                     // the Pokémon currently rolled; null once all 6 stats are filled
  picks: Partial<Record<StatKey, Pick>>
  kept: StatKey | null                    // stat just taken from `roll` (its stats are revealed until the next roll)
  skips: number                           // skips left
  seen: string[]                          // rolled so far this round (no repeats)
}

const LEGENDS = new Set(DEX.legendaries)
/** Rolls come from every Pokémon that isn't a legendary, mythical or Ultra Beast. */
export const ROLL_POOL = Object.keys(DEX.species).filter(id => !LEGENDS.has(id))

export const bst = (id: string) => STAT_KEYS.reduce((t, k) => t + species(id).baseStats[k], 0)
/** Opponents need a base stat total of at least 500: Cosmog, Meltan, Phione and the like would be free wins. */
export const MIN_LEGEND_BST = 500
export const OPPONENTS = DEX.legendaries.filter(id => bst(id) >= MIN_LEGEND_BST)
export const builtTotal = (r: LegendRound) => STAT_KEYS.reduce((t, k) => t + (r.picks[k]?.value ?? 0), 0)
export const isDone = (r: LegendRound) => STAT_KEYS.every(k => r.picks[k])
/** The player wins with a strictly higher total than the legendary's base stat total. */
export const isWin = (r: LegendRound) => isDone(r) && builtTotal(r) > bst(r.legend)

const pickFrom = <T,>(xs: T[], rng: Rng) => xs[Math.floor(rng() * xs.length)]

function rollNext(seen: string[], rng: Rng): string {
  const taken = new Set(seen)
  return pickFrom(ROLL_POOL.filter(id => !taken.has(id)), rng)
}

export function newRound(rng: Rng = Math.random): LegendRound {
  const legend = pickFrom(OPPONENTS, rng)
  const roll = rollNext([], rng)
  return { legend, roll, picks: {}, kept: null, skips: LEGEND_SKIPS, seen: [roll] }
}

/** Keeps one stat of the rolled Pokémon. Its full stats are then revealed until `nextRoll`. */
export function keepStat(r: LegendRound, stat: StatKey): LegendRound {
  if (!r.roll || r.kept || r.picks[stat]) return r
  return { ...r, kept: stat, picks: { ...r.picks, [stat]: { species: r.roll, value: species(r.roll).baseStats[stat] } } }
}

/** After keeping a stat: roll the next Pokémon, or finish when all 6 stats are filled. */
export function nextRoll(r: LegendRound, rng: Rng = Math.random): LegendRound {
  if (!r.kept) return r
  if (isDone(r)) return { ...r, roll: null, kept: null }
  const roll = rollNext(r.seen, rng)
  return { ...r, roll, kept: null, seen: [...r.seen, roll] }
}

/** Throws the current roll away (before keeping a stat), up to LEGEND_SKIPS times a round. */
export function skipRoll(r: LegendRound, rng: Rng = Math.random): LegendRound {
  if (!r.roll || r.kept || r.skips <= 0) return r
  const roll = rollNext(r.seen, rng)
  return { ...r, roll, skips: r.skips - 1, seen: [...r.seen, roll] }
}
