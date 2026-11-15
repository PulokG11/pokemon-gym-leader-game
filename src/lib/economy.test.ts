import { describe, it, expect } from 'vitest'
import { Dex, Teams } from '@pkmn/sim'
import { DEX } from './dex'
import { GYM_TYPES, seededRng } from './daily'
import {
  HELD_ITEM_DESC, MAX_TEAM, baseOf, merchantStock, recruitOptions, rewardOffer, typeItemFor,
} from './economy'
import { createMon, evolveNow, levelUp, packTeam } from './progression'

describe('reward offers', () => {
  it('always offers 3 different rewards, including a Recruit while the team has room', () => {
    for (let i = 0; i < 200; i++) {
      const size = 3 + (i % 3)
      const offer = rewardOffer('fire', size, seededRng(`o${i}`))
      expect(offer).toHaveLength(3)
      expect(new Set(offer.map(r => r.kind)).size).toBe(3)
      expect(offer.some(r => r.kind === 'recruit')).toBe(true)
    }
  })

  it('stops offering Recruits once the team has six', () => {
    for (let i = 0; i < 100; i++) {
      expect(rewardOffer('water', MAX_TEAM, seededRng(`f${i}`)).some(r => r.kind === 'recruit')).toBe(false)
    }
  })

  it('is identical for the same seed (Daily fairness)', () => {
    const a = rewardOffer('ghost', 3, seededRng('daily:x'))
    const b = rewardOffer('ghost', 3, seededRng('daily:x'))
    expect(a).toEqual(b)
  })
})

describe('items', () => {
  it('every held item exists in the battle engine', () => {
    const items = [...Object.keys(HELD_ITEM_DESC), ...GYM_TYPES.map(typeItemFor)]
    for (const item of items) expect(Dex.items.get(item).exists, item).toBe(true)
  })

  it('held items are packed into the team the engine reads', () => {
    const mon = { ...createMon('charmander', 15), item: 'Charcoal' }
    expect(Teams.unpack(packTeam([mon]))![0].item).toBe('Charcoal')
  })

  it('merchant sells bag items and the Gym’s type item', () => {
    const stock = merchantStock('fire', seededRng('m'))
    expect(stock.filter(s => s.kind === 'bag')).toHaveLength(4)
    expect(stock.some(s => s.item === 'Charcoal')).toBe(true)
  })
})

describe('recruits', () => {
  const roster = [createMon('charmander', 15), createMon('vulpix', 14), createMon('growlithe', 16)]

  it('offers Pokémon of the Gym type the team does not own, near the team level', () => {
    for (let i = 0; i < 30; i++) {
      const opts = recruitOptions('fire', roster, seededRng(`r${i}`))
      expect(opts.length).toBeGreaterThan(0)
      for (const o of opts) {
        expect(DEX.species[o.species].types).toContain('Fire')
        expect(['charmander', 'vulpix', 'growlithe']).not.toContain(baseOf(o.species))
        expect(o.level).toBe(14)
      }
    }
  })

  it('maps evolved forms back to their base', () => {
    expect(baseOf('charizard')).toBe('charmander')
    expect(baseOf('charmander')).toBe('charmander')
  })
})

describe('training and stones', () => {
  it('training adds levels and can evolve', () => {
    const r = levelUp(createMon('charmander', 14), 3)
    expect(r.after.level).toBe(17)
    expect(r.after.species).toBe('charmeleon')
  })

  it('an Evolution Stone evolves at any level, even stone evolutions', () => {
    expect(evolveNow(createMon('vulpix', 10))?.after.species).toBe('ninetales')
    expect(evolveNow(createMon('charizard', 50))).toBeNull()
  })
})
