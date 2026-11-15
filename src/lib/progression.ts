import { DEX, species } from './dex'
import type { ProgressEvent, ProgressReport, RosterMember } from '../types/game'

export const MAX_LEVEL = 100
export const START_LEVEL_MIN = 12
export const START_LEVEL_MAX = 16

export type Rng = () => number

export const xpForLevel = (level: number) => level ** 3

export function levelFromXp(xp: number): number {
  let level = 1
  while (level < MAX_LEVEL && xpForLevel(level + 1) <= xp) level++
  return level
}

/** The 4 most recently learned level-up moves at or below `level`. */
export function movesAtLevel(speciesId: string, level: number): string[] {
  const known: string[] = []
  for (const [lvl, m] of species(speciesId).learnset) {
    if (lvl > level) break
    const i = known.indexOf(m)
    if (i >= 0) known.splice(i, 1)
    known.push(m)
  }
  return known.slice(-4)
}

/** Follows level-based evolutions to the stage a Pokémon of `level` would be. */
export function stageForLevel(baseId: string, level: number, rng: Rng): string {
  let id = baseId
  for (;;) {
    const ready = species(id).evos.filter(e => e.level <= level)
    if (!ready.length) return id
    id = ready[Math.floor(rng() * ready.length)].to
  }
}

let uidCounter = 0
const uid = () => `${Date.now().toString(36)}-${(uidCounter++).toString(36)}`

export function createMon(speciesId: string, level: number): RosterMember {
  return { uid: uid(), species: speciesId, level, xp: xpForLevel(level), moves: movesAtLevel(speciesId, level) }
}

function pickDistinct<T>(pool: T[], n: number, rng: Rng): T[] {
  const copy = [...pool]
  const out: T[] = []
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0])
  return out
}

/** Five unevolved Pokémon of the gym's type to choose the starting team from. */
export function starterCandidates(gymType: string, rng: Rng = Math.random): RosterMember[] {
  return pickDistinct(DEX.starters[gymType], 5, rng).map(id =>
    createMon(id, START_LEVEL_MIN + Math.floor(rng() * (START_LEVEL_MAX - START_LEVEL_MIN + 1))),
  )
}

/** Challenger levels climb with each challenger, relative to the gym's average level. */
export function challengerLevel(roster: RosterMember[], index: number): number {
  const avg = roster.reduce((s, m) => s + m.level, 0) / Math.max(roster.length, 1)
  return Math.max(5, Math.min(MAX_LEVEL, Math.round(avg - 2 + index)))
}

export function buildChallenger(roster: RosterMember[], index: number, rng: Rng = Math.random): RosterMember[] {
  const level = challengerLevel(roster, index)
  const taken = new Set(roster.map(m => m.species))
  const pool = DEX.challengers.filter(id => !taken.has(id))
  return pickDistinct(pool, 3, rng).map(base => createMon(stageForLevel(base, level, rng), level))
}

/** XP each team member earns for beating these opponents. */
export const xpReward = (opponents: RosterMember[]) =>
  opponents.reduce((sum, m) => sum + 3 * m.level ** 2, 0)

function learn(moves: string[], m: string, events: ProgressEvent[]) {
  if (moves.includes(m)) return
  if (moves.length < 4) {
    moves.push(m)
    events.push({ kind: 'learn', move: m })
  } else {
    const forgot = moves.shift()!
    moves.push(m)
    events.push({ kind: 'learn', move: m, forgot })
  }
}

export function gainXp(mon: RosterMember, amount: number, rng: Rng = Math.random): ProgressReport {
  const events: ProgressEvent[] = []
  const after: RosterMember = { ...mon, moves: [...mon.moves], xp: mon.xp + amount }
  const target = levelFromXp(after.xp)

  while (after.level < target) {
    after.level++
    events.push({ kind: 'levelup', level: after.level })
    for (const [lvl, m] of species(after.species).learnset) if (lvl === after.level) learn(after.moves, m, events)

    const ready = species(after.species).evos.filter(e => e.level <= after.level)
    if (ready.length) {
      const to = ready[Math.floor(rng() * ready.length)].to
      events.push({ kind: 'evolve', from: after.species, to })
      after.species = to
      for (const [lvl, m] of species(to).learnset) {
        if (lvl === 0 || lvl === after.level) learn(after.moves, m, events)
      }
    }
  }
  return { uid: mon.uid, before: mon, after, xpGained: amount, events }
}

/** Showdown packed-team format: name|species|item|ability|moves|nature|evs|gender|ivs|shiny|level|misc */
export function packTeam(mons: RosterMember[]): string {
  return mons
    .map(m => {
      const s = species(m.species)
      return `|${s.name}||${s.ability}|${m.moves.join(',')}|Hardy|||||${m.level}|`
    })
    .join(']')
}
