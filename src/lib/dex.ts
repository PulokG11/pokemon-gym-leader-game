import data from '../data/dex.json'

export interface SpeciesData {
  name: string
  num: number
  types: string[]
  ability: string
  abilities: string[]
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }
  evos: { to: string; level: number }[]
  learnset: [number, string][]   // [level, moveId]; level 0 = learned on evolution
  tutor: string[]                // TM, tutor and egg moves offered by the Move Tutor reward
}

export interface MoveData {
  name: string
  type: string
  category: 'Physical' | 'Special' | 'Status'
  power: number
  accuracy: number | true
  pp: number
  priority: number
  desc: string
}

interface DexFile {
  species: Record<string, SpeciesData>
  moves: Record<string, MoveData>
  starters: Record<string, string[]>
  challengers: string[]
  typeChart: Record<string, Record<string, number>>
  regions: Record<string, { pool: string[] }>
  megas: Record<string, { name: string; types: string[]; base: string; stone: string }>
  legendaries: string[]      // legendary, mythical and Ultra Beast species ids
}

export const DEX = data as unknown as DexFile

export const toID = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

export function species(id: string): SpeciesData {
  const s = DEX.species[toID(id)]
  if (!s) throw new Error(`Unknown species: ${id}`)
  return s
}

export const move = (id: string): MoveData | undefined => DEX.moves[toID(id)]

/** Damage multiplier of an attack type against a defender's types (ignores abilities). */
export function effectiveness(attackType: string, defenderTypes: string[]): number {
  return defenderTypes.reduce((m, t) => m * (DEX.typeChart[t]?.[attackType] ?? 1), 1)
}

const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const LAST_ANIMATED = 649 // Black/White animated sprites cover Gen 1–5

export function artworkUrl(id: string): string {
  return `${SPRITES}/other/official-artwork/${species(id).num}.png`
}

/** Types of a species or of a Mega Evolution seen in battle (e.g. "Charizard-Mega-X"). */
export function typesOf(name: string): string[] {
  const id = toID(name)
  return DEX.species[id]?.types ?? DEX.megas[id]?.types ?? []
}

export function battleSpriteUrl(id: string, back: boolean): string {
  const mega = DEX.megas[toID(id)]
  if (mega) {
    // PokeAPI has no animated Mega sprites; Showdown names them "charizard-megax".
    const [base, ...forme] = mega.name.toLowerCase().split('-')
    return `https://play.pokemonshowdown.com/sprites/${back ? 'ani-back' : 'ani'}/${base}-${forme.join('')}.gif`
  }
  const num = DEX.species[toID(id)]?.num
  if (!num) return ''
  if (num <= LAST_ANIMATED) {
    return `${SPRITES}/versions/generation-v/black-white/animated/${back ? 'back/' : ''}${num}.gif`
  }
  return `${SPRITES}/${back ? 'back/' : ''}${num}.png`
}
