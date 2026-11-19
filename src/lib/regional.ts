import { DEX, effectiveness, move, species } from './dex'
import { createMon, movesAtLevel, type Rng } from './progression'
import { RIVAL_STARTER, Z_CRYSTALS, type Region, type Tier } from './regions'
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
      const counters = region.rivalCounter ?? {}
      const counter = counters[playerStarter ?? ''] ?? Object.values(counters)[0]
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

const capType = (t: string) => t[0].toUpperCase() + t.slice(1)

/** Attack types of this Pokémon that hit `defType` super-effectively: its own types and its known attacks. */
export function superEffectiveTypes(mon: RosterMember, defType: string): string[] {
  const attacks = mon.moves.map(id => move(id)).filter(d => d && d.category !== 'Status').map(d => d!.type)
  const types = new Set([...species(mon.species).types, ...attacks])
  return [...types].filter(t => effectiveness(t, [capType(defType)]) >= 2)
}

/**
 * `n` unevolved Pokémon of the region you don't own yet, joining at `level` with at least one attack.
 * For each type in `counters` (the next opponents' specialties), one of them is guaranteed to hit it
 * super-effectively: by its own type and, when possible, with an attack it already knows.
 */
export function regionalPicks(regionId: string, level: number, owned: RosterMember[], rng: Rng, n: number, counters: string[] = []): RosterMember[] {
  const ownedLines = new Set(owned.flatMap(m => lineOf(baseOfRegional(m.species))))
  const pool = (DEX.regions[regionId]?.pool ?? []).filter(id =>
    !ownedLines.has(id) && movesAtLevel(id, level).some(m => move(m)?.category !== 'Status'),
  )
  const take = (ids: string[]) => {
    const id = ids[Math.floor(rng() * ids.length)]
    pool.splice(pool.indexOf(id), 1)
    return createMon(id, level)
  }
  const out: RosterMember[] = []
  for (const def of counters.slice(0, n)) {
    const se = (t: string) => effectiveness(t, [capType(def)]) >= 2
    const stab = (id: string) => species(id).types.some(se)
    const seAttack = (id: string, ownType: boolean) => movesAtLevel(id, level).some(m => {
      const d = move(m)
      return !!d && d.category !== 'Status' && se(d.type) && (!ownType || species(id).types.includes(d.type))
    })
    // Best: its own type with a matching attack; then its own type; then any super-effective attack it knows.
    const choice = [pool.filter(id => stab(id) && seAttack(id, true)), pool.filter(stab), pool.filter(id => seAttack(id, false))]
      .find(c => c.length)
    if (choice) { out.push(take(choice)); continue }
    // The region has no answer (e.g. no unevolved Ground type in Kalos): borrow one from the wider Pokédex.
    const elsewhere = [...new Set(Object.values(DEX.regions).flatMap(r => r.pool))]
      .filter(id => !ownedLines.has(id) && !out.some(m => m.species === id) && stab(id) && seAttack(id, true))
    if (elsewhere.length) out.push(createMon(elsewhere[Math.floor(rng() * elsewhere.length)], level))
  }
  while (out.length < n && pool.length) out.push(take(pool))
  // Shuffle so the counters aren't always first.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
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

/** Z-Crystals for the types of attacks your Pokémon know (Alola only). */
export function usableZCrystals(region: Region, owned: RosterMember[]): string[] {
  if (!region.zCrystals) return []
  const types = new Set(owned.flatMap(m => m.moves.map(id => move(id)).filter(d => d && d.category !== 'Status').map(d => d!.type)))
  return [...types].map(t => Z_CRYSTALS[t]).filter(Boolean)
}

/** Team members that know an attack of this Z-Crystal's type. */
export function zUsers(crystal: string, team: RosterMember[]): RosterMember[] {
  const type = Object.entries(Z_CRYSTALS).find(([, c]) => c === crystal)?.[0]
  return team.filter(m => m.moves.some(id => move(id)?.type === type && move(id)?.category !== 'Status'))
}
