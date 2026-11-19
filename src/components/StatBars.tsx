import type { SpeciesData } from '../lib/dex'

const LABELS: [keyof SpeciesData['baseStats'], string][] = [
  ['hp', 'HP'], ['atk', 'Atk'], ['def', 'Def'], ['spa', 'SpA'], ['spd', 'SpD'], ['spe', 'Spe'],
]

export function StatBars({ stats }: { stats: SpeciesData['baseStats'] }) {
  return (
    <div className="grid grid-cols-[2rem_1.75rem_1fr] gap-x-1.5 gap-y-0.5 items-center text-[11px]">
      {LABELS.map(([key, label]) => (
        <div key={key} className="contents">
          <span className="text-white/65">{label}</span>
          <span className="tabular-nums text-right">{stats[key]}</span>
          <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${stats[key] >= 90 ? 'bg-emerald-400' : stats[key] >= 60 ? 'bg-sky-400' : 'bg-stone-500'}`}
              style={{ width: `${Math.min(100, (stats[key] / 150) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
