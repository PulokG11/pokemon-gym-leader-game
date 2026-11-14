import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileProgress } from '../types/game'

interface ProfileStore {
  profile: ProfileProgress
  setProfile: (profile: ProfileProgress) => void
  addReputation: (amount: number) => void
}

const defaultProfile: ProfileProgress = {
  reputation: 0,
  legacyRanks: {},
  unlockedTypes: ['fire', 'water', 'grass'],
  highestRank: 0,
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (profile) => set({ profile }),
      addReputation: (amount) =>
        set((s) => ({
          profile: { ...s.profile, reputation: s.profile.reputation + amount }
        })),
    }),
    { name: 'gym-profile-v1' }
  )
)
