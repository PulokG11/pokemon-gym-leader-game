import { DEX, move, species } from './dex'
import { createMon, movesAtLevel, type Rng } from './progression'
import { RIVAL_COUNTER, RIVAL_STARTER, type Region, type Tier } from './regions'
import type { RosterMember } from '../types/game'

// Moves the AI handles badly or that need a second turn, recharge, or a sacrifice.
const AVOID = new Set([
  'hyperbeam', 'gigaimpact', 'explosion', 'selfdestruct', 'mistyexplosion', 'focuspunch', 'solarbeam', 'solarblade',
  'skyattack', 'razorwind', 'skullbash', 'dig', 'fly', 'bounce', 'dive', 'phantomforce', 'shadowforce', 'futuresight',
  'dreameater', 'belch', 'lastresort', 'synchronoise', 'steelbeam', 'rollout', 'iceball', 'bide', 'counter',
  'mirrorcoat', 'metalburst', 'finalgambit', 'naturalgift', 'fling', 'present', 'snore', 'meteorbeam', 'electroshot',
  'uproar', 'terablast', 'doubleshock', 'burnup', 'steelroller', 'hyperspacefury', 'skydrop', 'geomancy', 'freezeshock', 'iceburn',
])
// Set-up and status moves worth a slot on a strong trainer's Pokémon.
const GOOD_STATUS = [
  'dragondance', 'shellsmash', 'quiverdance', 'swordsdance', 'nastyplot', 'calmmind', 'bulkup', 'spore', 'sleeppowder',
  'willowisp', 'thunderwave', 'toxic', 'recover', 'roost', 'softboiled', 'slackoff', 'amnesia', 'agility', 'leechseed',
]

/** The strongest, most varied moveset this Pokémon could know at `level`: 3–4 attacks plus a useful status move. */
export function bestMoves(speciesId: string, level: number, withTutor: boolean): string[] {
  const s = species(speciesId)
  const pool = new Set<string>()
  for (const [lvl, m] of s.learnset) if (lvl <= level) pool.add(m)
  if (withTutor) for (const m of s.tutor) pool.add(m)
  const attackFor = (cat: string) => (cat === 'Physical' ? s.baseStats.atk : s.baseStats.spa) / 100
  const scored = [...pool]
    .map(id => ({ id, d: move(id) }))
    .filter(x => x.d && x.d.category !== 'Status' && x.d.power > 0 && !AVOID.has(x.id))
    .map(x => ({
      id: x.id,
      type: x.d!.type,
      score: x.d!.power * (x.d!.accuracy === true ? 1 : x.d!.accuracy / 100) * (s.types.includes(x.d!.type) ? 1.5 : 1) * attackFor(x.d!.category),
    }))
    .sort((a, b) => b.score - a.score)
  // Best move of each type, so the set has coverage rather than four Normal moves.
  const attacks: string[] = []
  const types = new Set<string>()
  for (const m of scored) {
    if (types.has(m.type)) continue
    types.add(m.type)
    attacks.push(m.id)
  }
  const status = GOOD_STATUS.find(m => pool.has(m))
  const picks = [...attacks.slice(0, status ? 3 : 4), ...(status ? [status] : [])]
  // Too few attacks (e.g. Abra): fall back to normal level-up moves.
  return picks.length >= 2 ? picks : movesAtLevel(speciesId, level)
}

const EVS: Record<Tier, number[] | undefined> = {
  regular: undefined,
  strong: undefined,
  elite: [85, 85, 85, 85, 85, 85],
  champion: [252, 252, 252, 252, 252, 252], // Custom Game has no 510 cap: the Champion is meant to be overwhelming.
}

/** Builds a trainer's team: regular movesets for early Gyms, best movesets later, items and training at the League. */
export function buildTrainerTeam(region: Region, index: number, playerStarter: string | undefined): RosterMember[] {
  const t = region.trainers[index]
  return t.team.map(entry => {
    let id = entry.species
    let item = entry.item
    if (id === RIVAL_STARTER) {
      const counter = RIVAL_COUNTER[playerStarter ?? 'bulbasaur'] ?? RIVAL_COUNTER.bulbasaur
      id = counter.species
      item = counter.item
    }
    const mon = createMon(id, entry.level)
    if (t.tier !== 'regular') mon.moves = bestMoves(id, entry.level, t.tier === 'elite' || t.tier === 'champion')
    if (t.tier === 'elite' && !item) item = 'Sitrus Berry'
    return { ...mon, item: item ?? null, evs: EVS[t.tier] }
  })
}

/** Final evolutions reachable from a species, including itself. */
export function lineOf(id: string): string[] {
  const out = [id]
  for (const e of species(id).evos) out.push(...lineOf(e.to))
  return out
}

/** `n` unevolved Pokémon of the region you don't own yet, joining at `level` with at least one attack. */
export function regionalPicks(regionId: string, level: number, owned: RosterMember[], rng: Rng, n: number): RosterMember[] {
  const ownedLines = new Set(owned.flatMap(m => lineOf(baseOfRegional(m.species))))
  const pool = (DEX.regions[regionId]?.pool ?? []).filter(id =>
    !ownedLines.has(id) && movesAtLevel(id, level).some(m => move(m)?.category !== 'Status'),
  )
  const out: RosterMember[] = []
  const copy = [...pool]
  while (out.length < n && copy.length) out.push(createMon(copy.splice(Math.floor(rng() * copy.length), 1)[0], level))
  return out
}

/** The unevolved form of a species within the dex (Charizard → Charmander). */
export function baseOfRegional(id: string): string {
  for (const [sid, s] of Object.entries(DEX.species)) if (s.evos.some(e => e.to === id)) return baseOfRegional(sid)
  return id
}

/** Mega Stones of this region that one of your Pokémon (or what it evolves into) can use. */
export function usableMegaStones(region: Region, owned: RosterMember[]): string[] {
  const lines = new Set(owned.flatMap(m => lineOf(m.species)))
  return region.megaStones.filter(stone =>
    Object.values(DEX.megas).some(mg => mg.stone === stone && lines.has(mg.base)),
  )
}

/** Who can hold a Mega Stone and use it once fully evolved. */
export const megaUsers = (stone: string) => Object.values(DEX.megas).filter(m => m.stone === stone).map(m => m.base)
