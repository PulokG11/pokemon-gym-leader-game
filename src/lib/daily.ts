import type { GymType } from '../types/game'
import type { Rng } from './progression'

export const GYM_TYPES: GymType[] = [
  'fire', 'water', 'grass', 'electric', 'ghost', 'dragon',
  'normal', 'ice', 'fighting', 'poison', 'ground', 'flying',
  'psychic', 'bug', 'rock', 'dark', 'steel', 'fairy',
]

/** Daily Challenge days roll over at midnight UTC for every player. */
export const utcDate = (now = new Date()) => now.toISOString().slice(0, 10)

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Deterministic PRNG (mulberry32): every player gets the same sequence for the same key. */
export function seededRng(key: string): Rng {
  let a = hash(key)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const dailyType = (date: string): GymType => GYM_TYPES[hash(`type:${date}`) % GYM_TYPES.length]

export const dailyRng = (date: string, salt: string) => seededRng(`daily:${date}:${salt}`)

export function msUntilUtcMidnight(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return next - now.getTime()
}

export function formatCountdown(ms: number): string {
  const mins = Math.max(0, Math.floor(ms / 60000))
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
