import { move } from '../lib/dex'
import { TypeBadge } from './TypeBadge'

const CATEGORY_ICON = { Physical: '💥', Special: '🌀', Status: '✨' } as const

/** One move with type, category, power, accuracy, PP, priority and effect. */
export function MoveInfo({ id }: { id: string }) {
  const m = move(id)
  if (!m) return null
  return (
    <div className="bg-slate-800/70 rounded-md px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-sm">{m.name}</span>
        <TypeBadge type={m.type} small />
        <span className="text-xs" title={m.category}>{CATEGORY_ICON[m.category]}</span>
        {m.priority !== 0 && (
          <span className="text-[10px] font-bold text-amber-300 bg-amber-900/50 rounded px-1">
            Priority {m.priority > 0 ? '+' : ''}{m.priority}
          </span>
        )}
      </div>
      <div className="text-[11px] text-slate-400 tabular-nums mt-0.5">
        Pow {m.power || '—'} · Acc {m.accuracy === true ? '—' : `${m.accuracy}%`} · PP {m.pp}
      </div>
      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{m.desc}</p>
    </div>
  )
}
