import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RunState } from '../types/game'

interface RunStore {
  run: RunState | null
  setRun: (run: RunState) => void
  patchRun: (patch: Partial<RunState>) => void
  clearRun: () => void
}

export const useRunStore = create<RunStore>()(
  persist(
    (set) => ({
      run: null,
      setRun: (run) => set({ run }),
      patchRun: (patch) =>
        set((s) => (s.run ? { run: { ...s.run, ...patch } } : {})),
      clearRun: () => set({ run: null }),
    }),
    { name: 'gym-run-v1' }
  )
)
