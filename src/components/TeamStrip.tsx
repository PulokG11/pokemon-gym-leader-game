import { artworkUrl, species } from '../lib/dex'
import { MAX_TEAM } from '../lib/economy'
import type { RosterMember } from '../types/game'

const hpColor = (f: number) => (f > 0.5 ? 'bg-emerald-400' : f > 0.25 ? 'bg-yellow-400' : 'bg-red-500')

/** The team as a row of six slots: sprite, level and HP. Click a member to open it. */
export function TeamStrip({ roster, onSelect, levelUps }: {
  roster: RosterMember[]
  onSelect?: (uid: string) => void
  levelUps?: Record<string, boolean>
}) {
  const slots = Array.from({ length: MAX_TEAM }, (_, i) => roster[i])
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 rounded-xl bg-ink-900 border-2 border-black/50 p-3 shadow-[0_4px_0_rgba(0,0,0,0.35)]">
      {slots.map((m, i) => {
        if (!m) {
          return <div key={i} className="h-24 rounded-lg border border-dashed border-white/15 grid place-items-center text-[11px] text-white/30">Empty slot</div>
        }
        const hp = m.hp ?? 1
        return (
          <button
            key={m.uid}
            onClick={() => onSelect?.(m.uid)}
            className="h-24 rounded-lg hover:bg-white/5 flex flex-col items-center justify-end gap-1 pb-1.5 transition-colors"
            title={species(m.species).name}
          >
            <img src={artworkUrl(m.species)} alt={species(m.species).name} className={`h-14 object-contain ${hp <= 0 ? 'grayscale opacity-50' : ''}`} />
            <span className="text-[11px] font-extrabold text-gold-300 tabular-nums">
              {levelUps?.[m.uid] && '▲'}Lv {m.level}
            </span>
            <span className="w-16 h-1.5 rounded-full bg-black/60 overflow-hidden">
              <span className={`block h-full ${hpColor(hp)}`} style={{ width: `${Math.max(0, hp) * 100}%` }} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
