import type { GymType } from '../types/game'
import { WEAK_TO } from './typechart'
import { DEX, effectiveness } from './dex'

/** One line on what each Gym type is good at, shown when choosing starters. */
export const GYM_STRENGTH: Record<GymType, string> = {
  fire: 'Hard-hitting attacks, burns and fast sweepers.',
  water: 'Flexible, sturdy teams with strong special attacks.',
  grass: 'Status powders, healing and resilient Pokémon.',
  electric: 'Fast attackers and paralysis.',
  ghost: 'Tricky moves, immunities and status.',
  dragon: 'Powerful late bloomers with high stats.',
  normal: 'Balanced stats and wide move choice.',
  ice: 'Strong coverage against Dragon, Grass, Ground and Flying.',
  fighting: 'High Attack and priority punches.',
  poison: 'Poison, bulk and status.',
  ground: 'Earthquake power and Electric immunity.',
  flying: 'Speed and Ground immunity.',
  psychic: 'High Special Attack and clever status.',
  bug: 'Quick growth: early evolutions and status.',
  rock: 'High Defense and heavy hits.',
  dark: 'Speedy, tricky attackers.',
  steel: 'Exceptional Defense and many resistances.',
  fairy: 'Dragon immunity and steady special bulk.',
}

const cap = (t: string) => t[0].toUpperCase() + t.slice(1)
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0])

/** e.g. "Fire, Flying, Ice, Poison and Bug challengers." */
export const gymWeakness = (type: GymType) => `${list(WEAK_TO[type].map(cap))} challengers.`

const ALL_TYPES = Object.keys(DEX.typeChart).filter(t => t !== 'Stellar')

/** Types this Pokémon's own-type (STAB) attacks hit super-effectively. */
export const strongAgainst = (types: string[]) =>
  ALL_TYPES.filter(t => types.some(own => effectiveness(own, [t]) >= 2))

/** Attack types that hit this Pokémon super-effectively, with the multiplier (2 or 4). */
export const weakTo = (types: string[]) =>
  ALL_TYPES.map(t => ({ type: t, mult: effectiveness(t, types) })).filter(x => x.mult >= 2)
