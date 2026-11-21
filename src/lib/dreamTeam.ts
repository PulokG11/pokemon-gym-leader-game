import { DEX, species } from './dex'
import type { Rng } from './progression'
import type { RegionId } from './regions'
import { lineOf } from './regional'

/** Dream Team Builder: draft 6 Pokémon from a region, 6 options per roll, then see how far they get. */

export const DT_TEAM = 6
export const DT_OPTIONS = 6
export const DT_SKIPS = 2
/** Up to 8 rolls: 6 picks plus the 2 skips. */
export const DT_ROLLS = DT_TEAM + DT_SKIPS

/** National Dex numbers introduced in each region. */
export const REGION_DEX: Record<RegionId, [number, number]> = {
  kanto: [1, 151], johto: [152, 251], hoenn: [252, 386], sinnoh: [387, 493], unova: [494, 649],
  kalos: [650, 721], alola: [722, 809], galar: [810, 905], paldea: [906, 1025],
}

// Regional forms (Alolan Raichu, Galarian Ponyta…) belong to the later region, not the original one.
const FORM = /-(Alola|Galar|Hisui|Paldea)/

/** Every Pokémon introduced in the region, legendaries included; regional forms and Megas left out. */
export function draftPool(region: RegionId): string[] {
  const [lo, hi] = REGION_DEX[region]
  return Object.entries(DEX.species)
    .filter(([id, s]) => s.num >= lo && s.num <= hi && !FORM.test(s.name) && !DEX.megas[id])
    .map(([id]) => id)
}

/** The form a drafted Pokémon battles as: its strongest final evolution. */
export function finalForm(id: string): string {
  const finals = lineOf(id).filter(x => species(x).evos.length === 0)
  const total = (x: string) => Object.values(species(x).baseStats).reduce((a, b) => a + b, 0)
  return finals.sort((a, b) => total(b) - total(a))[0] ?? id
}

export interface DreamDraft {
  region: RegionId
  options: string[]     // the current roll; empty once the team is full
  picks: string[]       // drafted species, in order
  skips: number         // skips left
  rolls: number         // rolls used so far, the current one included
}

/** Six distinct options, none from an evolution line already on the team. */
function roll(region: RegionId, picks: string[], rng: Rng): string[] {
  const taken = new Set(picks.flatMap(p => [p, ...lineOf(baseOf(p))]))
  const pool = draftPool(region).filter(id => !taken.has(id))
  const out: string[] = []
  const lines = new Set<string>()
  while (out.length < DT_OPTIONS && pool.length) {
    const id = pool.splice(Math.floor(rng() * pool.length), 1)[0]
    const line = baseOf(id)
    if (lines.has(line)) continue
    lines.add(line)
    out.push(id)
  }
  return out
}

/** The first stage of a species' evolution line. */
export function baseOf(id: string): string {
  for (const [pre, s] of Object.entries(DEX.species)) if (s.evos.some(e => e.to === id)) return baseOf(pre)
  return id
}

export function newDraft(region: RegionId, rng: Rng = Math.random): DreamDraft {
  return { region, options: roll(region, [], rng), picks: [], skips: DT_SKIPS, rolls: 1 }
}

export const draftDone = (d: DreamDraft) => d.picks.length >= DT_TEAM

export function pickOption(d: DreamDraft, id: string, rng: Rng = Math.random): DreamDraft {
  if (draftDone(d) || !d.options.includes(id)) return d
  const picks = [...d.picks, id]
  if (picks.length >= DT_TEAM) return { ...d, picks, options: [] }
  return { ...d, picks, options: roll(d.region, picks, rng), rolls: d.rolls + 1 }
}

export function skipRoll(d: DreamDraft, rng: Rng = Math.random): DreamDraft {
  if (draftDone(d) || d.skips <= 0) return d
  return { ...d, skips: d.skips - 1, options: roll(d.region, d.picks, rng), rolls: d.rolls + 1 }
}
