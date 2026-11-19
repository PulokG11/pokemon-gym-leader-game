import { TYPE_COLORS, typeTextClass } from '../lib/typeColors'
import type { GymType } from '../types/game'

export function TypeBadge({ type, small }: { type: string; small?: boolean }) {
  const c = TYPE_COLORS[type.toLowerCase() as GymType]
  return (
    <span
      className={`${c?.bg ?? 'bg-ink-800'} ${c ? typeTextClass(type) : 'text-white'} font-bold uppercase tracking-wide rounded ${
        small ? 'text-[9px] px-1 py-px' : 'text-[10px] px-1.5 py-0.5'
      }`}
    >
      {type}
    </span>
  )
}
