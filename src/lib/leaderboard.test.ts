import { describe, it, expect } from 'vitest'
import { nicknameProblem, suggestNickname, NICKNAME_RE } from './leaderboard'
import { pendingSubmissions } from './sync'
import { battleKeyOf, openBattle } from './battleGuard'
import type { RunState } from '../types/game'

describe('nicknames', () => {
  it('accepts 3–16 letters, digits and underscores', () => {
    expect(nicknameProblem('Ash_Ketchum99')).toBeNull()
    expect(nicknameProblem('ab')).toMatch(/3/)
    expect(nicknameProblem('a'.repeat(17))).toMatch(/16/)
    expect(nicknameProblem('no spaces')).toMatch(/Letters/)
    expect(nicknameProblem('émile')).toMatch(/Letters/)
  })

  it('suggests valid nicknames', () => {
    for (let i = 0; i < 200; i++) expect(suggestNickname()).toMatch(NICKNAME_RE)
  })
})

describe('pending Daily submissions', () => {
  const r = (date: string, wins: number, finished = false) => ({ date, gymType: 'fire' as const, wins, finished })

  it('sends new or changed results for today and yesterday only', () => {
    const daily = {
      '2026-11-15': r('2026-11-15', 4),
      '2026-11-14': r('2026-11-14', 7, true),
      '2026-11-10': r('2026-11-10', 9, true),
    }
    expect(pendingSubmissions(daily, {}, '2026-11-15').map(x => x.date).sort()).toEqual(['2026-11-14', '2026-11-15'])
  })

  it('skips results the server already has', () => {
    const daily = { '2026-11-15': r('2026-11-15', 4) }
    expect(pendingSubmissions(daily, { '2026-11-15': { wins: 4, finished: false } }, '2026-11-15')).toEqual([])
    expect(pendingSubmissions(daily, { '2026-11-15': { wins: 3, finished: false } }, '2026-11-15')).toHaveLength(1)
  })

  it('treats the day before a month boundary as yesterday', () => {
    const daily = { '2026-11-30': r('2026-11-30', 2) }
    expect(pendingSubmissions(daily, {}, '2026-12-01')).toHaveLength(1)
  })
})

describe('Daily replay guard', () => {
  const run = (mode: 'daily' | 'quest', battleKey: string | null = null) =>
    ({ id: `${mode}-run`, mode, challengerIndex: 3, battleKey } as RunState)

  it('opens a fresh battle and marks it in the saved run', () => {
    const marks: string[] = []
    expect(openBattle(run('daily'), k => marks.push(k))).toBe(false)
    expect(marks).toEqual(['daily-run:3'])
  })

  it('does not forfeit when the same page remounts the battle', () => {
    const r = run('daily')
    openBattle(r, () => {})
    expect(openBattle({ ...r, battleKey: battleKeyOf(r) }, () => {})).toBe(false)
  })

  it('forfeits a Daily battle that was open before the page reloaded', () => {
    const r = { ...run('daily'), id: 'reloaded' }
    expect(openBattle({ ...r, battleKey: battleKeyOf(r) }, () => {})).toBe(true)
  })

  it('never forfeits Gym Quest battles', () => {
    const r = { ...run('quest'), id: 'quest-reloaded' }
    expect(openBattle({ ...r, battleKey: battleKeyOf(r) }, () => {})).toBe(false)
  })
})
