import type { ReactNode } from 'react'
import { artworkUrl, species, type SpeciesData } from '../lib/dex'
import { strongAgainst, weakTo } from '../lib/gymInfo'
import { TypeBadge } from './TypeBadge'
import { Modal } from './Modal'
import { MoveInfo } from './MoveInfo'
import type { RosterMember } from '../types/game'

/** "Ivysaur (Lv 16) → Venusaur (Lv 32)" — follows the first evolution at each stage. */
export function evolutionChain(id: string): string {
  const steps: string[] = []
  let cur = species(id)
  while (cur.evos[0]) {
    const e = cur.evos[0]
    steps.push(`${species(e.to).name} (Lv ${e.level})`)
    cur = species(e.to)
  }
  return steps.join(' → ')
}

export const bst = (id: string) => Object.values(species(id).baseStats).reduce((x, y) => x + y, 0)

/** Next stage for the card: "Charmeleon · Lv 16", "Vaporeon +7 more · Lv 30" or "Final form". */
export function evolvesInto(id: string): string {
  const evos = species(id).evos
  if (!evos.length) return 'Final form'
  const first = species(evos[0].to).name
  return `${first}${evos.length > 1 ? ` +${evos.length - 1} more` : ''} · Lv ${evos[0].level}`
}

const STAT_ROWS: [keyof SpeciesData['baseStats'], string][] = [
  ['hp', 'HP'], ['atk', 'Attack'], ['def', 'Defense'], ['spa', 'Sp. Atk'], ['spd', 'Sp. Def'], ['spe', 'Speed'],
]
const statColor = (v: number) => (v >= 100 ? 'bg-emerald-400' : v >= 70 ? 'bg-sky-400' : v >= 50 ? 'bg-amber-400' : 'bg-red-400')

/** Full breakdown: base stats, moveset, Strong against and Weak to, with Add/Remove. */
/** Stats, type matchups and (optionally) moves. Without `onToggle` it's read-only: no Add/Remove button. */
export function PokemonDetails({ mon, picked = false, canAdd = false, onToggle, onClose, showMoves = true }: {
  mon: RosterMember; picked?: boolean; canAdd?: boolean; onToggle?: () => void; onClose: () => void; showMoves?: boolean
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

      <div className={`grid gap-5 mt-4 ${showMoves ? 'md:grid-cols-2' : ''}`}>
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

        {showMoves && (
          <section>
            <h3 className={heading}>Moveset at Lv {mon.level}</h3>
            <div className="flex flex-col gap-1.5">{mon.moves.map(id => <MoveInfo key={id} id={id} />)}</div>
          </section>
        )}
      </div>

      {onToggle && <button
        onClick={() => { onToggle(); onClose() }}
        disabled={!picked && !canAdd}
        className={`w-full mt-5 rounded-xl border-2 border-black py-2.5 font-ui font-bold disabled:opacity-40 ${picked ? 'bg-white/10 hover:bg-white/15' : 'bg-gold-400 text-ink-900 hover:bg-gold-300'}`}
      >
        {picked ? 'Remove from team' : canAdd ? 'Add to team' : 'Team is full'}
      </button>}
    </Modal>
  )
}


/** Summary card: tap to pick, with a separate Details button. `order` is its 1-based pick number; `note` shows above Details. */
export function PokemonCard({ mon, order, full, onToggle, onDetails, note }: {
  mon: RosterMember; order: number; full: boolean; onToggle: () => void; onDetails: () => void; note?: ReactNode
}) {
  const s = species(mon.species)
  const selected = order > 0
  return (
              <div
                                className={`relative rounded-xl bg-ink-900 border-2 shadow-[0_4px_0_rgba(0,0,0,0.35)] transition-transform ${
                  selected ? 'border-gold-400 -translate-y-0.5' : 'border-black'
                }`}
              >
                <button
                  onClick={onToggle}
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
                      <span className="text-white/55">Evolves into</span><span className="font-bold leading-snug">{evolvesInto(mon.species)}</span>
                    </span>
                  </span>
                </button>
                {note && <div className="px-3 pb-2 -mt-1">{note}</div>}
                <button
                  onClick={onDetails}
                  aria-label={`Details for ${s.name}`}
                  className="w-full border-t-2 border-black rounded-b-[10px] py-1.5 text-sm font-ui font-bold text-white/85 hover:bg-white/10"
                >
                  Details
                </button>
                {selected && (
                  <span className="absolute -top-2 -left-2 bg-gold-400 text-ink-900 text-xs font-black rounded-full w-7 h-7 grid place-items-center border-2 border-black" aria-hidden="true">
                    {order}
                  </span>
                )}
              </div>
  )
}
