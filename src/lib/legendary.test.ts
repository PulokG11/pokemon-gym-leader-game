import { describe, expect, it } from 'vitest'
import { DEX } from './dex'
import { seededRng } from './daily'
import { LEGEND_SKIPS, OPPONENTS, ROLL_POOL, STAT_KEYS, bst, builtTotal, isDone, isWin, keepStat, newRound, nextRoll, skipRoll } from './legendary'

describe('Legendary Conquerer', () => {
  it('opponents are legendaries, mythicals, Ultra Beasts and Tapus; rolls never are', () => {
    for (const id of ['mewtwo', 'mew', 'tapukoko', 'nihilego', 'zacian']) expect(DEX.legendaries).toContain(id)
    expect(DEX.legendaries).not.toContain('garchomp')
    expect(ROLL_POOL.some(id => DEX.legendaries.includes(id))).toBe(false)
    expect(ROLL_POOL.length).toBeGreaterThan(800)
    for (const id of ['cosmog', 'cosmoem', 'kubfu', 'poipole', 'meltan', 'phione']) expect(OPPONENTS).not.toContain(id)
    expect(OPPONENTS).toContain('solgaleo')
    expect(Math.min(...OPPONENTS.map(bst))).toBeGreaterThanOrEqual(500)
  })

  it('plays a full round: 6 kept stats, totals and the win rule', () => {
    let r = newRound(seededRng('round'))
    expect(OPPONENTS).toContain(r.legend)
    expect(r.skips).toBe(LEGEND_SKIPS)
    for (const k of STAT_KEYS) {
      const rolled = r.roll!
      r = keepStat(r, k)
      expect(r.picks[k]).toEqual({ species: rolled, value: DEX.species[rolled].baseStats[k] })
      expect(keepStat(r, 'hp')).toBe(r) // one stat per roll
      r = nextRoll(r, seededRng(k))
    }
    expect(isDone(r)).toBe(true)
    expect(r.roll).toBeNull()
    expect(builtTotal(r)).toBe(STAT_KEYS.reduce((t, k) => t + r.picks[k]!.value, 0))
    expect(isWin(r)).toBe(builtTotal(r) > bst(r.legend))
    expect(new Set(r.seen).size).toBe(r.seen.length)
  })

  it('a stat can only be filled once', () => {
    let r = keepStat(newRound(seededRng('a')), 'atk')
    r = nextRoll(r, seededRng('b'))
    expect(keepStat(r, 'atk')).toBe(r)
  })

  it('2 skips per round, only before keeping a stat', () => {
    let r = newRound(seededRng('s'))
    const first = r.roll
    r = skipRoll(r, seededRng('s1'))
    expect(r.roll).not.toBe(first)
    r = skipRoll(r, seededRng('s2'))
    expect(r.skips).toBe(0)
    expect(skipRoll(r, seededRng('s3'))).toBe(r)
    const kept = keepStat({ ...r, skips: 1 }, 'hp')
    expect(skipRoll(kept, seededRng('s4'))).toBe(kept)
  })

  it('a tie is not a win', () => {
    const r = newRound(seededRng('tie'))
    const target = bst(r.legend)
    const picks = Object.fromEntries(STAT_KEYS.map((k, i) => [k, { species: 'pikachu', value: i === 0 ? target - 500 : 100 }]))
    expect(isWin({ ...r, picks, roll: null })).toBe(false)
    expect(isWin({ ...r, picks: { ...picks, hp: { species: 'pikachu', value: target - 499 } }, roll: null })).toBe(true)
  })
  it('a retry keeps the legendary with fresh rolls and skips', () => {
    const r = newRound(seededRng('x'))
    const again = newRound(seededRng('y'), r.legend)
    expect(again.legend).toBe(r.legend)
    expect(again.skips).toBe(LEGEND_SKIPS)
    expect(again.picks).toEqual({})
  })
})
