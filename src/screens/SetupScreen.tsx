import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { GYM_TYPES } from '../lib/daily'
import { LEADER_SPRITE, gymName, trainerSprite } from '../lib/trainers'
import { WEAK_TO } from '../lib/typechart'
import { ScreenHeader } from '../components/ScreenHeader'
import { ArenaBackdrop } from '../components/ArenaBackdrop'
import { TypeBadge } from '../components/TypeBadge'

export function SetupScreen() {
  const startQuest = useRunStore(s => s.startQuest)
  const go = useUiStore(s => s.go)

  return (
    <div className="home-bg min-h-screen text-white">
      <ScreenHeader title="Gym Quest" sub="Choose the Gym you’ll lead. You defend it against 15 challengers, from rookies to the Champion." />
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {GYM_TYPES.map(type => (
          <button
            key={type}
            onClick={() => { startQuest(type); go('run') }}
            className="group text-left rounded-xl bg-ink-900 border-2 border-black overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-transform"
          >
            <ArenaBackdrop type={type} className="h-24">
              <img
                src={trainerSprite(LEADER_SPRITE[type])}
                alt=""
                loading="lazy"
                className="absolute left-1/2 -translate-x-1/2 bottom-0 h-24 [image-rendering:pixelated]"
              />
            </ArenaBackdrop>
            <div className="p-2.5 flex flex-col gap-1.5">
              <span className="font-ui font-bold text-base leading-tight">{gymName(type)}</span>
              <span className="self-start"><TypeBadge type={type} /></span>
              <span className="text-[11px] text-white/65 flex flex-wrap items-center gap-1">
                Weak to {WEAK_TO[type].map(w => <TypeBadge key={w} type={w} small />)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
