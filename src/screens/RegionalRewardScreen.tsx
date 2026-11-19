import { useState } from 'react'
import { REGIONAL_CATCHES, useRunStore } from '../store/runStore'
import type { RosterMember } from '../types/game'
import { MAX_TEAM, type Reward } from '../lib/economy'
import { regionOf, trainerTitleName } from '../lib/regions'
import { megaUsers, lineOf, superEffectiveTypes, zUsers } from '../lib/regional'
import { BattleReport } from '../components/BattleReport'
import { ItemIcon, itemSprite } from '../components/ItemIcon'
import { Modal } from '../components/Modal'
import { PokemonCard, PokemonDetails } from '../components/PokemonCard'
import { TeamModal } from '../components/TeamModal'
import { TeamStrip } from '../components/TeamStrip'
import { PickMember, TutorPicker } from './RewardScreen'

const RARITY_RING = { common: 'border-white/30', rare: 'border-sky-400', epic: 'border-fuchsia-400' } as const
const RARITY_BADGE = { common: 'bg-slate-300 text-ink-900', rare: 'bg-sky-500 text-white', epic: 'bg-fuchsia-500 text-white' } as const

/** After a Regional Quest win: the battle report, then catch 1 of 3 Pokémon and take 1 of 3 rewards. */
export function RegionalRewardScreen() {
  const run = useRunStore(s => s.run)!
  const { takeRegionalPick, takeReward } = useRunStore()
  const [report, setReport] = useState(true)
  const [pending, setPending] = useState<Reward | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [teamUid, setTeamUid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const region = regionOf(run.region)
  const beaten = region.trainers[run.challengerIndex - 1]
  const next = region.trainers[run.challengerIndex]
  const picks = run.picks ?? []
  const infoMon = picks.find(p => p.uid === info)
  const toBox = run.roster.length >= MAX_TEAM
  const caught = run.picksTaken ?? 0
  const left = REGIONAL_CATCHES - caught
  const upcoming = region.trainers.slice(run.challengerIndex, run.challengerIndex + 2)
  /** "Super effective vs Misty" tags for the next two opponents' specialty types. */
  const counterNote = (p: RosterMember) => {
    const hits = upcoming.filter(t => superEffectiveTypes(p, t.type).length > 0)
    if (!hits.length) return undefined
    return (
      <span className="flex flex-wrap gap-1">
        {hits.map(t => (
          <span key={t.name} className="text-[10px] font-black rounded px-1.5 py-0.5 bg-emerald-900/70 text-emerald-200">
            ✓ Super effective vs {t.name} ({t.type[0].toUpperCase() + t.type.slice(1)})
          </span>
        ))}
      </span>
    )
  }

  function choose(r: Reward) {
    setError(null)
    if (r.kind === 'move_tutor' || r.kind === 'held_item' || r.kind === 'mega_stone' || r.kind === 'z_crystal') return setPending(r)
    const res = takeReward(r)
    if (!res.ok) setError(res.message)
  }

  function finish(opts: Parameters<typeof takeReward>[1]) {
    if (!pending) return
    const res = takeReward(pending, opts)
    if (!res.ok) setError(res.message)
    setPending(null)
  }

  function catchMon(uid: string) {
    const res = takeRegionalPick(uid)
    if (!res.ok) setError(res.message)
  }

  // Mega Stones are best given to a Pokémon whose line can use them.
  const special = pending?.kind === 'mega_stone' || pending?.kind === 'z_crystal'
  const megaHolders = !pending?.item ? []
    : pending.kind === 'mega_stone' ? run.roster.filter(m => lineOf(m.species).some(id => megaUsers(pending.item!).includes(id)))
    : pending.kind === 'z_crystal' ? zUsers(pending.item, run.roster)
    : []

  return (
    <div className="home-bg min-h-screen text-white font-sans px-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <h1 className="screen-title text-3xl sm:text-4xl text-center">{beaten?.badge ? `${beaten.badge} earned!` : `${beaten?.name} defeated!`}</h1>
        <p className="text-center text-sm text-white/75">Your team is fully healed. Next: {trainerTitleName(next)}, {next.place}.</p>

        <TeamStrip roster={run.roster} onSelect={setTeamUid} levelUps={Object.fromEntries(run.lastProgress.map(r => [r.uid, r.after.level > r.before.level]))} />
        <div className="flex justify-end -mt-2">
          <button onClick={() => setReport(true)} className="rounded-lg border border-white/20 hover:bg-white/10 px-3 py-1 text-xs font-bold">Battle report</button>
        </div>

        {error && <p role="alert" className="text-center rounded-lg bg-red-900/60 px-3 py-2 text-sm">{error}</p>}

        <section className={run.pickTaken ? 'opacity-60' : ''}>
          <h2 className="font-ui font-bold text-xl mb-1">
            1. Catch {REGIONAL_CATCHES} Pokémon{' '}
            {run.pickTaken ? <span className="text-emerald-300 text-base">✓ done</span> : <span className="text-white/60 text-base">{caught}/{REGIONAL_CATCHES}</span>}
          </h2>
          {!run.pickTaken && (
            <>
              <p className="text-sm text-white/70 mb-2">
                Pick {left} more. Two of these hit your next {upcoming.length > 1 ? 'two opponents' : 'opponent'} super-effectively.{' '}
                {toBox ? 'Your team is full, so catches go to the box; swap them in from the map before any battle.' : 'Catches join your team until it has 6.'}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {picks.map(p => (
                  <PokemonCard key={p.uid} mon={p} order={0} full={false} onToggle={() => catchMon(p.uid)} onDetails={() => setInfo(p.uid)} note={counterNote(p)} />
                ))}
              </div>
            </>
          )}
        </section>

        <section className={run.rewardTaken ? 'opacity-60' : ''}>
          <h2 className="font-ui font-bold text-xl mb-2">2. Choose a reward {run.rewardTaken && <span className="text-emerald-300 text-base">✓ done</span>}</h2>
          {!run.rewardTaken && (
            <div className="grid sm:grid-cols-3 gap-3">
              {(run.rewardOffer ?? []).map(r => (
                <button
                  key={r.id}
                  onClick={() => choose(r)}
                  className={`text-left rounded-xl bg-gradient-to-b from-ink-800 to-ink-950 border-2 ${RARITY_RING[r.rarity]} p-4 flex flex-col gap-2 hover:-translate-y-1 transition-transform shadow-[0_5px_0_rgba(0,0,0,0.35)]`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-12 h-12 rounded-lg bg-black/50 grid place-items-center" aria-hidden="true">
                      <ItemIcon src={itemSprite(r.kind === 'mega_stone' || r.kind === 'z_crystal' || r.kind === 'held_item' ? { held: r.item } : { reward: r.kind, gymType: run.gymType })} className="w-9 h-9" />
                    </span>
                    <span className={`text-[10px] font-black uppercase rounded px-1.5 ${RARITY_BADGE[r.rarity]}`}>{r.kind === 'mega_stone' ? 'Mega Stone' : r.kind === 'z_crystal' ? 'Z-Crystal' : r.rarity}</span>
                  </span>
                  <span className="font-black text-lg">{r.title}</span>
                  <span className="text-sm text-white/75">{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {pending && (
        <Modal
          title={pending.kind === 'move_tutor' ? 'Move Tutor' : `Give ${pending.item}`}
          onClose={() => setPending(null)}
          wide={pending.kind === 'move_tutor'}
        >
          {pending.kind === 'move_tutor' ? (
            <TutorPicker onDone={(targetUid, move, forget) => finish({ targetUid, move, forget })} />
          ) : (
            <>
              {special && (
                <p className="text-sm text-white/70 mb-3">
                  {megaHolders.length
                    ? pending.kind === 'z_crystal'
                      ? 'Give it to one of these: they know a move it can turn into a Z-Move.'
                      : 'Give it to one of these: they can Mega Evolve in battle once fully evolved.'
                    : 'None of your team can use it yet; keep it in the bag for later.'}
                </p>
              )}
              <PickMember
                roster={special && megaHolders.length ? megaHolders : run.roster}
                onPick={uid => finish({ targetUid: uid })}
                extra={<button onClick={() => finish({})} className="rounded-xl border border-dashed border-white/25 hover:bg-white/5 p-2 text-sm font-bold">Keep in bag</button>}
              />
            </>
          )}
        </Modal>
      )}

      {infoMon && (
        <PokemonDetails mon={infoMon} picked={false} canAdd={!run.pickTaken} onToggle={() => catchMon(infoMon.uid)} onClose={() => setInfo(null)} />
      )}
      {report && <BattleReport run={run} onClose={() => setReport(false)} onOpenTeam={setTeamUid} />}
      {teamUid && <TeamModal uid={teamUid} onClose={() => setTeamUid(null)} />}
    </div>
  )
}

