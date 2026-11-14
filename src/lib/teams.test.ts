import { describe, it, expect } from 'vitest'
import { Teams, Dex } from '@pkmn/sim'
import { getGymLeaderTeam, getChallengerTeam } from './teams'
import type { GymType } from '../types/game'

const TYPES: GymType[] = [
  'fire', 'water', 'grass', 'electric', 'ghost', 'dragon',
  'normal', 'ice', 'fighting', 'poison', 'ground', 'flying',
  'psychic', 'bug', 'rock', 'dark', 'steel', 'fairy',
]

function checkTeam(packed: string) {
  const sets = Teams.unpack(packed)
  expect(sets).not.toBeNull()
  expect(sets!.length).toBe(3)
  for (const s of sets!) {
    expect(Dex.species.get(s.species).exists, s.species).toBe(true)
    expect(Dex.abilities.get(s.ability).exists, `${s.species} ability ${s.ability}`).toBe(true)
    expect(s.moves).toHaveLength(4)
    for (const m of s.moves) expect(Dex.moves.get(m).exists, `${s.species} move ${m}`).toBe(true)
    expect(s.level).toBe(50)
  }
}

describe('teams', () => {
  it.each(TYPES)('%s gym team unpacks to 3 valid sets', type => {
    checkTeam(getGymLeaderTeam(type))
  })

  it.each([0, 1, 2, 3, 4])('challenger %i team unpacks to 3 valid sets', i => {
    checkTeam(getChallengerTeam(i))
  })
})
