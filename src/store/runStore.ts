import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GymType, RunState } from '../types/game'
import { buildChallenger, gainXp, starterCandidates, xpReward } from '../lib/progression'

interface RunStore {
  run: RunState | null
  startRun: (gymType: GymType) => void
  confirmTeam: (uids: string[]) => void
  winBattle: () => void
  loseBattle: () => void
  continueRun: () => void
  clearRun: () => void
}

function newRun(gymType: GymType): RunState {
  return {
    id: crypto.randomUUID(),
    mode: 'standard',
    gymType,
    challengerIndex: 0,
    totalChallengers: 5,
    candidates: starterCandidates(gymType),
    roster: [],
    challenger: [],
    lastProgress: [],
    won: false,
    funds: 0,
    phase: 'team_select',
    rank: 1,
    rulesVersion: '1.1',
    schemaVersion: 2,
  }
}

export const useRunStore = create<RunStore>()(
  persist(
    (set) => ({
      run: null,

      startRun: (gymType) => set({ run: newRun(gymType) }),

      confirmTeam: (uids) =>
        set(({ run }) => {
          if (!run) return {}
          const roster = uids.map(u => run.candidates.find(c => c.uid === u)!).filter(Boolean)
          return { run: { ...run, roster, challenger: buildChallenger(roster, 0), phase: 'battle' } }
        }),

      winBattle: () =>
        set(({ run }) => {
          if (!run) return {}
          const xp = xpReward(run.challenger)
          const lastProgress = run.roster.map(m => gainXp(m, xp))
          const roster = lastProgress.map(r => r.after)
          const next = run.challengerIndex + 1
          if (next >= run.totalChallengers) {
            return { run: { ...run, roster, lastProgress, challengerIndex: next, won: true, phase: 'run_ended' } }
          }
          return {
            run: {
              ...run, roster, lastProgress, challengerIndex: next,
              challenger: buildChallenger(roster, next), phase: 'reward_pending',
            },
          }
        }),

      loseBattle: () => set(({ run }) => (run ? { run: { ...run, won: false, phase: 'run_ended' } } : {})),

      continueRun: () => set(({ run }) => (run ? { run: { ...run, phase: 'battle' } } : {})),

      clearRun: () => set({ run: null }),
    }),
    { name: 'gym-run-v2' }
  )
)
