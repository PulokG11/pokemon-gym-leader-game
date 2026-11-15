import { describe, it, expect } from 'vitest'
import { Dex } from '@pkmn/sim'
import { GYM_TYPES } from './daily'
import { arenaEffect, battleExtras, upgradesFor } from './upgrades'
import { rewardOffer } from './economy'
import { seededRng } from './daily'

describe('Gym upgrades', () => {
  it('every type has the 8 common upgrades plus its own Arena and Forge', () => {
    for (const t of GYM_TYPES) {
      const list = upgradesFor(t)
      expect(list).toHaveLength(10)
      expect(new Set(list.map(u => u.id)).size).toBe(10)
      expect(list.filter(u => u.typed)).toHaveLength(2)
    }
    expect(upgradesFor('fire').map(u => u.name)).toContain('Burning Arena')
    expect(upgradesFor('fire').map(u => u.name)).toContain('Volcanic Forge')
  })

  it('arena weather and terrain exist in the battle engine', () => {
    for (const t of GYM_TYPES) {
      const a = arenaEffect(t)
      if (a) expect(Dex.conditions.get(a.field).exists, a.field).toBe(true)
    }
  })

  it('only owned upgrades reach the battle', () => {
    expect(battleExtras('fire', [], 2)).toEqual({ aiLevel: 2, crowd: false, arena: undefined, forge: undefined })
    expect(battleExtras('fire', ['crowd', 'arena', 'forge'], 0)).toEqual({
      aiLevel: 0, crowd: true, arena: { kind: 'weather', field: 'sunnyday' }, forge: { kind: 'status', status: 'brn' },
    })
    expect(battleExtras('dragon', ['arena', 'forge'], 1)).toMatchObject({ arena: { kind: 'boost' }, forge: { kind: 'slow' } })
  })

  it('Training Room and Item Workshop make their rewards more common', () => {
    const count = (boost: object, kinds: string[]) => {
      let n = 0
      for (let i = 0; i < 400; i++) n += rewardOffer('fire', 6, seededRng(`b${i}`), boost).filter(r => kinds.includes(r.kind)).length
      return n
    }
    expect(count({ training: true }, ['training', 'team_training'])).toBeGreaterThan(count({}, ['training', 'team_training']))
    expect(count({ workshop: true }, ['held_item'])).toBeGreaterThan(count({}, ['held_item']))
  })
})
