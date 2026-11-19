import { describe, it, expect } from 'vitest'
import { Dex, Teams } from '@pkmn/sim'
import { DEX } from './dex'
import {
  STARTER_CHOICES, buildChallenger, createMon, evolveInto, gainXp, learnableMoves, levelFromXp, movesAtLevel, packTeam,
  readyEvolutions, replaceMove, stageForLevel, starterCandidates, teachMove, tutorOptions, xpForLevel,
} from './progression'

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

describe('generated dex data', () => {
  it('every species and move resolves in the battle engine', () => {
    for (const s of Object.values(DEX.species)) expect(Dex.species.get(s.name).exists, s.name).toBe(true)
    for (const m of Object.values(DEX.moves)) expect(Dex.moves.get(m.name).exists, m.name).toBe(true)
  })

  it('every gym type offers enough starters of that type', () => {
    expect(Object.keys(DEX.starters)).toHaveLength(18)
    for (const [type, ids] of Object.entries(DEX.starters)) {
      expect(ids.length, type).toBeGreaterThanOrEqual(STARTER_CHOICES)
      for (const id of ids) {
        expect(DEX.species[id].types.map(t => t.toLowerCase())).toContain(type)
        expect(id, 'Paradox Pokémon are not starters').not.toBe('gougingfire')
      }
    }
  })
})

describe('moves by level', () => {
  it('returns the 4 latest level-up moves', () => {
    expect(movesAtLevel('charmander', 1)).toEqual(['growl', 'scratch'])
    const at20 = movesAtLevel('charmander', 20)
    expect(at20).toHaveLength(4)
    expect(at20).not.toContain('scratch')
  })
})

describe('xp and levels', () => {
  it('uses a cubic curve', () => {
    expect(xpForLevel(10)).toBe(1000)
    expect(levelFromXp(1000)).toBe(10)
    expect(levelFromXp(1330)).toBe(10)
    expect(levelFromXp(1331)).toBe(11)
  })

  it('levels up and learns moves, but evolving waits for the player', () => {
    const mon = createMon('charmander', 15)
    const report = gainXp(mon, xpForLevel(17) - mon.xp)
    expect(report.after.level).toBe(17)
    expect(report.after.species).toBe('charmander')
    expect(report.events.some(e => e.kind === 'evolve')).toBe(false)
    expect(report.events.filter(e => e.kind === 'levelup')).toHaveLength(2)
    expect(report.after.moves.length).toBeLessThanOrEqual(4)
    expect(readyEvolutions(report.after)).toEqual(['charmeleon'])
  })

  it('evolves on demand only once the level is reached', () => {
    expect(readyEvolutions(createMon('charmander', 15))).toEqual([])
    expect(evolveInto(createMon('charmander', 15), 'charmeleon')).toBeNull()
    const r = evolveInto(createMon('charmander', 16), 'charmeleon')!
    expect(r.after.species).toBe('charmeleon')
    expect(r.events[0]).toEqual({ kind: 'evolve', from: 'charmander', to: 'charmeleon' })
    expect(evolveInto(createMon('charmander', 40), 'charizard')).toBeNull()
  })

  it('offers a new move instead of forgetting one when 4 are known', () => {
    const mon = createMon('charmander', 19)
    expect(mon.moves).toHaveLength(4)
    const report = gainXp(mon, xpForLevel(30) - mon.xp)
    const learned = report.events.filter(e => e.kind === 'learn')
    expect(learned.length).toBeGreaterThan(0)
    for (const e of learned) expect(e).toMatchObject({ offered: true })
    expect(report.after.moves).toEqual(mon.moves)
  })
  it('does not level up on small XP gains', () => {
    const mon = createMon('charmander', 15)
    const report = gainXp(mon, 10)
    expect(report.after.level).toBe(15)
    expect(report.events).toEqual([])
  })

  it('evolved forms have higher base stats', () => {
    const total = (id: string) => Object.values(DEX.species[id].baseStats).reduce((a, b) => a + b, 0)
    expect(total('charmeleon')).toBeGreaterThan(total('charmander'))
  })
})

describe('teams', () => {
  it('offers 6 distinct starters of the chosen type', () => {
    const picks = starterCandidates('fire', seeded(1))
    expect(picks).toHaveLength(STARTER_CHOICES)
    expect(new Set(picks.map(p => p.species)).size).toBe(STARTER_CHOICES)
    for (const p of picks) expect(DEX.species[p.species].types).toContain('Fire')
  })

  it('evolves challengers to match their level', () => {
    expect(stageForLevel('charmander', 10, seeded(1))).toBe('charmander')
    expect(stageForLevel('charmander', 20, seeded(1))).toBe('charmeleon')
    expect(stageForLevel('charmander', 40, seeded(1))).toBe('charizard')
  })

  it('packs teams the battle engine can read', () => {
    const roster = starterCandidates('water', seeded(7)).slice(0, 3)
    const challenger = buildChallenger(roster, 2, seeded(3))
    for (const team of [roster, challenger]) {
      const sets = Teams.unpack(packTeam(team))!
      expect(sets).toHaveLength(3)
      sets.forEach((set, i) => {
        expect(Dex.species.get(set.species).id).toBe(team[i].species)
        expect(set.level).toBe(team[i].level)
        expect(set.moves.map(m => Dex.moves.get(m).id)).toEqual(team[i].moves)
      })
    }
  })
})

describe('move management', () => {
  it('swaps in a level-up move learned earlier', () => {
    const mon = createMon('charmander', 20)
    const options = learnableMoves(mon)
    expect(options).toContain('scratch')
    expect(options).not.toContain(mon.moves[0])
    const after = replaceMove(mon, mon.moves[0], 'scratch')!
    expect(after.moves).toContain('scratch')
    expect(after.moves).toHaveLength(4)
    expect(replaceMove(mon, mon.moves[0], 'hydropump')).toBeNull()
  })

  it('the Move Tutor teaches TM, tutor or egg moves that can later be swapped back', () => {
    const mon = createMon('charmander', 20)
    const options = tutorOptions(mon, seeded(3))
    expect(options).toHaveLength(3)
    for (const m of options) expect(DEX.species.charmander.tutor).toContain(m)
    expect(teachMove(mon, options[0])).toBeNull() // 4 moves known: must forget one
    const forgot = mon.moves[1]
    const taught = teachMove(mon, options[0], forgot)!
    expect(taught.moves).toContain(options[0])
    expect(taught.moves).not.toContain(forgot)
    expect(learnableMoves(taught)).toContain(forgot)
    const back = replaceMove(taught, forgot === taught.moves[0] ? taught.moves[1] : taught.moves[0], forgot)
    expect(back).not.toBeNull()
    expect(learnableMoves(teachMove(mon, options[1], mon.moves[0])!)).not.toContain(options[1])
  })
})
