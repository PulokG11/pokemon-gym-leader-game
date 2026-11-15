import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GymType, RosterMember, RunState } from '../types/game'
import {
  GYM_QUEST_LENGTH, buildChallenger, buildDailyChallenger, gainXp, starterCandidates, xpReward,
} from '../lib/progression'
import { dailyRng, dailyType, utcDate } from '../lib/daily'
import { useRecordsStore } from './recordsStore'

interface RunStore {
  run: RunState | null
  startQuest: (gymType: GymType) => void
  /** Starts today's Daily Challenge; returns false if today's try is already used. */
  startDaily: () => boolean
  confirmTeam: (uids: string[]) => void
  winBattle: () => void
  loseBattle: (forfeited?: boolean) => void
  markBattleOpen: (key: string) => void
  continueRun: () => void
  clearRun: () => void
}

function baseRun(gymType: GymType): RunState {
  return {
    id: crypto.randomUUID(),
    mode: 'quest',
    gymType,
    dailyDate: null,
    challengerIndex: 0,
    totalChallengers: GYM_QUEST_LENGTH,
    candidates: [],
    roster: [],
    challenger: [],
    lastProgress: [],
    won: false,
    funds: 0,
    phase: 'team_select',
    rank: 1,
    rulesVersion: '1.2',
    schemaVersion: 3,
  }
}

function nextChallenger(run: RunState, roster: RosterMember[], index: number): RosterMember[] {
  return run.mode === 'daily' && run.dailyDate
    ? buildDailyChallenger(index, dailyRng(run.dailyDate, `challenger:${index}`))
    : buildChallenger(roster, index)
}

function recordResult(run: RunState, wins: number, finished: boolean, cleared: boolean) {
  const records = useRecordsStore.getState()
  if (run.mode === 'daily' && run.dailyDate) {
    records.recordDaily({ date: run.dailyDate, gymType: run.gymType, wins, finished })
  } else if (finished) {
    records.recordQuest({ gymType: run.gymType, wins, cleared, finishedAt: new Date().toISOString() })
  }
}

export const useRunStore = create<RunStore>()(
  persist(
    (set, get) => ({
      run: null,

      startQuest: (gymType) =>
        set({ run: { ...baseRun(gymType), candidates: starterCandidates(gymType) } }),

      startDaily: () => {
        const date = utcDate()
        if (useRecordsStore.getState().daily[date]) return false
        const gymType = dailyType(date)
        const run: RunState = {
          ...baseRun(gymType),
          mode: 'daily',
          dailyDate: date,
          totalChallengers: null,
          candidates: starterCandidates(gymType, dailyRng(date, 'starters')),
        }
        recordResult(run, 0, false, false) // entering uses today's one try
        set({ run })
        return true
      },

      confirmTeam: (uids) =>
        set(({ run }) => {
          if (!run) return {}
          const roster = uids.map(u => run.candidates.find(c => c.uid === u)!).filter(Boolean)
          return { run: { ...run, roster, challenger: nextChallenger(run, roster, 0), phase: 'battle' } }
        }),

      winBattle: () => {
        const run = get().run
        if (!run) return
        const xp = xpReward(run.challenger)
        const lastProgress = run.roster.map(m => gainXp(m, xp))
        const roster = lastProgress.map(r => r.after)
        const wins = run.challengerIndex + 1
        const cleared = run.totalChallengers !== null && wins >= run.totalChallengers
        recordResult(run, wins, cleared, cleared)
        set({
          run: cleared
            ? { ...run, roster, lastProgress, challengerIndex: wins, won: true, battleKey: null, phase: 'run_ended' }
            : {
                ...run, roster, lastProgress, challengerIndex: wins, battleKey: null,
                challenger: nextChallenger(run, roster, wins), phase: 'reward_pending',
              },
        })
      },

      loseBattle: (forfeited = false) => {
        const run = get().run
        if (!run) return
        recordResult(run, run.challengerIndex, true, false)
        set({ run: { ...run, won: false, forfeited, battleKey: null, phase: 'run_ended' } })
      },

      markBattleOpen: (key) => set(({ run }) => (run ? { run: { ...run, battleKey: key } } : {})),

      continueRun: () => set(({ run }) => (run ? { run: { ...run, phase: 'battle' } } : {})),

      clearRun: () => set({ run: null }),
    }),
    {
      name: 'gym-run-v2',
      version: 1,
      migrate: (persisted: any) => {
        const run = persisted?.run
        if (run && run.mode !== 'daily') {
          run.mode = 'quest'
          run.dailyDate = null
        }
        return persisted
      },
    }
  )
)
