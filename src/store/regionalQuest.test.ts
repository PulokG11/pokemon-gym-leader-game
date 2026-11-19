import { beforeEach, describe, expect, it, vi } from 'vitest'

// The stores persist to localStorage; give this test an in-memory one.
vi.hoisted(() => {
  const data = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, String(v)),
      removeItem: (k: string) => void data.delete(k),
      clear: () => data.clear(),
      key: (i: number) => [...data.keys()][i] ?? null,
      get length() { return data.size },
    },
  })
})
import { useRunStore, REGIONAL_RETRIES } from './runStore'
import { REGIONS } from '../lib/regions'
import { createMon } from '../lib/progression'

const kanto = REGIONS.kanto
const store = () => useRunStore.getState()
const run = () => store().run!

function startWithCharmander() {
  store().startRegional('kanto')
  const starter = run().candidates.find(c => c.species === 'charmander')!
  const picks = run().candidates.filter(c => !kanto.starters.includes(c.species)).slice(0, 2).map(c => c.uid)
  expect(store().confirmRegionalTeam(starter.uid, picks).ok).toBe(true)
}

describe('Regional Quest', () => {
  beforeEach(() => store().clearRun())

  it('drafts a starter plus as many picks as Brock has Pokémon, minus one', () => {
    store().startRegional('kanto')
    const c = run().candidates
    expect(c.filter(m => kanto.starters.includes(m.species))).toHaveLength(3)
    expect(c.length).toBeGreaterThan(3)
    const starter = c.find(m => m.species === 'squirtle')!
    const others = c.filter(m => !kanto.starters.includes(m.species)).map(m => m.uid)
    expect(store().confirmRegionalTeam(starter.uid, others.slice(0, 3)).ok).toBe(false)
    expect(store().confirmRegionalTeam(starter.uid, others.slice(0, 2)).ok).toBe(true)
    expect(run().roster).toHaveLength(3)
    expect(run().phase).toBe('gym')
    expect(run().challenger.map(m => m.species)).toEqual(['geodude', 'kabuto', 'onix'])
    expect(run().retries).toBe(REGIONAL_RETRIES)
  })

  it('a win heals everyone, caps XP at the next opponent, then offers a Pokémon and a reward', () => {
    startWithCharmander()
    useRunStore.setState({ run: { ...run(), roster: run().roster.map((m, i) => ({ ...m, hp: i === 0 ? 0 : 0.3 })) } })
    store().winBattle()
    const r = run()
    expect(r.phase).toBe('reward_pending')
    expect(r.challengerIndex).toBe(1)
    expect(r.roster.every(m => m.hp === 1)).toBe(true)
    const misty = Math.max(...kanto.trainers[1].team.map(m => m.level))
    expect(Math.max(...r.roster.map(m => m.level))).toBeLessThanOrEqual(misty)
    expect(r.picks).toHaveLength(3)
    expect(r.rewardOffer).toHaveLength(3)
    expect(r.challenger.map(m => m.species)).toEqual(['staryu', 'psyduck', 'starmie'])
    expect(r.gymType).toBe('water')

    expect(store().takeRegionalPick(r.picks![0].uid).ok).toBe(true)
    expect(run().roster).toHaveLength(4)
    expect(run().phase).toBe('reward_pending')
    const candy = run().rewardOffer!.find(x => x.kind === 'rare_candy') ?? run().rewardOffer!.find(x => x.kind === 'evo_stone')
    if (candy) {
      expect(store().takeReward(candy).ok).toBe(true)
      expect(run().phase).toBe('gym')
    }
  })

  it('a full team sends new catches to the box, and boxed Pokémon can swap in', () => {
    startWithCharmander()
    const extra = ['pidgey', 'rattata', 'caterpie', 'weedle'].map(id => createMon(id, 12))
    useRunStore.setState({ run: { ...run(), roster: [...run().roster, ...extra.slice(0, 3)] } })
    expect(run().roster).toHaveLength(6)
    store().winBattle()
    const pick = run().picks![0]
    store().takeRegionalPick(pick.uid)
    expect(run().roster).toHaveLength(6)
    expect(run().box!.map(m => m.uid)).toContain(pick.uid)

    const out = run().roster[5]
    expect(store().swapFromBox(pick.uid).ok).toBe(false) // team full: must choose who leaves
    expect(store().swapFromBox(pick.uid, out.uid).ok).toBe(true)
    expect(run().roster.map(m => m.uid)).toContain(pick.uid)
    expect(run().box!.map(m => m.uid)).toContain(out.uid)
    expect(store().sendToBox(pick.uid).ok).toBe(true)
    expect(run().roster).toHaveLength(5)
  })

  it('boxed Pokémon earn no XP', () => {
    startWithCharmander()
    const boxed = createMon('pidgey', 11)
    useRunStore.setState({ run: { ...run(), box: [boxed] } })
    store().winBattle()
    expect(run().box![0].xp).toBe(boxed.xp)
  })

  it('3 retries: losses heal the team and repeat the battle, the 4th ends the quest', () => {
    startWithCharmander()
    for (let left = REGIONAL_RETRIES - 1; left >= 0; left--) {
      useRunStore.setState({ run: { ...run(), roster: run().roster.map(m => ({ ...m, hp: 0 })) } })
      store().loseBattle()
      expect(run().phase).toBe('gym')
      expect(run().retries).toBe(left)
      expect(run().challengerIndex).toBe(0)
      expect(run().roster.every(m => m.hp === 1)).toBe(true)
    }
    store().loseBattle()
    expect(run().phase).toBe('run_ended')
    expect(run().won).toBe(false)
  })

  it('beating the Champion ends the quest as the new Champion', () => {
    startWithCharmander()
    useRunStore.setState({ run: { ...run(), challengerIndex: kanto.trainers.length - 1 } })
    store().winBattle()
    expect(run().phase).toBe('run_ended')
    expect(run().won).toBe(true)
  })
})
