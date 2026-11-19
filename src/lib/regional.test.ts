import { describe, expect, it } from 'vitest'
import { Dex } from '@pkmn/sim'
import { DEX } from './dex'
import { REGIONS, levelCapFor } from './regions'
import { bestMoves, buildTrainerTeam, regionalPicks, superEffectiveTypes, usableMegaStones } from './regional'
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

describe('all regions', () => {
  for (const region of Object.values(REGIONS)) {
    it(`${region.name}: 13 valid trainers, starters, items and a catch pool`, () => {
      expect(region.trainers).toHaveLength(13)
      expect(region.trainers.map(t => t.title)).toEqual([...Array(8).fill('Gym Leader'), ...Array(4).fill('Elite Four'), 'Champion'])
      expect(region.trainers[0].team).toHaveLength(3)
      for (const id of region.starters) expect(DEX.species[id], id).toBeTruthy()
      for (const t of region.trainers) {
        for (const m of t.team) {
          if (m.species !== 'rival-starter') expect(DEX.species[m.species], `${t.name}: ${m.species}`).toBeTruthy()
          if (m.item) expect(Dex.items.get(m.item).exists, m.item).toBe(true)
        }
      }
      for (const s of region.megaStones) expect(Dex.items.get(s).megaStone, s).toBeTruthy()
      for (const c of Object.values(region.rivalCounter ?? {})) {
        expect(DEX.species[c.species]).toBeTruthy()
        expect(Dex.items.get(c.item).exists).toBe(true)
      }
      for (const starter of region.starters) {
        const champ = buildTrainerTeam(region, 12, starter)
        expect(champ).toHaveLength(6)
        for (const m of champ) { expect(m.moves.length).toBeGreaterThanOrEqual(2); expect(m.evs).toBeDefined() }
        // A legendary or pseudo-legendary on every Champion's team.
        expect(champ.some(m => Dex.species.get(m.species).tags.length > 0 || Dex.species.get(m.species).bst >= 600)).toBe(true)
      }
      expect(regionalPicks(region.id, 12, [], seeded(5), 3)).toHaveLength(3)
      // Counters for the next two opponents, from every point in the region.
      for (let i = 0; i < 12; i++) {
        const [a, b] = [region.trainers[i].type, region.trainers[i + 1].type]
        const level = Math.min(...region.trainers[i].team.map(m => m.level)) - 2
        const picks = regionalPicks(region.id, Math.max(11, level), [], seeded(i + 1), 5, [a, b])
        expect(picks).toHaveLength(5)
        expect(picks.some(p => superEffectiveTypes(p, a).length > 0), `${region.name} ${i}: vs ${a}`).toBe(true)
        expect(picks.some(p => superEffectiveTypes(p, b).length > 0), `${region.name} ${i}: vs ${b}`).toBe(true)
      }
      const caps = region.trainers.map((_, i) => levelCapFor(region, i))
      expect([...caps].sort((a, b) => a - b)).toEqual(caps)
    })
  }
})
