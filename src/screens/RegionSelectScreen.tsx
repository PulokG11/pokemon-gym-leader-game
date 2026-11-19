import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { REGIONS, REGION_LIST, trainerTitleName, type RegionId } from '../lib/regions'
import { battleSpriteUrl, species } from '../lib/dex'
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
        sub="Pick a region and a starter, win 8 badges (or Alola's trials), beat the Elite Four and the Champion. Catch a new Pokémon after every win."
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
          const champion = region.trainers.at(-1)!
          const special = region.zCrystals ? 'Z-Crystals' : region.megaStones.length ? 'Mega Stones' : null
          return (
            <button
              key={r.id}
              onClick={() => start(region.id)}
              className="text-left rounded-xl bg-ink-900 border-2 border-black hover:border-gold-400 overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-transform flex flex-col"
            >
              <ArenaBackdrop type={region.trainers[0].type} className="h-28">
                <img src={trainerSprite(region.playerSprite)} alt="" loading="lazy" className="absolute left-[8%] bottom-0 h-24 [image-rendering:pixelated]" />
                <span className="absolute left-1/2 bottom-3 -translate-x-1/2 flex items-end">
                  {region.starters.map(id => <img key={id} src={battleSpriteUrl(id, false)} alt="" loading="lazy" className="h-12 [image-rendering:pixelated] -mx-1" />)}
                </span>
                <img src={trainerSprite(champion.sprite)} alt="" loading="lazy" className="absolute right-[8%] bottom-0 h-24 [image-rendering:pixelated] -scale-x-100" />
              </ArenaBackdrop>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-ui font-bold text-xl">{region.name}</span>
                  {special && <span className="text-[10px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 bg-fuchsia-500/25 text-fuchsia-100">{special}</span>}
                </span>
                <span className="text-xs text-white/70">
                  {region.starters.map(id => species(id).name).join(' · ')}
                </span>
                <span className="text-xs text-white/55">
                  {region.trainers[0].name} first · {trainerTitleName(champion)} last · 13 battles
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
