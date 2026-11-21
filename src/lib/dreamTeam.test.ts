import { describe, expect, it } from 'vitest'
import { DT_OPTIONS, DT_ROLLS, DT_SKIPS, DT_TEAM, baseOf, draftDone, draftPool, finalForm, newDraft, pickOption, skipRoll } from './dreamTeam'
import { simulateDreamTeam, dreamTeamFor } from './dreamSim'
import { lineOf } from './regional'
import { seededRng } from './daily'
import { REGION_LIST, type RegionId } from './regions'

describe('Dream Team Builder draft', () => {
  it('each region drafts from its own Pokédex, legendaries included, no regional forms', () => {
    const kanto = draftPool('kanto')
    expect(kanto).toContain('bulbasaur')
    expect(kanto).toContain('mewtwo')
    expect(kanto).not.toContain('chikorita')
    expect(kanto).not.toContain('raichualola')
    for (const r of REGION_LIST) expect(draftPool(r.id as RegionId).length).toBeGreaterThan(60)
  })

  it('6 options per roll, 6 picks, 2 skips, at most 8 rolls, no repeated evolution lines', () => {
    const rng = seededRng('draft')
    let d = newDraft('johto', rng)
    expect(d.options).toHaveLength(DT_OPTIONS)
    d = skipRoll(d, rng)
    d = skipRoll(d, rng)
    expect(d.skips).toBe(0)
    expect(skipRoll(d, rng)).toBe(d)
    while (!draftDone(d)) {
      expect(new Set(d.options.map(baseOf)).size).toBe(d.options.length)
      d = pickOption(d, d.options[0], rng)
    }
    expect(d.picks).toHaveLength(DT_TEAM)
    expect(d.rolls).toBeLessThanOrEqual(DT_ROLLS)
    expect(d.options).toEqual([])
    expect(new Set(d.picks.map(baseOf)).size).toBe(DT_TEAM)
    expect(DT_SKIPS).toBe(2)
  })

  it('a pick must be one of the options', () => {
    const d = newDraft('kanto', seededRng('x'))
    expect(pickOption(d, 'not-there')).toBe(d)
  })

  it('drafted Pokémon battle as their strongest final evolution', () => {
    expect(finalForm('charmander')).toBe('charizard')
    expect(lineOf('eevee')).toContain(finalForm('eevee'))
    expect(finalForm('tauros')).toBe('tauros')
  })
})

describe('Dream Team simulation', () => {
  const picks = ['charizard', 'blastoise', 'venusaur', 'snorlax', 'gengar', 'dragonite']

  it('plays the battles in order until one is lost, and is repeatable', () => {
    const a = simulateDreamTeam('kanto', picks)
    expect(a.battles.length).toBeGreaterThan(0)
    a.battles.forEach((b, i) => expect(b.index).toBe(i))
    expect(a.battles.slice(0, -1).every(b => b.won)).toBe(true)
    expect(a.beaten).toBe(a.battles.filter(b => b.won).length)
    expect(a.champion).toBe(a.beaten === 13)
    expect(simulateDreamTeam('kanto', picks)).toEqual(a)
  }, 60000)

  it('the team fights at each opponent’s top level', () => {
    const team = dreamTeamFor('kanto', ['charmander'], 0)
    expect(team[0].species).toBe('charizard')
    expect(team[0].level).toBe(14)
  })
})
