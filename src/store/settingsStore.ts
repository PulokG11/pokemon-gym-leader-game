import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BattleSpeed = 1 | 2 | 3
export type Effects = 'full' | 'simple'

interface SettingsStore {
  speed: BattleSpeed
  effects: Effects
  introDismissed: boolean
  setSpeed: (speed: BattleSpeed) => void
  setEffects: (effects: Effects) => void
  dismissIntro: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      speed: 1,
      effects: 'full',
      introDismissed: false,
      setSpeed: (speed) => set({ speed }),
      setEffects: (effects) => set({ effects }),
      dismissIntro: () => set({ introDismissed: true }),
    }),
    { name: 'gym-settings-v1' }
  )
)
