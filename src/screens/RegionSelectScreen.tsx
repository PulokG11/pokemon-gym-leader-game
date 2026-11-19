import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { REGIONS, REGION_LIST, type RegionId } from '../lib/regions'
import { trainerSprite } from '../lib/trainers'
import { ScreenHeader } from '../components/ScreenHeader'
import { ArenaBackdrop } from '../components/ArenaBackdrop'

export function RegionSelectScreen() {
  const startRegional = useRunStore(s => s.startRegional)
  const go = useUiStore(s => s.go)

  function start(id: RegionId) {
    startRegional(id)
    go('run')
  }

  return (
    <div className="home-bg min-h-screen text-white">
      <ScreenHeader
        title="Regional Quest"
        sub="Pick a starter, earn all 8 badges, beat the Elite Four and the Champion. Catch a new Pokémon after every win."
      />
      <div className="max-w-5xl mx-auto px-4 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REGION_LIST.map(r => {
          const region = r.available ? REGIONS[r.id as RegionId] : null
          if (!region) {
            return (
              <div key={r.id} aria-disabled="true" className="rounded-xl bg-ink-900/70 border-2 border-dashed border-white/20 px-4 py-5 flex items-center justify-between text-white/55">
                <span className="font-ui font-bold text-lg">{r.name}</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 rounded px-2 py-1">Coming soon</span>
              </div>
            )
          }
          const leaders = region.trainers.filter(t => t.title === 'Gym Leader')
          return (
            <button
              key={r.id}
              onClick={() => start(region.id)}
              className="sm:col-span-2 lg:col-span-3 text-left rounded-xl bg-ink-900 border-2 border-gold-400 overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-transform"
            >
              <ArenaBackdrop type="grass" className="h-32 sm:h-40">
                <div className="absolute inset-x-0 bottom-0 flex justify-center items-end gap-0 sm:gap-1 px-2">
                  {leaders.map(t => (
                    <img key={t.name} src={trainerSprite(t.sprite)} alt="" loading="lazy" className="h-16 sm:h-24 [image-rendering:pixelated] -mx-2 sm:mx-0" />
                  ))}
                </div>
              </ArenaBackdrop>
              <div className="p-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-ui font-bold text-2xl">{region.name}</span>
                <span className="text-sm text-white/70 flex-1 min-w-[14rem]">
                  {leaders.map(t => t.name).join(', ')}, then the Elite Four and Champion {region.trainers.at(-1)!.name}. {region.trainers.length} battles, 3 retries.
                </span>
                <span className="rounded-lg bg-gold-400 text-ink-900 border-2 border-black px-3 py-1.5 font-ui font-bold">Start ▶</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
