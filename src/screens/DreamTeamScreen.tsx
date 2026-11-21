import { useEffect, useState } from 'react'
import { nextRegionOf, useDreamStore } from '../store/dreamStore'
import { useUiStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import { artworkUrl, species } from '../lib/dex'
import { DT_ROLLS, DT_SKIPS, DT_TEAM, draftDone, finalForm } from '../lib/dreamTeam'
import { DT_BEST_OF, type DreamResult } from '../lib/dreamSim'
import { REGIONS, REGION_LIST, trainerTitleName, type Region, type RegionId } from '../lib/regions'
import { trainerSprite } from '../lib/trainers'
import { TypeBadge } from '../components/TypeBadge'
import { ArenaBackdrop } from '../components/ArenaBackdrop'

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_5px_0_rgba(0,0,0,0.35)]'
const bst = (id: string) => Object.values(species(id).baseStats).reduce((a, b) => a + b, 0)

function RegionPicker() {
  const start = useDreamStore(s => s.start)
  const records = useDreamStore(s => s.records)
  const go = useUiStore(s => s.go)
  return (
    <div className="home-bg min-h-screen text-white font-sans px-3 sm:px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-3">
        <header className={`${panel} px-4 py-3 flex items-center gap-3`}>
          <button onClick={() => go('home')} aria-label="Home" className="w-10 h-10 shrink-0 rounded-lg bg-white/10 hover:bg-white/15 text-lg">☰</button>
          <div className="min-w-0">
            <h1 className="font-ui font-bold text-lg sm:text-2xl">Dream Team Builder</h1>
            <p className="text-xs text-white/65">Choose the region you want to conquer. Draft 6 Pokémon, then see how far they get.</p>
          </div>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REGION_LIST.map(r => {
            const region = REGIONS[r.id as RegionId]
            const champion = region.trainers.at(-1)!
            const rec = records[region.id]
            return (
              <button key={r.id} onClick={() => start(region.id)} className="text-left rounded-xl bg-ink-900 border-2 border-black hover:border-gold-400 overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-transform">
                <ArenaBackdrop type={region.trainers[0].type} className="h-24">
                  <img src={trainerSprite(region.trainers[0].sprite)} alt="" loading="lazy" className="absolute left-[8%] bottom-0 h-20 [image-rendering:pixelated]" />
                  <img src={trainerSprite(champion.sprite)} alt="" loading="lazy" className="absolute right-[8%] bottom-0 h-20 [image-rendering:pixelated] -scale-x-100" />
                </ArenaBackdrop>
                <div className="p-3">
                  <p className="font-ui font-bold text-xl">{region.name}</p>
                  <p className="text-xs text-white/60">{region.trainers[0].name} first · {trainerTitleName(champion)} last</p>
                  <p className="text-xs text-gold-300 mt-1">
                    {rec ? `Best: ${rec.bestBadges}/13 · ${rec.champions} ${rec.champions === 1 ? 'title' : 'titles'} in ${rec.plays} ${rec.plays === 1 ? 'try' : 'tries'}` : 'Not tried yet'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** The 13 opponents; beaten ones light up one after another once the result is in. */
function Track({ region, result, animate }: { region: Region; result: DreamResult | null; animate: boolean }) {
  return (
    <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${region.trainers.length}, minmax(0, 1fr))` }} aria-label="Gym Leaders, Elite Four and Champion">
      {region.trainers.map((t, i) => {
        const b = result?.battles[i]
        const state = !b ? 'todo' : b.won ? 'won' : 'lost'
        return (
          <li
            key={i}
            title={`${trainerTitleName(t)}${b ? (b.won ? ' — beaten' : ' — lost') : ''}`}
            className={`relative aspect-square rounded-md border-2 grid place-items-center overflow-hidden ${
              state === 'won' ? 'border-gold-400 bg-gold-400/20' : state === 'lost' ? 'border-red-500 bg-red-900/40' : 'border-black bg-white/15'
            } ${i >= 8 ? 'ring-1 ring-fuchsia-400/40' : ''}`}
            style={animate && b ? { animation: 'rise 0.4s ease-out both', animationDelay: `${i * 0.18}s` } : undefined}
          >
            <img src={trainerSprite(t.sprite)} alt="" loading="lazy" className={`h-full object-contain [image-rendering:pixelated] ${state === 'won' ? '' : 'grayscale opacity-75'}`} />
            {state === 'lost' && <span className="absolute inset-0 grid place-items-center text-red-300 font-black text-lg">✕</span>}
          </li>
        )
      })}
    </ol>
  )
}

function Results({ region, result }: { region: Region; result: DreamResult }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {result.battles.map(b => {
        const t = region.trainers[b.index]
        return (
          <li key={b.index} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm ${b.won ? 'border-emerald-400/40 bg-emerald-900/20' : 'border-red-500/50 bg-red-900/30'}`}>
            <img src={trainerSprite(t.sprite)} alt="" className="h-8 [image-rendering:pixelated]" />
            <span className="flex-1 min-w-0 truncate"><b>{trainerTitleName(t)}</b> <span className="text-white/55 text-xs">{t.badge ?? t.title}</span></span>
            <span className={`font-black tabular-nums ${b.won ? 'text-emerald-300' : 'text-red-300'}`}>{b.won ? '✓' : '✕'} {b.wins}–{b.losses}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function DreamTeamScreen() {
  const { draft, result, records, pick, skip, finish, retry, nextRegion, leave } = useDreamStore()
  const go = useUiStore(s => s.go)
  const effects = useSettingsStore(s => s.effects)
  const [error, setError] = useState<string | null>(null)
  const done = !!draft && draftDone(draft)

  // Once 6 are drafted, simulate the region in a worker.
  useEffect(() => {
    if (!draft || !done || result) return
    setError(null)
    const worker = new Worker(new URL('../workers/dreamteam.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<{ ok: boolean; result?: DreamResult; message?: string }>) => {
      if (e.data.ok && e.data.result) finish(e.data.result)
      else setError(e.data.message ?? 'The simulation failed.')
      worker.terminate()
    }
    worker.postMessage({ region: draft.region, picks: draft.picks })
    return () => worker.terminate()
  }, [draft, done, result, finish])

  if (!draft) return <RegionPicker />
  const region = REGIONS[draft.region]
  const noun = region.badgeNoun ?? 'badge'
  const badges = result ? Math.min(result.beaten, 8) : 0
  const next = REGIONS[nextRegionOf(draft.region)]
  const rec = records[draft.region]

  function home() {
    if (!done && draft!.picks.length > 0 && !confirm('Leave this draft? Your picks will be lost.')) return
    leave()
    go('home')
  }

  return (
    <div className="home-bg min-h-screen text-white font-sans px-3 sm:px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-3">
        <header className={`${panel} px-3 sm:px-4 py-3 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <button onClick={home} aria-label="Home" className="w-10 h-10 shrink-0 rounded-lg bg-white/10 hover:bg-white/15 text-lg">☰</button>
            <div className="flex-1 min-w-0">
              <h1 className="font-ui font-bold text-lg sm:text-2xl truncate">Dream Team · {region.name}</h1>
              <p className="text-[11px] sm:text-xs text-white/60">
                {done ? 'Team complete' : `Roll ${draft.rolls} of ${DT_ROLLS} · pick ${draft.picks.length + 1} of ${DT_TEAM}`}
                {rec ? ` · best ${rec.bestBadges}/13` : ''}
              </p>
            </div>
            {!done && (
              <button onClick={skip} disabled={draft.skips <= 0} className="shrink-0 rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black px-2.5 py-1.5 text-xs font-bold disabled:opacity-40">
                Skip roll ({draft.skips}/{DT_SKIPS})
              </button>
            )}
          </div>
          <Track region={region} result={result} animate={effects === 'full'} />
        </header>

        {/* Team */}
        <section className={`${panel} p-3`} aria-label="Your team">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Array.from({ length: DT_TEAM }, (_, i) => draft.picks[i]).map((id, i) => (
              <div key={i} className={`rounded-lg border-2 h-24 flex flex-col items-center justify-center ${id ? 'border-black bg-black/25' : 'border-dashed border-white/15'}`}>
                {id ? (
                  <>
                    <img src={artworkUrl(id)} alt="" className="h-14 object-contain" />
                    <span className="text-[11px] font-bold truncate max-w-full px-1">{species(id).name}</span>
                    {finalForm(id) !== id && <span className="text-[10px] text-white/55">→ {species(finalForm(id)).name}</span>}
                  </>
                ) : (
                  <span className="text-xs text-white/30">{i + 1}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {!done && (
          <section aria-label="Choose one" className="flex flex-col gap-2">
            <p className="text-sm text-white/90">Choose one. Each battles as its final evolution at the opponent’s level.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {draft.options.map(id => {
                const s = species(id)
                const fin = finalForm(id)
                return (
                  <button key={id} onClick={() => pick(id)} className={`${panel} p-2.5 text-left hover:border-gold-400 hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 sm:gap-2`}>
                    <img src={artworkUrl(id)} alt="" className="w-11 h-11 sm:w-20 sm:h-20 object-contain shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-bold text-sm sm:text-base leading-tight break-words">{s.name}</span>
                      <span className="flex flex-wrap gap-1 my-0.5">{species(fin).types.map(t => <TypeBadge key={t} type={t} small />)}</span>
                      <span className="block text-[11px] text-white/65">{fin !== id ? `→ ${species(fin).name} · ` : ''}BST {bst(fin)}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {done && !result && (
          <section className={`${panel} p-4 text-center`} role="status">
            {error ? (
              <p className="text-red-300">{error}</p>
            ) : (
              <>
                <p className="font-ui font-bold text-lg animate-pulse">Simulating {region.name}…</p>
                <p className="text-xs text-white/60 mt-1">Your team takes on all 13 opponents, best of {DT_BEST_OF} each.</p>
              </>
            )}
          </section>
        )}

        {result && (
          <section className={`${panel} p-4 flex flex-col gap-3 ${result.champion ? 'border-t-8 border-t-gold-400' : 'border-t-8 border-t-red-500'}`} role="status">
            <div className="text-center">
              <h2 className={`pixel-title text-2xl ${result.champion ? 'text-gold-400' : 'text-white'}`}>
                {result.champion ? `${region.name} Champion!` : result.beaten <= 8 ? `${badges} ${noun}${badges === 1 ? '' : 's'}` : result.beaten < 12 ? `8 ${noun}s · ${result.beaten - 8}/4 Elite Four` : 'Elite Four cleared'}
              </h2>
              <p className="text-sm text-white/75 mt-1">
                {result.champion
                  ? 'Your dream team beat every Gym, the Elite Four and the Champion.'
                  : `Your team beat ${result.beaten} of ${region.trainers.length} opponents and fell to ${trainerTitleName(region.trainers[result.beaten])}.`}
              </p>
            </div>
            <Results region={region} result={result} />
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={home} className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 font-bold text-sm">Home</button>
              <button onClick={retry} className="rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black px-4 py-2 font-bold text-sm">↻ Retry {region.name}</button>
              <button onClick={nextRegion} className="rounded-lg bg-gold-400 text-ink-900 hover:bg-gold-300 border-2 border-black px-4 py-2 font-black text-sm">Next region: {next.name} ▶</button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
