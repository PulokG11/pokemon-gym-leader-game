import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { battleSpriteUrl, species } from '../lib/dex'
import { regionOf } from '../lib/regions'
import { trainerSprite } from '../lib/trainers'
import { PokemonCard, PokemonDetails } from '../components/PokemonCard'
import { TypeBadge } from '../components/TypeBadge'

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.35)]'

/** Regional Quest setup: choose a starter, then as many companions as the first Leader has Pokémon, minus one. */
export function RegionalDraftScreen() {
  const run = useRunStore(s => s.run)!
  const { confirmRegionalTeam, clearRun } = useRunStore()
  const go = useUiStore(s => s.go)
  const region = regionOf(run.region)
  const first = region.trainers[0]
  const need = first.team.length - 1
  const [starter, setStarter] = useState<string | null>(null)
  const [picks, setPicks] = useState<string[]>([])
  const [step, setStep] = useState<1 | 2>(1)
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const starters = run.candidates.filter(c => region.starters.includes(c.species))
  const pool = run.candidates.filter(c => !region.starters.includes(c.species))
  const starterMon = starters.find(s => s.uid === starter)
  const infoMon = run.candidates.find(c => c.uid === info)
  const team = [starterMon, ...picks.map(u => pool.find(p => p.uid === u))].filter(Boolean)

  function togglePick(uid: string) {
    setPicks(p => (p.includes(uid) ? p.filter(x => x !== uid) : p.length < need ? [...p, uid] : p))
  }

  function finish() {
    if (!starter) return
    const res = confirmRegionalTeam(starter, picks)
    if (!res.ok) setError(res.message)
  }

  return (
    <div className="home-bg min-h-screen text-white pb-28">
      <header className="bg-ink-900 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => (step === 2 ? setStep(1) : (clearRun(), go('region_select')))}
            className="rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black px-3 py-1.5 text-sm font-ui font-bold"
          >
            ◀ {step === 2 ? 'Starter' : 'Regions'}
          </button>
          <h1 className="font-ui font-bold text-2xl sm:text-3xl flex-1">
            {step === 1 ? 'Choose your starter' : `Choose ${need} more`}
          </h1>
          <span className="text-xs text-white/60">Step {step}/2</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3">
        <section className={`${panel} px-4 py-3 flex items-center gap-3`}>
          <img src={trainerSprite(first.sprite)} alt="" className="h-16 [image-rendering:pixelated]" />
          <div className="text-sm">
            <p className="font-ui font-bold text-base">First up: Leader {first.name}, {first.place}</p>
            <p className="flex flex-wrap items-center gap-1.5 mt-0.5 text-white/75">
              <TypeBadge type={first.type} /> {first.team.length} Pokémon, up to Lv {Math.max(...first.team.map(m => m.level))}
            </p>
          </div>
        </section>

        <p className="text-sm text-white/90">
          {step === 1
            ? `Your partner for the whole of ${region.name}. The Champion will pick the starter that beats yours.`
            : `Unevolved Pokémon found in ${region.name}. Your team will match ${first.name}'s ${first.team.length}.`}
        </p>

        <div className={`grid gap-3 ${step === 1 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {(step === 1 ? starters : pool).map(mon => {
            const order = step === 1 ? (starter === mon.uid ? 1 : 0) : picks.indexOf(mon.uid) + 1
            return (
              <PokemonCard
                key={mon.uid}
                mon={mon}
                order={order}
                full={step === 2 && order === 0 && picks.length >= need}
                onToggle={() => (step === 1 ? setStarter(mon.uid) : togglePick(mon.uid))}
                onDetails={() => setInfo(mon.uid)}
              />
            )
          })}
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-900/60 px-3 py-2 text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-ink-900 border-t-4 border-black px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!starter}
              className="flex-1 rounded-xl bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black py-3 font-ui font-bold text-lg shadow-[0_4px_0_#b8431a] disabled:opacity-50 disabled:shadow-none"
            >
              {starterMon ? `Next: ${need} companions ▶` : 'Pick a starter'}
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={picks.length !== need}
              className="flex-1 rounded-xl bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black py-3 font-ui font-bold text-lg shadow-[0_4px_0_#b8431a] disabled:opacity-50 disabled:shadow-none"
            >
              {picks.length === need ? 'Set out ▶' : `Pick ${need - picks.length} more`}
            </button>
          )}
          <div className="flex gap-1.5" aria-label="Your team">
            {Array.from({ length: need + 1 }, (_, i) => {
              const m = team[i]
              return (
                <span key={i} className={`w-12 h-12 rounded-lg grid place-items-center ${m ? 'bg-white/10 border-2 border-gold-400/60' : 'border-2 border-dashed border-white/25'}`}>
                  {m && <img src={battleSpriteUrl(m.species, false)} alt={species(m.species).name} className="w-10 h-10 object-contain [image-rendering:pixelated]" />}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {infoMon && (
        <PokemonDetails
          mon={infoMon}
          picked={infoMon.uid === starter || picks.includes(infoMon.uid)}
          canAdd={region.starters.includes(infoMon.species) ? true : picks.length < need}
          onToggle={() => (region.starters.includes(infoMon.species) ? setStarter(s => (s === infoMon.uid ? null : infoMon.uid)) : togglePick(infoMon.uid))}
          onClose={() => setInfo(null)}
        />
      )}
    </div>
  )
}
