import { describe, it, expect } from 'vitest'
import { Dex } from '@pkmn/sim'
import { challengerTrainer, gymName } from './trainers'
import { WEAK_TO, threatsTo } from './typechart'
import { GYM_TYPES } from './daily'
import type { RunState } from '../types/game'

const run = (over: Partial<RunState>) => ({ id: 'r1', gymType: 'fire', dailyDate: null, totalChallengers: 15, challengerIndex: 0, ...over } as RunState)

describe('type chart', () => {
  it('matches the battle engine for every type', () => {
    for (const def of GYM_TYPES) {
      const cap = (t: string) => t[0].toUpperCase() + t.slice(1)
      const engine = GYM_TYPES.filter(atk => Dex.getEffectiveness(cap(atk), cap(def)) > 0 && Dex.getImmunity(cap(atk), cap(def)))
      expect([...WEAK_TO[def]].sort(), def).toEqual(engine.sort())
    }
  })

  it('counts challengers with a type that hits the Gym hard', () => {
    expect(threatsTo('fire', [['Water'], ['Bug', 'Flying'], ['Rock', 'Ground']])).toBe(2)
  })
})

describe('trainers', () => {
  it('names each Gym after its type', () => {
    expect(gymName('fire')).toBe('Cinder Crater Gym')
  })

  it('follows the Gym Quest ladder up to the Champion', () => {
    expect(challengerTrainer(run({}), 0).title).toBe('Promising Trainer')
    expect(challengerTrainer(run({}), 4).title).toBe('Rival')
    expect(challengerTrainer(run({}), 9).title).toBe('Rival Gym Leader')
    expect(challengerTrainer(run({}), 14).title).toBe('Champion')
  })

  it('a Rival Gym Leader never shares your type', () => {
    for (let i = 0; i < 20; i++) expect(challengerTrainer(run({ id: `x${i}` }), 9).sprite).not.toBe('blaine')
  })

  it('is stable for a run and the same for everyone on a Daily', () => {
    expect(challengerTrainer(run({}), 3)).toEqual(challengerTrainer(run({}), 3))
    const a = challengerTrainer(run({ id: 'p1', dailyDate: '2026-11-15', totalChallengers: null }), 5)
    const b = challengerTrainer(run({ id: 'p2', dailyDate: '2026-11-15', totalChallengers: null }), 5)
    expect(a).toEqual(b)
  })
})
