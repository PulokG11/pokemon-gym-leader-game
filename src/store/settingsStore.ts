import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BattleSpeed = 1 | 2 | 3
export type Effects = 'full' | 'simple'

interface SettingsStore {
  speed: BattleSpeed
  effects: Effects
  setSpeed: (speed: BattleSpeed) => void
  setEffects: (effects: Effects) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      speed: 1,
      effects: 'full',
      setSpeed: (speed) => set({ speed }),
      setEffects: (effects) => set({ effects }),
    }),
    { name: 'gym-settings-v1' }
  )
)
