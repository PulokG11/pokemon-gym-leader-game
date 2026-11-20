import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { builtTotal, isDone, isWin, keepStat, newRound, nextRoll, skipRoll, type LegendRound, type StatKey } from '../lib/legendary'

export interface LegendRecord { plays: number; wins: number; streak: number; bestStreak: number; bestTotal: number }

interface LegendStore {
  round: LegendRound | null
  /** Set once the finished round has been counted, so a reload doesn't count it twice. */
  counted: boolean
  record: LegendRecord
  /** Starts a round, or keeps the one in progress (a reload can't swap the legendary). */
  start: () => void
  newGame: () => void
  keep: (stat: StatKey) => void
  next: () => void
  skip: () => void
}

const EMPTY: LegendRecord = { plays: 0, wins: 0, streak: 0, bestStreak: 0, bestTotal: 0 }

function count(record: LegendRecord, round: LegendRound): LegendRecord {
  const won = isWin(round)
  const streak = won ? record.streak + 1 : 0
  return {
    plays: record.plays + 1,
    wins: record.wins + (won ? 1 : 0),
    streak,
    bestStreak: Math.max(record.bestStreak, streak),
    bestTotal: Math.max(record.bestTotal, builtTotal(round)),
  }
}

export const useLegendStore = create<LegendStore>()(
  persist(
    (set, get) => ({
      round: null,
      counted: false,
      record: EMPTY,
      start: () => { if (!get().round) set({ round: newRound(), counted: false }) },
      newGame: () => {
        const { round, counted } = get()
        // Leaving an unfinished round counts as a loss, so a bad legendary can't be dodged for free.
        if (round && !counted) set(s => ({ record: count(s.record, round) }))
        set({ round: newRound(), counted: false })
      },
      keep: (stat) => set(s => (s.round ? { round: keepStat(s.round, stat) } : {})),
      next: () => {
        const { round, counted, record } = get()
        if (!round) return
        const after = nextRoll(round)
        if (isDone(after) && !after.roll && !counted) set({ round: after, counted: true, record: count(record, after) })
        else set({ round: after })
      },
      skip: () => set(s => (s.round ? { round: skipRoll(s.round) } : {})),
    }),
    { name: 'gym-legend-v1' },
  ),
)

