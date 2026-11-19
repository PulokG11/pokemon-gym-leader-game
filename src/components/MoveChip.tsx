import { move } from '../lib/dex'
import { TYPE_COLORS } from '../lib/typeColors'
import type { GymType } from '../types/game'

/** A compact move: type dot and name. */
export function MoveChip({ id, className = '' }: { id: string; className?: string }) {
  const d = move(id)
  const t = (d?.type ?? 'Normal').toLowerCase() as GymType
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs font-bold ${className}`} title={d ? `${d.type} · ${d.category}${d.power ? ` · ${d.power}` : ''}` : undefined}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_COLORS[t]?.bg ?? 'bg-stone-500'}`} aria-hidden="true" />
      {d?.name ?? id}
    </span>
  )
}
