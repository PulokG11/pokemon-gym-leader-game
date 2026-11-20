import { DEX, species } from './dex'
import type { BattleFormat, ProgressEvent, ProgressReport, RosterMember } from '../types/game'

/** Starters offered at the start of a run: pick 3 for Singles, 4 for Doubles. */
export const STARTER_CHOICES = 6
export const teamSizeFor = (format: BattleFormat) => (format === 'doubles' ? 4 : 3)

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
  return pickDistinct(DEX.starters[gymType], STARTER_CHOICES, rng).map(id =>
    createMon(id, START_LEVEL_MIN + Math.floor(rng() * (START_LEVEL_MAX - START_LEVEL_MIN + 1))),
  )
}

/** Challenger levels climb with each challenger, relative to the gym's average level. */
export function challengerLevel(roster: RosterMember[], index: number): number {
  const avg = roster.reduce((s, m) => s + m.level, 0) / Math.max(roster.length, 1)
  return Math.max(5, Math.min(MAX_LEVEL, Math.round(avg - 2 + endlessStep(index))))
}

/** Levels above the team's average: +1 per challenger for the first 15, then +1 per 2 (Endless). */
export const endlessStep = (index: number) => (index < GYM_QUEST_LENGTH ? index : GYM_QUEST_LENGTH - 1 + Math.floor((index - GYM_QUEST_LENGTH + 1) / 2))

/** Challenger team size: 3 in Singles; in Doubles 2 for the first rookies, then 3, then 4. */
export const challengerSize = (format: BattleFormat, index: number, endless = false) =>
  endless && index >= 40 ? 6 : endless && index >= 25 ? 5 : format === 'doubles' ? (index < 2 ? 2 : index < 6 ? 3 : 4) : endless && index >= 15 ? 4 : 3

export function buildChallenger(roster: RosterMember[], index: number, rng: Rng = Math.random, size = 3): RosterMember[] {
  const level = challengerLevel(roster, index)
  const taken = new Set(roster.map(m => m.species))
  const pool = DEX.challengers.filter(id => !taken.has(id))
  return pickDistinct(pool, size, rng).map(base => createMon(stageForLevel(base, level, rng), level))
}

/** Daily challengers ignore the player's team so every player faces the same sequence. */
export const dailyChallengerLevel = (index: number) => Math.min(MAX_LEVEL, 10 + 3 * index)

export function buildDailyChallenger(index: number, rng: Rng, size = 3): RosterMember[] {
  const level = dailyChallengerLevel(index)
  return pickDistinct(DEX.challengers, size, rng).map(base => createMon(stageForLevel(base, level, rng), level))
}

export const GYM_QUEST_LENGTH = 15

/** Endless Gym Quest: classes climb like the quest, then every 10th challenger is an Elite Four Member and
 * every 25th a Champion. */
export function endlessChallengerTitle(index: number): string {
  if (index < GYM_QUEST_LENGTH) return index >= 13 ? 'Elite Trainer' : questChallengerTitle(index)
  if ((index + 1) % 25 === 0) return 'Champion'
  if ((index + 1) % 10 === 0) return 'Elite Four Member'
  if ((index + 1) % 5 === 0) return 'Rival Gym Leader'
  return 'Elite Trainer'
}

/** Who the challenger is in a 15-battle Gym Quest, rookies up to the Champion. */
export function questChallengerTitle(index: number): string {
  // Boss fights sit on the diamond nodes of the Gym track: 5, 10, 14 and 15.
  if (index >= 14) return 'Champion'
  if (index === 13) return 'Elite Four Member'
  if (index >= 10) return 'Elite Trainer'
  if (index === 9) return 'Rival Gym Leader'
  if (index >= 7) return 'Ace Trainer'
  if (index === 4) return 'Rival'
  if (index >= 3) return 'Trainer'
  return 'Rookie'
}

/** XP each team member earns for beating these opponents. */
export const xpReward = (opponents: RosterMember[]) =>
  opponents.reduce((sum, m) => sum + 3 * m.level ** 2, 0)

/** Adds a new move, or offers it (to swap in from Team) when 4 moves are already known. */
function learn(moves: string[], m: string, events: ProgressEvent[]) {
  if (moves.includes(m)) return
  if (moves.length < 4) {
    moves.push(m)
    events.push({ kind: 'learn', move: m })
  } else {
    events.push({ kind: 'learn', move: m, offered: true })
  }
}

/** Levels up from XP and learns moves. Evolution is the player's choice: see readyEvolutions. */
export function gainXp(mon: RosterMember, amount: number): ProgressReport {
  const events: ProgressEvent[] = []
  const after: RosterMember = { ...mon, moves: [...mon.moves], xp: mon.xp + amount }
  const target = levelFromXp(after.xp)

  while (after.level < target) {
    after.level++
    events.push({ kind: 'levelup', level: after.level })
    for (const [lvl, m] of species(after.species).learnset) if (lvl === after.level) learn(after.moves, m, events)
  }
  return { uid: mon.uid, before: mon, after, xpGained: amount, events }
}

/** Raises a Pokémon by `levels` levels with normal move learning. */
export function levelUp(mon: RosterMember, levels: number): ProgressReport {
  const target = Math.min(MAX_LEVEL, mon.level + levels)
  return gainXp(mon, Math.max(0, xpForLevel(target) - mon.xp))
}

/** Species this Pokémon is high enough level to evolve into right now. */
export const readyEvolutions = (mon: RosterMember): string[] =>
  species(mon.species).evos.filter(e => e.level <= mon.level).map(e => e.to)

function evolveTo(mon: RosterMember, to: string): ProgressReport {
  const events: ProgressEvent[] = [{ kind: 'evolve', from: mon.species, to }]
  const after: RosterMember = { ...mon, species: to, moves: [...mon.moves] }
  for (const [lvl, m] of species(to).learnset) if (lvl === 0 || lvl === mon.level) learn(after.moves, m, events)
  return { uid: mon.uid, before: mon, after, xpGained: 0, events }
}

/** Evolves into `to` (one of readyEvolutions), learning the new form's evolution moves. */
export function evolveInto(mon: RosterMember, to: string): ProgressReport | null {
  return readyEvolutions(mon).includes(to) ? evolveTo(mon, to) : null
}

/** Evolution Stone: evolves into the next stage now, whatever the level or method. */
export function evolveNow(mon: RosterMember, rng: Rng = Math.random, to?: string): ProgressReport | null {
  const evos = species(mon.species).evos
  if (!evos.length) return null
  const target = to && evos.some(e => e.to === to) ? to : evos[Math.floor(rng() * evos.length)].to
  return evolveTo(mon, target)
}

/** Moves this Pokémon could swap in: its level-up moves so far plus anything taught, minus what it knows. */
export function learnableMoves(mon: RosterMember): string[] {
  const out = new Set<string>()
  for (const [lvl, m] of species(mon.species).learnset) if (lvl <= mon.level) out.add(m)
  for (const m of mon.taught ?? []) out.add(m)
  for (const m of mon.moves) out.delete(m)
  return [...out]
}

/** Swaps a known move for a learnable one. */
export function replaceMove(mon: RosterMember, oldMove: string, newMove: string): RosterMember | null {
  const i = mon.moves.indexOf(oldMove)
  if (i < 0 || mon.moves.includes(newMove) || !learnableMoves(mon).includes(newMove)) return null
  const moves = [...mon.moves]
  moves[i] = newMove
  return { ...mon, moves }
}

/** Up to `n` TM, tutor or egg moves this Pokémon doesn't know yet. */
export function tutorOptions(mon: RosterMember, rng: Rng, n = 3): string[] {
  const pool = species(mon.species).tutor.filter(m => !mon.moves.includes(m) && !(mon.taught ?? []).includes(m))
  return pickDistinct(pool, n, rng)
}

/** Teaches a tutor move, replacing `forget` when 4 moves are already known. */
export function teachMove(mon: RosterMember, newMove: string, forget?: string): RosterMember | null {
  if (mon.moves.includes(newMove)) return null
  const taught = [...new Set([...(mon.taught ?? []), newMove])]
  if (mon.moves.length < 4) return { ...mon, moves: [...mon.moves, newMove], taught }
  const i = forget ? mon.moves.indexOf(forget) : -1
  if (i < 0) return null
  const moves = [...mon.moves]
  moves[i] = newMove
  return { ...mon, moves, taught: forget ? [...new Set([...taught, forget])] : taught }
}

/** Showdown packed-team format: name|species|item|ability|moves|nature|evs|gender|ivs|shiny|level|misc */
export function packTeam(mons: RosterMember[]): string {
  return mons
    .map(m => {
      const s = species(m.species)
      return `|${s.name}|${m.item ?? ''}|${s.ability}|${m.moves.join(',')}|Hardy|${m.evs?.join(',') ?? ''}||||${m.level}|`
    })
    .join(']')
}
