import { describe, expect, it } from 'vitest'
import { Dex } from '@pkmn/sim'
import { DEX } from './dex'
import { REGIONS, levelCapFor } from './regions'
import { bestMoves, buildTrainerTeam, regionalPicks, usableMegaStones } from './regional'
import { createMon } from './progression'

const kanto = REGIONS.kanto
const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

describe('Kanto data', () => {
  it('every trainer Pokémon, starter and Mega Stone exists', () => {
    for (const id of kanto.starters) expect(DEX.species[id], id).toBeTruthy()
    for (const t of kanto.trainers) for (const m of t.team) if (m.species !== 'rival-starter') expect(DEX.species[m.species], m.species).toBeTruthy()
    for (const s of kanto.megaStones) expect(Dex.items.get(s).megaStone, s).toBeTruthy()
  })

  it('has 8 Gym Leaders, the Elite Four and a Champion, growing from 3 to 6 Pokémon', () => {
    expect(kanto.trainers.map(t => t.title)).toEqual([...Array(8).fill('Gym Leader'), ...Array(4).fill('Elite Four'), 'Champion'])
    expect(kanto.trainers[0].team).toHaveLength(3)
    for (const t of kanto.trainers.slice(8)) expect(t.team).toHaveLength(6)
    const caps = kanto.trainers.map((_, i) => levelCapFor(kanto, i))
    expect([...caps].sort((a, b) => a - b)).toEqual(caps)
  })

  it('the pick pool is unevolved and has no legendaries', () => {
    const pool = DEX.regions.kanto.pool
    for (const id of ['pikachu', 'onix', 'dratini', 'eevee']) expect(pool).toContain(id)
    for (const id of ['raichu', 'pichu', 'charmeleon', 'zapdos', 'mewtwo', 'mew', 'ditto']) expect(pool).not.toContain(id)
  })
})

describe('trainer teams', () => {
  it('early Gyms use normal movesets; the League uses strong sets, items and training', () => {
    const brock = buildTrainerTeam(kanto, 0, 'charmander')
    expect(brock.map(m => m.species)).toEqual(['geodude', 'kabuto', 'onix'])
    expect(brock[0].evs).toBeUndefined()
    const lance = buildTrainerTeam(kanto, 11, 'charmander')
    for (const m of lance) {
      expect(m.evs).toBeDefined()
      expect(m.item).toBeTruthy()
      expect(m.moves.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('the Champion counters your starter with its Mega Stone and brings a legendary', () => {
    const blue = buildTrainerTeam(kanto, 12, 'charmander')
    expect(blue.at(-1)).toMatchObject({ species: 'blastoise', item: 'Blastoisinite' })
    expect(blue.map(m => m.species)).toContain('zapdos')
    expect(buildTrainerTeam(kanto, 12, 'squirtle').at(-1)?.species).toBe('venusaur')
  })

  it('best movesets favour strong, varied attacks', () => {
    const moves = bestMoves('dragonite', 62, true)
    expect(moves.length).toBe(4)
    const attacks = moves.filter(m => DEX.moves[m].category !== 'Status')
    expect(new Set(attacks.map(m => DEX.moves[m].type)).size).toBe(attacks.length)
  })
})

describe('picks and Mega Stones', () => {
  it('offers unevolved Pokémon you do not own, each with an attack', () => {
    const owned = [createMon('charmander', 12)]
    const picks = regionalPicks('kanto', 12, owned, seeded(7), 3)
    expect(picks).toHaveLength(3)
    for (const p of picks) {
      expect(DEX.regions.kanto.pool).toContain(p.species)
      expect(p.species).not.toBe('charmander')
      expect(p.level).toBe(12)
    }
  })

  it('only offers Mega Stones your Pokémon can use', () => {
    expect(usableMegaStones(kanto, [createMon('charmander', 12)])).toEqual(['Charizardite X', 'Charizardite Y'])
    expect(usableMegaStones(kanto, [createMon('rattata', 12)])).toEqual([])
  })
})
