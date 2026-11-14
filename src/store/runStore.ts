import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GymType, RunState, RunPhase } from '../types/game'

interface RunStore {
  run: RunState | null
  startRun: (gymType: GymType) => void
  setPhase: (phase: RunPhase) => void
  advanceChallenger: () => void
  endRun: () => void
  clearRun: () => void
}

function newRun(gymType: GymType): RunState {
  return {
    id: crypto.randomUUID(),
    mode: 'standard',
    gymType,
    challengerIndex: 0,
    totalChallengers: 5,  // prototype: 5 challengers
    roster: [],
    funds: 0,
    phase: 'battle',
    rank: 1,
    rulesVersion: '1.0',
    schemaVersion: 1,
  }
}

export const useRunStore = create<RunStore>()(
  persist(
    (set) => ({
      run: null,

      startRun: (gymType) => set({ run: newRun(gymType) }),

      setPhase: (phase) =>
        set(s => s.run ? { run: { ...s.run, phase } } : s),

      advanceChallenger: () =>
        set(s => {
          if (!s.run) return s
          const next = s.run.challengerIndex + 1
          if (next >= s.run.totalChallengers) {
            return { run: { ...s.run, phase: 'run_ended', challengerIndex: next } }
          }
          return { run: { ...s.run, challengerIndex: next, phase: 'reward_pending' } }
        }),

      endRun: () =>
        set(s => s.run ? { run: { ...s.run, phase: 'run_ended' } } : s),

      clearRun: () => set({ run: null }),
    }),
    { name: 'gym-run-v1' }
  )
)
