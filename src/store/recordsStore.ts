import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GymType } from '../types/game'

export interface DailyResult {
  date: string
  gymType: GymType
  wins: number
  finished: boolean
}

export interface QuestResult {
  gymType: GymType
  wins: number
  cleared: boolean
  finishedAt: string
}

interface RecordsStore {
  daily: Record<string, DailyResult>
  quests: QuestResult[]
  recordDaily: (r: DailyResult) => void
  recordQuest: (r: QuestResult) => void
}

/** Results kept on this device. */
export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      daily: {},
      quests: [],
      recordDaily: (r) => set(s => ({ daily: { ...s.daily, [r.date]: r } })),
      recordQuest: (r) => set(s => ({ quests: [r, ...s.quests].slice(0, 50) })),
    }),
    { name: 'gym-records-v1' }
  )
)
