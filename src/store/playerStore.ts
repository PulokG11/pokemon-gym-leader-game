import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SyncedResult { wins: number; finished: boolean }

interface PlayerStore {
  playerId: string | null
  token: string | null      // secret proving this device owns the nickname
  nickname: string | null
  declined: boolean         // chose to play the Daily without ranking
  synced: Record<string, SyncedResult>
  setPlayer: (playerId: string, token: string, nickname: string) => void
  setNickname: (nickname: string) => void
  decline: () => void
  markSynced: (date: string, r: SyncedResult) => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      playerId: null,
      token: null,
      nickname: null,
      declined: false,
      synced: {},
      setPlayer: (playerId, token, nickname) => set({ playerId, token, nickname, declined: false }),
      setNickname: (nickname) => set({ nickname }),
      decline: () => set({ declined: true }),
      markSynced: (date, r) => set(s => ({ synced: { ...s.synced, [date]: r } })),
    }),
    { name: 'gym-player-v1' }
  )
)
