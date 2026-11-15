import { describe, it, expect } from 'vitest'
import { Dex } from '@pkmn/sim'
import { effectiveness } from './dex'

const TYPES = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy']

const engine = (atk: string, def: string[]) =>
  Dex.getImmunity(atk, def) ? 2 ** Dex.getEffectiveness(atk, def) : 0

describe('move effectiveness badges', () => {
  it('match the battle engine for every attack type against every single and dual type', () => {
    for (const atk of TYPES) {
      for (const a of TYPES) {
        for (const b of TYPES) {
          const def = a === b ? [a] : [a, b]
          expect(effectiveness(atk, def), `${atk} vs ${def.join('/')}`).toBe(engine(atk, def))
        }
      }
    }
  })

  it('examples', () => {
    expect(effectiveness('Water', ['Fire'])).toBe(2)
    expect(effectiveness('Fire', ['Water', 'Bug'])).toBe(1)
    expect(effectiveness('Ground', ['Flying'])).toBe(0)
    expect(effectiveness('Fire', ['Water', 'Rock'])).toBe(0.25)
  })
})
