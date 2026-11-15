import type { GymType } from '../types/game'

/** Attacking types that are super effective against each defending type (Gen 6+ chart). */
export const WEAK_TO: Record<GymType, GymType[]> = {
  normal: ['fighting'],
  fire: ['water', 'ground', 'rock'],
  water: ['electric', 'grass'],
  grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
  electric: ['ground'],
  ice: ['fire', 'fighting', 'rock', 'steel'],
  fighting: ['flying', 'psychic', 'fairy'],
  poison: ['ground', 'psychic'],
  ground: ['water', 'grass', 'ice'],
  flying: ['electric', 'ice', 'rock'],
  psychic: ['bug', 'ghost', 'dark'],
  bug: ['fire', 'flying', 'rock'],
  rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
  ghost: ['ghost', 'dark'],
  dragon: ['ice', 'dragon', 'fairy'],
  dark: ['fighting', 'bug', 'fairy'],
  steel: ['fire', 'fighting', 'ground'],
  fairy: ['poison', 'steel'],
}

/** How many of these Pokémon carry a type that hits the Gym's type super effectively. */
export function threatsTo(gymType: GymType, monTypes: string[][]): number {
  const weak = new Set(WEAK_TO[gymType])
  return monTypes.filter(ts => ts.some(t => weak.has(t.toLowerCase() as GymType))).length
}
