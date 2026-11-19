import { useMemo, useState } from 'react'
import { ItemIcon, itemSprite } from '../components/ItemIcon'
import { runRng, useRunStore } from '../store/runStore'
import { artworkUrl, species } from '../lib/dex'
import { MAX_TEAM, recruitOptions, skipBonus, type Reward } from '../lib/economy'
import { TeamStrip } from '../components/TeamStrip'
import { TeamModal } from '../components/TeamModal'
import { Modal } from '../components/Modal'
import { BattleReport } from '../components/BattleReport'
import { MoveInfo } from '../components/MoveInfo'
import { tutorOptions } from '../lib/progression'
import { move as moveData } from '../lib/dex'
import { StatBars } from '../components/StatBars'
import { TypeBadge } from '../components/TypeBadge'
import type { RosterMember } from '../types/game'

const RARITY_STYLE = {
  common: { ring: 'border-white/30', badge: 'bg-slate-300 text-ink-900' },
  rare: { ring: 'border-sky-400', badge: 'bg-sky-500 text-white' },
  epic: { ring: 'border-fuchsia-400', badge: 'bg-fuchsia-500 text-white' },
} as const

export function PickMember({ roster, onPick, extra }: { roster: RosterMember[]; onPick: (uid: string) => void; extra?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {roster.map(m => (
        <button key={m.uid} onClick={() => onPick(m.uid)} className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2 flex flex-col items-center">
          <img src={artworkUrl(m.species)} alt="" className="h-16 object-contain" />
          <span className="text-sm font-bold">{species(m.species).name}</span>
          <span className="text-xs text-white/60">Lv {m.level}{m.item ? ` · ${m.item}` : ''}</span>
        </button>
      ))}
      {extra}
    </div>
  )
}

function RecruitPicker({ onDone }: { onDone: (recruit: RosterMember, replaceUid?: string) => void }) {
  const run = useRunStore(s => s.run)!
  const options = useMemo(() => recruitOptions(run.gymType, run.roster, runRng(run, 'recruit'), (run.upgrades ?? []).includes('office') ? 4 : 3), [run.id, run.challengerIndex])
  const [chosen, setChosen] = useState<RosterMember | null>(null)
  const full = run.roster.length >= MAX_TEAM

  if (chosen && full) {
    return (
      <>
        <p className="text-sm text-white/70 mb-3">Your team is full. Who leaves so {species(chosen.species).name} can join?</p>
        <PickMember roster={run.roster} onPick={uid => onDone(chosen, uid)} />
      </>
    )
  }
  if (!options.length) return <p className="text-white/70">No new Pokémon of your type are available.</p>
  return (
    <>
      <p className="text-sm text-white/70 mb-3">They join at Lv {options[0].level} with full HP.</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {options.map(o => {
          const s = species(o.species)
          return (
            <button
              key={o.uid}
              onClick={() => (full ? setChosen(o) : onDone(o))}
              className="rounded-xl bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-gold-400 p-3 text-left flex flex-col gap-2"
            >
              <img src={artworkUrl(o.species)} alt="" className="h-24 mx-auto object-contain" />
              <div className="flex items-baseline justify-between"><b>{s.name}</b><span className="text-xs text-white/60">Lv {o.level}</span></div>
              <div className="flex gap-1">{s.types.map(t => <TypeBadge key={t} type={t} small />)}</div>
              <p className="text-[11px] text-white/60">Ability: {s.ability} · BST {Object.values(s.baseStats).reduce((a, b) => a + b, 0)}</p>
              <StatBars stats={s.baseStats} />
            </button>
          )
        })}
      </div>
    </>
  )
}

export function TutorPicker({ onDone }: { onDone: (targetUid: string, move: string, forget?: string) => void }) {
  const run = useRunStore(s => s.run)!
  const [uid, setUid] = useState<string | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [forget, setForget] = useState<string | null>(null)
  const mon = run.roster.find(m => m.uid === uid)
  const options = useMemo(() => (mon ? tutorOptions(mon, runRng(run, `tutor:${mon.species}`)) : []), [mon?.uid, run.challengerIndex])

  if (!mon) {
    return (
      <>
        <p className="text-sm text-white/70 mb-3">Choose a Pokémon to teach.</p>
        <PickMember roster={run.roster} onPick={setUid} />
      </>
    )
  }
  const full = mon.moves.length >= 4
  const ready = chosen && (!full || forget)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img src={artworkUrl(mon.species)} alt="" className="w-12 h-12 object-contain" />
        <p className="flex-1"><b>{species(mon.species).name}</b> <span className="text-xs text-white/60">Lv {mon.level}</span></p>
        <button onClick={() => { setUid(null); setChosen(null); setForget(null) }} className="text-xs font-bold text-white/70 hover:text-white">◀ Other Pokémon</button>
      </div>
      {options.length === 0 ? (
        <p className="text-sm text-white/60">The tutor has nothing new for {species(mon.species).name}. Choose another Pokémon.</p>
      ) : (
        <>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">1. Pick a move</p>
          <div className="grid sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Move to teach">
            {options.map(id => (
              <button key={id} role="radio" aria-checked={chosen === id} onClick={() => setChosen(id)}
                className={`text-left rounded-lg border-2 ${chosen === id ? 'border-gold-400' : 'border-transparent hover:border-white/20'}`}>
                <MoveInfo id={id} />
              </button>
            ))}
          </div>
          {full && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">2. Forget which move?</p>
              <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Move to forget">
                {mon.moves.map(id => (
                  <button key={id} role="radio" aria-checked={forget === id} onClick={() => setForget(id)}
                    className={`rounded-lg border-2 px-2.5 py-1.5 text-sm font-bold text-left ${forget === id ? 'border-red-400 bg-red-900/30' : 'border-white/10 hover:bg-white/5'}`}>
                    {moveData(id)?.name ?? id}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-white/50">A forgotten move can be swapped back in later from Team.</p>
            </>
          )}
          <button disabled={!ready} onClick={() => chosen && onDone(mon.uid, chosen, forget ?? undefined)}
            className="rounded-lg bg-gold-400 text-ink-900 font-black py-2.5 border-2 border-black disabled:opacity-40 hover:bg-gold-300">
            {ready ? `Teach ${moveData(chosen!)?.name}${forget ? ` · forget ${moveData(forget)?.name}` : ''}` : 'Confirm'}
          </button>
        </>
      )}
    </div>
  )
}

export function RewardScreen() {
  const run = useRunStore(s => s.run)!
  const { rerollReward, skipReward, takeReward } = useRunStore()
  const [pending, setPending] = useState<Reward | null>(null)
  const [report, setReport] = useState(true)
  const [teamUid, setTeamUid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const levelUps = Object.fromEntries(run.lastProgress.map(r => [r.uid, r.after.level > r.before.level]))

  function choose(r: Reward) {
    setError(null)
    if (r.kind === 'recruit' || r.kind === 'training' || r.kind === 'held_item' || r.kind === 'move_tutor') return setPending(r)
    const res = takeReward(r)
    if (!res.ok) setError(res.message)
  }

  function finish(opts: Parameters<typeof takeReward>[1]) {
    if (!pending) return
    const res = takeReward(pending, opts)
    if (!res.ok) setError(res.message)
    setPending(null)
  }

  return (
    <div className="home-bg min-h-screen text-white font-sans px-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <h1 className="screen-title text-3xl sm:text-4xl text-center">
          Choose a reward
        </h1>

        <TeamStrip roster={run.roster} onSelect={setTeamUid} levelUps={levelUps} />

        <div className="flex items-center justify-between rounded-xl bg-ink-900 border-2 border-black/50 px-4 py-2.5">
          <span className="font-extrabold text-gold-300"><ItemIcon src={itemSprite({ held: 'Amulet Coin' })} className="w-5 h-5 inline-block align-[-4px]" alt="" /> +₽{run.lastFunds ?? 0} <span className="text-white/50 font-semibold text-sm">· ₽{run.funds} total</span></span>
          <button onClick={() => setReport(true)} className="rounded-lg border border-white/20 hover:bg-white/10 px-3 py-1 text-xs font-bold">Details</button>
        </div>

        <div className="flex justify-center gap-3">
          <button
            disabled={!run.rerolls}
            onClick={rerollReward}
            className="rounded-xl bg-ink-900 border-2 border-black/50 px-5 py-2.5 font-bold disabled:opacity-40 hover:bg-ink-800"
          >
            ↻ Reroll ({run.rerolls ?? 0})
          </button>
          <button onClick={skipReward} className="rounded-xl bg-ink-900 border-2 border-black/50 px-5 py-2.5 font-bold hover:bg-ink-800">
            Skip · +₽{skipBonus(run.challengerIndex - 1)}
          </button>
        </div>

        {error && <p role="alert" className="text-center rounded-lg bg-red-900/60 px-3 py-2 text-sm">{error}</p>}

        <div className="grid sm:grid-cols-3 gap-3">
          {(run.rewardOffer ?? []).map(r => (
            <button
              key={r.id}
              onClick={() => choose(r)}
              className={`text-left rounded-xl bg-gradient-to-b from-ink-800 to-ink-950 border-2 ${RARITY_STYLE[r.rarity].ring} p-4 flex flex-col gap-2 hover:-translate-y-1 transition-transform shadow-[0_5px_0_rgba(0,0,0,0.35)]`}
            >
              <span className="flex items-center gap-2">
                <span className="w-12 h-12 rounded-lg bg-black/50 grid place-items-center" aria-hidden="true"><ItemIcon src={itemSprite({ reward: r.kind, held: r.item, gymType: run.gymType })} className="w-9 h-9" /></span>
                <span className={`text-[10px] font-black uppercase rounded px-1.5 ${RARITY_STYLE[r.rarity].badge}`}>{r.rarity}</span>
              </span>
              <span className="font-black text-lg">{r.title}</span>
              <span className="text-sm text-white/75">
                {r.desc}
                {r.kind === 'recruit' && ` Team ${run.roster.length}/${MAX_TEAM}.`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {pending && (
        <Modal
          title={pending.kind === 'recruit' ? 'Recruit a Pokémon' : pending.kind === 'training' ? 'Who trains?' : pending.kind === 'move_tutor' ? 'Move Tutor' : `Give ${pending.item}`}
          onClose={() => setPending(null)}
          wide={pending.kind === 'recruit' || pending.kind === 'move_tutor'}
        >
          {pending.kind === 'move_tutor' ? (
            <TutorPicker onDone={(targetUid, move, forget) => finish({ targetUid, move, forget })} />
          ) : pending.kind === 'recruit' ? (
            <RecruitPicker onDone={(recruit, replaceUid) => finish({ recruit, replaceUid })} />
          ) : pending.kind === 'training' ? (
            <PickMember roster={run.roster} onPick={uid => finish({ targetUid: uid })} />
          ) : (
            <PickMember
              roster={run.roster}
              onPick={uid => finish({ targetUid: uid })}
              extra={
                <button onClick={() => finish({})} className="rounded-xl border border-dashed border-white/25 hover:bg-white/5 p-2 text-sm font-bold">
                  Keep in bag
                </button>
              }
            />
          )}
        </Modal>
      )}

      {report && <BattleReport run={run} onClose={() => setReport(false)} onOpenTeam={setTeamUid} />}

      {teamUid && <TeamModal uid={teamUid} onClose={() => setTeamUid(null)} />}
    </div>
  )
}
