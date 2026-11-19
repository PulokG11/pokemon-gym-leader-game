import { artworkUrl, move, species } from '../lib/dex'
import { xpForLevel } from '../lib/progression'
import { TypeBadge } from './TypeBadge'
import { useSettingsStore } from '../store/settingsStore'
import type { ProgressReport } from '../types/game'

export function ProgressCard({ report, delay = 0 }: { report: ProgressReport; delay?: number }) {
  const { before, after, xpGained, events } = report
  const simple = useSettingsStore(s => s.effects === 'simple')
  const evolved = events.find(e => e.kind === 'evolve')
  const animateEvo = evolved && !simple
  const s = species(after.species)
  const floor = xpForLevel(after.level)
  const ceil = xpForLevel(after.level + 1)
  const pct = Math.min(100, ((after.xp - floor) / (ceil - floor)) * 100)

  return (
    <div
      className={`rounded-2xl border bg-ink-900 p-4 flex gap-4 items-start animate-[rise_.5s_ease-out_both] ${
        evolved ? 'border-amber-400/70 shadow-[0_0_24px_rgba(251,191,36,0.25)]' : 'border-black'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative w-24 h-24 shrink-0">
        {animateEvo && (
          <img src={artworkUrl(before.species)} alt="" className="absolute inset-0 w-full h-full object-contain animate-[evo-out_1.6s_ease-in_both]" style={{ animationDelay: `${delay + 300}ms` }} />
        )}
        <img
          src={artworkUrl(after.species)}
          alt={s.name}
          className={`absolute inset-0 w-full h-full object-contain ${animateEvo ? 'animate-[evo-in_1.6s_ease-out_both]' : ''}`}
          style={animateEvo ? { animationDelay: `${delay + 300}ms` } : undefined}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-ui font-bold text-xl">{s.name}</span>
          <span className="text-sm tabular-nums">
            {before.level !== after.level ? (
              <><span className="text-white/50">Lv {before.level}</span> → <span className="text-emerald-300 font-semibold">Lv {after.level}</span></>
            ) : (
              <span className="text-white/80">Lv {after.level}</span>
            )}
          </span>
        </div>
        <div className="flex gap-1 mt-1">{s.types.map(t => <TypeBadge key={t} type={t} small />)}</div>

        <div className="mt-2">
          <div className="flex justify-between text-[11px] text-white/65">
            <span>+{xpGained.toLocaleString()} XP</span>
            <span className="tabular-nums">{(ceil - after.xp).toLocaleString()} to Lv {after.level + 1}</span>
          </div>
          <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden mt-0.5">
            <div className="h-full bg-sky-400 rounded-full transition-[width] duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ul className="mt-2 space-y-0.5 text-sm">
          {events.map((e, i) =>
            e.kind === 'evolve' ? (
              <li key={i} className="text-amber-300 font-semibold">
                {species(e.from).name} evolved into {species(e.to).name}!
              </li>
            ) : e.kind === 'learn' ? (
              <li key={i} className="text-sky-300">
                Learned {move(e.move)?.name ?? e.move}
                {e.forgot && <span className="text-white/50"> (forgot {move(e.forgot)?.name ?? e.forgot})</span>}
              </li>
            ) : null,
          )}
          {!events.length && <li className="text-white/50 text-xs">No level-up this time.</li>}
        </ul>
        {evolved && (
          <p className="text-[11px] text-white/65 mt-1">
            Base stat total {Object.values(species(before.species).baseStats).reduce((a, b) => a + b, 0)} →{' '}
            <span className="text-emerald-300">{Object.values(s.baseStats).reduce((a, b) => a + b, 0)}</span>
          </p>
        )}
      </div>
    </div>
  )
}
