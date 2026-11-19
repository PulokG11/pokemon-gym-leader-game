import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { artworkUrl, battleSpriteUrl, species, type SpeciesData } from '../lib/dex'
import { gymName } from '../lib/trainers'
import { GYM_STRENGTH, gymWeakness, strongAgainst, weakTo } from '../lib/gymInfo'
import { teamSizeFor } from '../lib/progression'
import { TypeBadge } from '../components/TypeBadge'
import { Modal } from '../components/Modal'
import { MoveInfo } from '../components/MoveInfo'
import type { BattleFormat, RosterMember } from '../types/game'

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.35)]'

/** "Ivysaur (Lv 16) → Venusaur (Lv 32)" — follows the first evolution at each stage. */
function evolutionChain(id: string): string {
  const steps: string[] = []
  let cur = species(id)
  while (cur.evos[0]) {
    const e = cur.evos[0]
    steps.push(`${species(e.to).name} (Lv ${e.level})`)
    cur = species(e.to)
  }
  return steps.join(' → ')
}

const bst = (id: string) => Object.values(species(id).baseStats).reduce((x, y) => x + y, 0)

/** Next stage for the card: "Charmeleon · Lv 16", "Vaporeon +7 more · Lv 30" or "Final form". */
function evolvesInto(id: string): string {
  const evos = species(id).evos
  if (!evos.length) return 'Final form'
  const first = species(evos[0].to).name
  return `${first}${evos.length > 1 ? ` +${evos.length - 1} more` : ''} · Lv ${evos[0].level}`
}

const STAT_ROWS: [keyof SpeciesData['baseStats'], string][] = [
  ['hp', 'HP'], ['atk', 'Attack'], ['def', 'Defense'], ['spa', 'Sp. Atk'], ['spd', 'Sp. Def'], ['spe', 'Speed'],
]
const statColor = (v: number) => (v >= 100 ? 'bg-emerald-400' : v >= 70 ? 'bg-sky-400' : v >= 50 ? 'bg-amber-400' : 'bg-red-400')

function StarterDetails({ mon, picked, canAdd, onToggle, onClose }: {
  mon: RosterMember; picked: boolean; canAdd: boolean; onToggle: () => void; onClose: () => void
}) {
  const s = species(mon.species)
  const chain = evolutionChain(mon.species)
  const strong = strongAgainst(s.types)
  const weak = weakTo(s.types)
  const heading = 'text-[11px] font-bold uppercase tracking-wider text-white/55 mb-1.5'
  return (
    <Modal title={`${s.name} · details`} onClose={onClose} wide>
      <div className="flex gap-4 items-center">
        <img src={artworkUrl(mon.species)} alt="" className="w-20 h-20 object-contain shrink-0" />
        <div className="text-sm flex flex-col gap-1">
          <p className="flex items-center gap-1.5">{s.types.map(t => <TypeBadge key={t} type={t} />)}<span className="text-white/70">Lv {mon.level}</span></p>
          <p>Ability: <b>{s.ability}</b></p>
          <p className="text-white/70">{chain ? `Evolves: ${chain}` : 'Does not evolve.'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-4">
        <section>
          <h3 className={heading}>Base stats</h3>
          <dl className="grid grid-cols-[4.5rem_2.25rem_1fr] gap-x-2 gap-y-1 items-center text-sm">
            {STAT_ROWS.map(([key, label]) => (
              <div key={key} className="contents">
                <dt className="text-white/70">{label}</dt>
                <dd className="tabular-nums text-right font-bold">{s.baseStats[key]}</dd>
                <dd className="h-2 rounded-full bg-black/50 overflow-hidden">
                  <span className={`block h-full rounded-full ${statColor(s.baseStats[key])}`} style={{ width: `${Math.min(100, (s.baseStats[key] / 160) * 100)}%` }} />
                </dd>
              </div>
            ))}
            <dt className="text-white/70 border-t border-white/10 pt-1">Total</dt>
            <dd className="tabular-nums text-right font-black text-gold-300 border-t border-white/10 pt-1">{bst(mon.species)}</dd>
            <dd className="self-stretch border-t border-white/10" />
          </dl>

          <h3 className={`${heading} mt-4`}>Strong against</h3>
          {strong.length
            ? <div className="flex flex-wrap gap-1">{strong.map(t => <TypeBadge key={t} type={t} />)}</div>
            : <p className="text-sm text-white/60">Its own-type moves hit nothing super-effectively.</p>}
          <p className="text-[11px] text-white/50 mt-1">Types its {s.types.join('/')} moves hit for double damage.</p>

          <h3 className={`${heading} mt-4`}>Weak to</h3>
          {weak.length ? (
            <div className="flex flex-wrap gap-1.5">
              {weak.map(w => (
                <span key={w.type} className="inline-flex items-center gap-1">
                  <TypeBadge type={w.type} />
                  {w.mult >= 4 && <span className="text-[10px] font-black text-red-300">×4</span>}
                </span>
              ))}
            </div>
          ) : <p className="text-sm text-white/60">No weaknesses.</p>}
          <p className="text-[11px] text-white/50 mt-1">Attack types that deal it double damage or more.</p>
        </section>

        <section>
          <h3 className={heading}>Moveset at Lv {mon.level}</h3>
          <div className="flex flex-col gap-1.5">{mon.moves.map(id => <MoveInfo key={id} id={id} />)}</div>
        </section>
      </div>

      <button
        onClick={() => { onToggle(); onClose() }}
        disabled={!picked && !canAdd}
        className={`w-full mt-5 rounded-xl border-2 border-black py-2.5 font-ui font-bold disabled:opacity-40 ${picked ? 'bg-white/10 hover:bg-white/15' : 'bg-gold-400 text-ink-900 hover:bg-gold-300'}`}
      >
        {picked ? 'Remove from team' : canAdd ? 'Add to team' : 'Team is full'}
      </button>
    </Modal>
  )
}

export function TeamSelectScreen() {
  const run = useRunStore(s => s.run)!
  const { confirmTeam, clearRun, setFormat } = useRunStore()
  const go = useUiStore(s => s.go)
  const [picked, setPicked] = useState<string[]>([])
  const [info, setInfo] = useState<string | null>(null)
  const format: BattleFormat = run.format ?? 'singles'
  const size = teamSizeFor(format)
  const daily = run.mode === 'daily'

  function toggle(uid: string) {
    setPicked(p => (p.includes(uid) ? p.filter(u => u !== uid) : p.length < size ? [...p, uid] : p))
  }

  function changeFormat(f: BattleFormat) {
    setFormat(f)
    setPicked(p => p.slice(0, teamSizeFor(f)))
  }

  const infoMon = run.candidates.find(c => c.uid === info)

  return (
    <div className="home-bg min-h-screen text-white pb-28">
      <header className="bg-ink-900 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => (daily ? go('home') : (clearRun(), go('type_select')))}
            className="rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black px-3 py-1.5 text-sm font-ui font-bold"
          >
            ◀ {daily ? 'Home' : 'Gyms'}
          </button>
          <h1 className="font-ui font-bold text-2xl sm:text-3xl flex-1">Pick {size} starters</h1>
          <span className="text-xs text-white/60">Step 2/2</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3">
        <section className={`${panel} px-4 py-3`}>
          <p className="flex items-center gap-2">
            <TypeBadge type={run.gymType} />
            <span className="font-ui font-bold text-lg">{gymName(run.gymType)}</span>
            {daily && <span className="text-xs text-gold-300">Today’s Daily Challenge</span>}
          </p>
          <p className="text-sm mt-1.5"><span className="text-emerald-400" aria-label="Strength">▲</span> {GYM_STRENGTH[run.gymType]}</p>
          <p className="text-sm"><span className="text-red-400" aria-label="Weakness">▼</span> {gymWeakness(run.gymType)}</p>
        </section>

        {!daily && (
          <section className={`${panel} px-4 py-3 flex flex-wrap items-center justify-between gap-3`}>
            <div>
              <p className="font-ui font-bold">Battle format</p>
              <p className="text-xs text-white/65 mt-0.5">
                {format === 'doubles'
                  ? 'Doubles: two Pokémon out on each side. You pick 4 starters.'
                  : 'Singles: one Pokémon out on each side. You pick 3 starters.'}
              </p>
            </div>
            <div role="radiogroup" aria-label="Battle format" className="flex gap-1.5">
              {(['singles', 'doubles'] as BattleFormat[]).map(f => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={format === f}
                  onClick={() => changeFormat(f)}
                  className={`rounded-lg border-2 px-3 py-1.5 text-sm font-ui font-bold capitalize ${format === f ? 'bg-gold-400 text-ink-900 border-black' : 'border-white/20 hover:bg-white/10'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>
        )}

        <p className="text-sm text-white/90">
          Choose {size} of these {run.candidates.length}. They gain XP after every win, learn new moves and can evolve.
          {daily && ' Every player gets the same starters today. Leaving or reloading the page during a battle counts as a loss.'}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {run.candidates.map(mon => {
            const s = species(mon.species)
            const order = picked.indexOf(mon.uid)
            const selected = order >= 0
            const full = !selected && picked.length >= size
            return (
              <div
                key={mon.uid}
                className={`relative rounded-xl bg-ink-900 border-2 shadow-[0_4px_0_rgba(0,0,0,0.35)] transition-transform ${
                  selected ? 'border-gold-400 -translate-y-0.5' : 'border-black'
                }`}
              >
                <button
                  onClick={() => toggle(mon.uid)}
                  aria-pressed={selected}
                  disabled={full}
                  aria-label={`${selected ? 'Remove' : 'Pick'} ${s.name}`}
                  className="w-full flex gap-3 items-center p-3 text-left rounded-t-[10px] hover:bg-white/5 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <img src={artworkUrl(mon.species)} alt="" className="w-20 h-20 object-contain shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className="font-ui font-bold text-lg truncate">{s.name}</span>
                      <span className="text-xs text-white/65 shrink-0">Lv {mon.level}</span>
                    </span>
                    <span className="flex gap-1 mt-0.5">{s.types.map(t => <TypeBadge key={t} type={t} small />)}</span>
                    <span className="grid grid-cols-[5rem_1fr] gap-x-2 mt-1.5 text-xs">
                      <span className="text-white/55">BST</span><span className="font-bold tabular-nums">{bst(mon.species)}</span>
                      <span className="text-white/55">Ability</span><span className="font-bold truncate">{s.ability}</span>
                      <span className="text-white/55">Evolves into</span><span className="font-bold truncate">{evolvesInto(mon.species)}</span>
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setInfo(mon.uid)}
                  aria-label={`Details for ${s.name}`}
                  className="w-full border-t-2 border-black rounded-b-[10px] py-1.5 text-sm font-ui font-bold text-white/85 hover:bg-white/10"
                >
                  Details
                </button>
                {selected && (
                  <span className="absolute -top-2 -left-2 bg-gold-400 text-ink-900 text-xs font-black rounded-full w-7 h-7 grid place-items-center border-2 border-black" aria-hidden="true">
                    {order + 1}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-ink-900 border-t-4 border-black px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => confirmTeam(picked)}
            disabled={picked.length !== size}
            className="flex-1 rounded-xl bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black py-3 font-ui font-bold text-lg shadow-[0_4px_0_#b8431a] disabled:opacity-50 disabled:shadow-none"
          >
            {picked.length === size ? 'Open the Gym ▶' : `Pick ${size - picked.length} more`}
          </button>
          <div className="flex gap-1.5" aria-label="Your team">
            {Array.from({ length: size }, (_, i) => {
              const m = run.candidates.find(c => c.uid === picked[i])
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
        <StarterDetails
          mon={infoMon}
          picked={picked.includes(infoMon.uid)}
          canAdd={picked.length < size}
          onToggle={() => toggle(infoMon.uid)}
          onClose={() => setInfo(null)}
        />
      )}
    </div>
  )
}
