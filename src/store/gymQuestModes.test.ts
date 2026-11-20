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
import { useRunStore } from './runStore'
import { useRecordsStore } from './recordsStore'
import { challengerSize, endlessChallengerTitle, endlessStep, GYM_QUEST_LENGTH } from '../lib/progression'
import { challengerTrainer } from '../lib/trainers'

const store = () => useRunStore.getState()
const run = () => store().run!

function start(endless: boolean) {
  store().startQuest('fire')
  store().setEndless(endless)
  store().confirmTeam(run().candidates.slice(0, 3).map(c => c.uid))
}

describe('Gym Quest modes', () => {
  beforeEach(() => store().clearRun())

  it('Title Defense: 15 challengers, one loss ends the run', () => {
    start(false)
    expect(run().totalChallengers).toBe(GYM_QUEST_LENGTH)
    store().loseBattle()
    expect(run().phase).toBe('run_ended')
  })

  it('Endless: a loss heals the team, counts a loss and brings the next challenger', () => {
    start(true)
    expect(run().endless).toBe(true)
    expect(run().totalChallengers).toBeNull()
    const first = run().challenger.map(m => m.uid)
    store().winBattle()
    expect(run().challengerIndex).toBe(1)
    useRunStore.setState({ run: { ...run(), phase: 'gym', roster: run().roster.map(m => ({ ...m, hp: 0 })) } })
    store().loseBattle()
    expect(run().phase).toBe('gym')
    expect(run().losses).toBe(1)
    expect(run().challengerIndex).toBe(2)
    expect(run().roster.every(m => m.hp === 1)).toBe(true)
    expect(run().challenger.map(m => m.uid)).not.toEqual(first)
  })

  it('Endless: retiring ends the run and records wins and losses', () => {
    start(true)
    store().winBattle()
    useRunStore.setState({ run: { ...run(), phase: 'gym' } })
    store().loseBattle()
    const before = useRecordsStore.getState().quests.length
    store().retireRun()
    expect(run().phase).toBe('run_ended')
    const rec = useRecordsStore.getState().quests[0]
    expect(useRecordsStore.getState().quests.length).toBe(before + 1)
    expect(rec).toMatchObject({ endless: true, wins: 1, losses: 1, cleared: false })
  })

  it('the mode can only change while picking starters, and Title Defense cannot be retired', () => {
    start(false)
    store().setEndless(true)
    expect(run().endless).toBeFalsy()
    store().retireRun()
    expect(run().phase).not.toBe('run_ended')
  })

  it('Endless difficulty eases after 15 and bosses recur', () => {
    expect(endlessStep(14)).toBe(14)
    expect(endlessStep(16)).toBe(15)
    expect(endlessStep(40)).toBeLessThan(30)
    expect(challengerSize('singles', 3)).toBe(3)
    expect(challengerSize('singles', 20, true)).toBe(4)
    expect(challengerSize('singles', 45, true)).toBe(6)
    expect(challengerSize('singles', 45)).toBe(3) // the Daily is unchanged
    expect(endlessChallengerTitle(19)).toBe('Elite Four Member')
    expect(endlessChallengerTitle(24)).toBe('Champion')
    expect(endlessChallengerTitle(14)).toBe('Elite Trainer')
    start(true)
    expect(challengerTrainer(run(), 24).title).toBeTruthy()
  })
})
