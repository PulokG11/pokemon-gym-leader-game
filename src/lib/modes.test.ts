import { describe, it, expect } from 'vitest'
import { DEX } from './dex'
import { dailyRng, dailyType, formatCountdown, msUntilUtcMidnight, utcDate, GYM_TYPES } from './daily'
import {
  buildDailyChallenger, dailyChallengerLevel, questChallengerTitle, starterCandidates, GYM_QUEST_LENGTH,
} from './progression'

const strip = (mons: { species: string; level: number; moves: string[] }[]) =>
  mons.map(({ species, level, moves }) => ({ species, level, moves }))

describe('Daily Challenge', () => {
  it('uses the UTC date, not local time', () => {
    expect(utcDate(new Date('2026-11-15T23:30:00Z'))).toBe('2026-11-15')
    expect(utcDate(new Date('2026-11-16T00:10:00Z'))).toBe('2026-11-16')
    expect(msUntilUtcMidnight(new Date('2026-11-15T23:30:00Z'))).toBe(30 * 60 * 1000)
    expect(formatCountdown(19 * 3600e3 + 5 * 60e3)).toBe('19h 5m')
  })

  it('gives every player the same type, starters and challengers for a date', () => {
    const date = '2026-11-15'
    expect(dailyType(date)).toBe(dailyType(date))
    expect(strip(starterCandidates(dailyType(date), dailyRng(date, 'starters'))))
      .toEqual(strip(starterCandidates(dailyType(date), dailyRng(date, 'starters'))))
    for (const i of [0, 7, 30]) {
      expect(strip(buildDailyChallenger(i, dailyRng(date, `challenger:${i}`))))
        .toEqual(strip(buildDailyChallenger(i, dailyRng(date, `challenger:${i}`))))
    }
  })

  it('rotates through gym types across days', () => {
    const types = new Set(Array.from({ length: 60 }, (_, d) => dailyType(utcDate(new Date(Date.UTC(2026, 0, 1 + d))))))
    expect(types.size).toBeGreaterThan(10)
    for (const t of types) expect(GYM_TYPES).toContain(t)
  })

  it('daily starters match the daily type', () => {
    const date = '2026-11-15'
    const type = dailyType(date)
    for (const m of starterCandidates(type, dailyRng(date, 'starters'))) {
      expect(DEX.species[m.species].types.map(t => t.toLowerCase())).toContain(type)
    }
  })

  it('is endless with challengers getting stronger each round', () => {
    expect(dailyChallengerLevel(0)).toBeLessThan(dailyChallengerLevel(5))
    expect(dailyChallengerLevel(200)).toBe(100)
    const late = buildDailyChallenger(40, dailyRng('2026-11-15', 'challenger:40'))
    expect(late).toHaveLength(3)
    expect(late.every(m => m.level === 100)).toBe(true)
  })
})

describe('Gym Quest', () => {
  it('has 15 challengers ending with the Champion', () => {
    expect(GYM_QUEST_LENGTH).toBe(15)
    expect(questChallengerTitle(0)).toBe('Rookie')
    expect(questChallengerTitle(13)).toBe('Elite Four Member')
    expect(questChallengerTitle(14)).toBe('Champion')
  })
})
