import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { newDraft, pickOption, skipRoll, type DreamDraft } from '../lib/dreamTeam'
import type { DreamResult } from '../lib/dreamSim'
import { REGION_LIST, type RegionId } from '../lib/regions'

export interface DreamRecord { plays: number; champions: number; bestBadges: number }

interface DreamStore {
  draft: DreamDraft | null
  result: DreamResult | null
  records: Partial<Record<RegionId, DreamRecord>>
  start: (region: RegionId) => void
  pick: (id: string) => void
  skip: () => void
  /** Saves the simulation's result and counts it in the region's record. */
  finish: (result: DreamResult) => void
  /** Same region, a new draft. */
  retry: () => void
  /** The next region in order, a new draft. */
  nextRegion: () => void
  /** Back to Home: the next visit starts with the region picker. */
  leave: () => void
}

export const nextRegionOf = (r: RegionId): RegionId => {
  const ids = REGION_LIST.map(x => x.id as RegionId)
  return ids[(ids.indexOf(r) + 1) % ids.length]
}

export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      draft: null,
      result: null,
      records: {},
      start: (region) => set({ draft: newDraft(region), result: null }),
      pick: (id) => set(s => (s.draft ? { draft: pickOption(s.draft, id) } : {})),
      skip: () => set(s => (s.draft ? { draft: skipRoll(s.draft) } : {})),
      finish: (result) => {
        const { draft, records, result: had } = get()
        if (!draft || had) return
        const r = records[draft.region] ?? { plays: 0, champions: 0, bestBadges: 0 }
        set({
          result,
          records: {
            ...records,
            [draft.region]: { plays: r.plays + 1, champions: r.champions + (result.champion ? 1 : 0), bestBadges: Math.max(r.bestBadges, result.beaten) },
          },
        })
      },
      retry: () => { const d = get().draft; if (d) get().start(d.region) },
      nextRegion: () => { const d = get().draft; if (d) get().start(nextRegionOf(d.region)) },
      leave: () => set({ draft: null, result: null }),
    }),
    { name: 'gym-dream-v1' },
  ),
)
