import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { artworkUrl, battleSpriteUrl, effectiveness, species } from '../lib/dex'
import { BAG_INFO, heldItemDesc, MAX_TEAM, type BagItem } from '../lib/economy'
import { readyEvolutions } from '../lib/progression'
import { levelCapFor, regionOf, trainerTitleName, type RegionTrainer } from '../lib/regions'
import { regionalTrainer, trainerSprite } from '../lib/trainers'
import { WEAK_TO } from '../lib/typechart'
import { TYPE_COLORS } from '../lib/typeColors'
import { ArenaBackdrop } from '../components/ArenaBackdrop'
import { ItemIcon, itemSprite } from '../components/ItemIcon'
import { Modal } from '../components/Modal'
import { TeamModal } from '../components/TeamModal'
import { TypeBadge } from '../components/TypeBadge'
import type { RosterMember, RunState } from '../types/game'

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_5px_0_rgba(0,0,0,0.35)]'
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)

/** 8 badges (or trials), 4 Elite Four members (or equivalents) and the Champion. */
function RegionTrack({ run }: { run: RunState }) {
  const region = regionOf(run.region)
  return (
    <ol className="flex items-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] py-1" aria-label={`Battle ${run.challengerIndex + 1} of ${region.trainers.length}`}>
      {region.trainers.map((t, i) => {
        const done = i < run.challengerIndex
        const current = i === run.challengerIndex
        const league = t.title !== 'Gym Leader'
        const color = TYPE_COLORS[t.type]
        return (
          <li key={t.name} className="flex items-center shrink-0">
            {i > 0 && <span className={`w-2.5 sm:w-4 h-1 ${i <= run.challengerIndex ? 'bg-emerald-400' : 'bg-white/15'}`} />}
            <span
              aria-current={current ? 'step' : undefined}
              title={`${trainerTitleName(t)}${t.badge ? ` · ${t.badge}` : ''}`}
              className={`grid place-items-center border-2 text-[10px] font-black ${league ? 'w-8 h-8 rotate-45 rounded-md' : 'w-7 h-7 rounded-full'} ${
                done ? `${color.bg} border-white/70 text-white` : current ? 'bg-gold-400 border-gold-300 text-ink-900' : 'bg-black/30 border-white/20 text-white/60'
              }`}
            >
              <span className={league ? '-rotate-45' : ''}>{t.title === 'Champion' ? '♚' : league ? '♜' : done ? '✓' : i + 1}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Best multiplier any of your team's own-type attacks gets against these types. */
const bestHit = (team: RosterMember[], types: string[]) =>
  Math.max(1, ...team.flatMap(m => species(m.species).types.map(t => effectiveness(t, types))))

function ScoutModal({ run, trainer, onClose, onBattle }: { run: RunState; trainer: RegionTrainer; onClose: () => void; onBattle: () => void }) {
  const t = regionalTrainer(run)
  return (
    <Modal title={t.name} onClose={onClose} wide>
      <div className="flex gap-4 items-start">
        <img src={trainerSprite(t.sprite)} alt="" className="w-24 h-24 object-contain bg-sky-200/80 rounded-lg border-2 border-black [image-rendering:pixelated]" />
        <div className="flex-1 flex flex-col gap-2">
          <span className="self-start text-[10px] font-black uppercase tracking-wider bg-black/50 text-gold-300 rounded px-2 py-0.5">{trainer.place}</span>
          <p className="rounded-lg bg-[#fdf6e6] text-ink-900 font-bold italic px-3 py-2">“{t.quote}”</p>
          <p className="text-xs text-white/60">Battle style: {t.style}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-4">
        {run.challenger.map(m => {
          const s = species(m.species)
          const hit = bestHit(run.roster, s.types)
          return (
            <div key={m.uid} className="flex gap-3 rounded-xl border border-white/15 bg-black/20 p-3">
              <img src={artworkUrl(m.species)} alt="" className="w-16 h-16 object-contain" />
              <div className="min-w-0">
                <p><b>{s.name}</b> <span className="text-xs text-white/60">Lv {m.level}</span></p>
                <div className="flex flex-wrap gap-1 my-1">{s.types.map(x => <TypeBadge key={x} type={x} small />)}</div>
                {m.item && <p className="text-[11px] text-white/60">Holds {m.item}</p>}
                {hit >= 2 && <span className="text-[10px] font-black rounded px-1.5 py-0.5 bg-emerald-900/70 text-emerald-200">✓ WEAK TO YOUR TEAM</span>}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-sm text-white/70 mt-3 flex flex-wrap items-center gap-1.5">
        {cap(trainer.type)} specialists are weak to {WEAK_TO[trainer.type].map(w => <TypeBadge key={w} type={w} small />)}
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 font-bold text-sm">Back</button>
        <button onClick={onBattle} className="rounded-lg bg-gold-400 text-ink-900 hover:bg-gold-300 px-4 py-2 font-black text-sm">Battle! ⚔</button>
      </div>
    </Modal>
  )
}

function MonTile({ m, onOpen, badge }: { m: RosterMember; onOpen: () => void; badge?: React.ReactNode }) {
  return (
    <button onClick={onOpen} className="relative w-full h-20 rounded-lg bg-black/25 hover:bg-white/5 border-2 border-black flex items-center gap-2 px-2 text-left">
      {badge}
      <img src={artworkUrl(m.species)} alt="" className="w-14 h-14 object-contain" />
      <span className="flex-1 min-w-0">
        <span className="block font-bold truncate">{species(m.species).name}</span>
        <span className="block text-[11px] text-white/60 truncate">Lv {m.level}{m.item && ` · ${m.item}`}</span>
        <span className="flex gap-1 mt-0.5">{species(m.species).types.map(t => <TypeBadge key={t} type={t} small />)}</span>
      </span>
    </button>
  )
}

type Tab = 'team' | 'box' | 'bag' | 'log'

export function RegionalHubScreen() {
  const run = useRunStore(s => s.run)!
  const { startBattle, swapFromBox, sendToBox } = useRunStore()
  const go = useUiStore(s => s.go)
  const [tab, setTab] = useState<Tab>('team')
  const [teamUid, setTeamUid] = useState<string | null>(null)
  const [boxUid, setBoxUid] = useState<string | null>(null)
  const [scout, setScout] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const region = regionOf(run.region)
  const trainer = region.trainers[run.challengerIndex]
  const t = regionalTrainer(run)
  const lead = run.roster[0]
  const box = run.box ?? []
  const boxMon = box.find(m => m.uid === boxUid)
  const bag = run.bag ?? { potion: 0, revive: 0, candy: 0, stone: 0 }
  const badges = region.trainers.slice(0, run.challengerIndex).filter(x => x.badge).length
  const noun = region.badgeNoun ?? 'badge'
  const retries = run.retries ?? 0
  const evolvable = run.roster.filter(m => readyEvolutions(m).length > 0)
  const counts: Record<Tab, number | null> = { team: run.roster.length, box: box.length, bag: null, log: null }

  function swapIn(teamOut?: string) {
    if (!boxMon) return
    const res = swapFromBox(boxMon.uid, teamOut)
    setMessage(res.message)
    if (res.ok) setBoxUid(null)
  }

  return (
    <div className="home-bg min-h-screen text-white font-sans px-3 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <header className={`${panel} px-4 py-3 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <button onClick={() => go('home')} aria-label="Home" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-lg">☰</button>
            <div className="flex-1 min-w-0">
              <h1 className="font-ui font-bold text-xl sm:text-2xl truncate">{region.name} · Regional Quest</h1>
              <p className="text-xs text-white/60">{badges} {noun}{badges === 1 ? '' : 's'} · battle <b className="text-white">{run.challengerIndex + 1}</b>/{region.trainers.length}</p>
            </div>
            <span className="rounded-full bg-black/40 px-3 py-1 font-black text-red-300 tabular-nums" title={`${retries} retries left`} aria-label={`${retries} retries left`}>
              {'♥'.repeat(retries)}<span className="text-white/25">{'♥'.repeat(Math.max(0, 3 - retries))}</span>
            </span>
          </div>
          <RegionTrack run={run} />
        </header>

        {evolvable.length > 0 && (
          <button onClick={() => setTeamUid(evolvable[0].uid)} className="rounded-xl bg-amber-400/15 border-2 border-amber-400/60 hover:bg-amber-400/25 px-4 py-2.5 flex items-center gap-3 text-left">
            <span className="flex -space-x-2">{evolvable.slice(0, 4).map(m => <img key={m.uid} src={battleSpriteUrl(m.species, false)} alt="" className="h-9 [image-rendering:pixelated]" />)}</span>
            <span className="flex-1 font-bold text-amber-200">✦ {evolvable.length} Pokémon can evolve</span>
            <span className="text-xs font-black rounded-lg bg-amber-400 text-ink-900 border-2 border-black px-2.5 py-1">View</span>
          </button>
        )}

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4 items-start">
          <section className={`${panel} overflow-hidden`}>
            <ArenaBackdrop type={trainer.type} className="h-56 sm:h-64">
              <img src={trainerSprite(region.playerSprite)} alt="" className="absolute left-[6%] bottom-4 h-32 sm:h-40 [image-rendering:pixelated] drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
              {lead && <img src={battleSpriteUrl(lead.species, true)} alt="" className="absolute left-[30%] bottom-4 h-20 sm:h-24 [image-rendering:pixelated]" />}
              <span className="pixel-title absolute left-1/2 top-[30%] -translate-x-1/2 text-gold-400 text-3xl">VS</span>
              <img src={trainerSprite(trainer.sprite)} alt="" className="absolute right-[6%] bottom-4 h-32 sm:h-40 [image-rendering:pixelated] -scale-x-100 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
            </ArenaBackdrop>
            <div className="p-4 flex flex-col gap-3 border-t-2 border-black">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/60">{trainer.place}{trainer.badge && ` · ${trainer.badge}`}</p>
                  <h2 className="font-ui font-bold text-2xl leading-tight">{t.name}</h2>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <TypeBadge type={trainer.type} />
                    <span className="text-xs text-white/70">{run.challenger.length} Pokémon · up to Lv {Math.max(...run.challenger.map(m => m.level))}</span>
                  </div>
                </div>
              </div>
              <p className="rounded-lg bg-[#fdf6e6] text-ink-900 font-bold px-3 py-2">“{t.quote}”</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setScout(true)} className="rounded-xl bg-white/10 hover:bg-white/15 border-2 border-black py-3 font-black">Scout team</button>
                <button onClick={startBattle} className="rounded-xl bg-gold-400 text-ink-900 hover:bg-gold-300 border-2 border-black py-3 font-black shadow-[0_4px_0_#b8431a]">Battle! ⚔</button>
              </div>
              <p className="text-xs text-white/55">
                Your whole team is healed after every battle. Only team members earn XP: up to Lv {levelCapFor(region, run.challengerIndex + 1)} after this win. {retries} {retries === 1 ? 'retry' : 'retries'} left.
              </p>
            </div>
          </section>

          <section className={`${panel} p-3`}>
            <div role="tablist" className="flex gap-1.5 mb-3">
              {(['team', 'box', 'bag', 'log'] as Tab[]).map(x => (
                <button key={x} role="tab" aria-selected={tab === x} onClick={() => { setTab(x); setMessage(null) }}
                  className={`flex-1 rounded-lg border-2 py-1.5 text-sm font-bold capitalize ${tab === x ? 'border-gold-400 bg-gold-400/10 text-gold-300' : 'border-white/10 hover:bg-white/5'}`}>
                  {x}{counts[x] !== null && <span className="ml-1 text-white/50">{x === 'team' ? `${counts[x]}/${MAX_TEAM}` : counts[x]}</span>}
                </button>
              ))}
            </div>
            {message && <p role="status" className="mb-2 rounded-lg bg-gold-400/15 border border-gold-400/40 px-3 py-1.5 text-sm">{message}</p>}

            {tab === 'team' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {run.roster.map((m, i) => (
                    <div key={m.uid} className="flex flex-col gap-1">
                      <MonTile m={m} onOpen={() => setTeamUid(m.uid)} badge={i === 0 ? <span className="absolute -top-1.5 left-1.5 text-[9px] font-black bg-gold-400 text-ink-900 rounded px-1">LEAD</span> : readyEvolutions(m).length ? <span className="absolute -top-1.5 right-1.5 text-[9px] font-black bg-amber-400 text-ink-900 rounded px-1">✦ EVOLVE</span> : undefined} />
                      <button disabled={run.roster.length <= 1} onClick={() => setMessage(sendToBox(m.uid).message)} className="text-[11px] font-bold text-white/60 hover:text-white disabled:opacity-30">Send to box ▸</button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/50">Tap a Pokémon for moves, items and evolving. The first one leads.</p>
              </div>
            )}

            {tab === 'box' && (
              <div className="flex flex-col gap-2">
                {box.length ? (
                  <div className="grid grid-cols-2 gap-2">
                    {box.map(m => <MonTile key={m.uid} m={m} onOpen={() => setBoxUid(m.uid)} />)}
                  </div>
                ) : <p className="text-sm text-white/55 p-2">Empty. Once your team has 6 Pokémon, new catches go here.</p>}
                <p className="text-[11px] text-white/50">Boxed Pokémon don’t earn XP. Tap one to swap it onto the team before a battle.</p>
              </div>
            )}

            {tab === 'bag' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {(['candy', 'stone'] as BagItem[]).map(b => (
                    <div key={b} className={`rounded-lg border-2 border-black bg-black/25 px-3 py-2 ${bag[b] ? '' : 'opacity-45'}`} title={BAG_INFO[b].desc}>
                      <p className="font-bold text-sm flex items-center gap-1.5"><ItemIcon src={itemSprite({ bag: b })} className="w-7 h-7" />{BAG_INFO[b].name}</p>
                      <p className="text-xs text-gold-300">×{bag[b]}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/50 mt-1">Held items</h3>
                {(run.heldItems ?? []).length ? (
                  <ul className="text-sm space-y-1">{run.heldItems!.map((h, i) => <li key={i} className="flex items-center gap-1.5"><ItemIcon src={itemSprite({ held: h })} className="w-6 h-6" /><b>{h}</b> <span className="text-white/60">· {heldItemDesc(h)}</span></li>)}</ul>
                ) : <p className="text-sm text-white/50">No spare held items.</p>}
                <p className="text-xs text-white/50">Open a team member to use Rare Candy or an Evolution Stone, or give it a held item.</p>
              </div>
            )}

            {tab === 'log' && (
              <ul className="max-h-80 overflow-y-auto text-sm divide-y divide-white/10">
                {(run.log ?? []).length ? run.log!.map((l, i) => <li key={i} className="py-1.5 text-white/80">{l}</li>) : <li className="py-2 text-white/50">Nothing yet.</li>}
              </ul>
            )}
          </section>
        </div>
      </div>

      {boxMon && (
        <Modal title={`Swap in ${species(boxMon.species).name}`} onClose={() => setBoxUid(null)}>
          <div className="flex items-center gap-3 mb-3">
            <img src={artworkUrl(boxMon.species)} alt="" className="w-16 h-16 object-contain" />
            <div className="text-sm">
              <p><b>{species(boxMon.species).name}</b> Lv {boxMon.level}</p>
              <p className="text-white/60">{boxMon.moves.length} moves{boxMon.item ? ` · holds ${boxMon.item}` : ''}</p>
            </div>
          </div>
          {run.roster.length < MAX_TEAM ? (
            <button onClick={() => swapIn()} className="w-full rounded-lg bg-gold-400 text-ink-900 font-black py-2.5 border-2 border-black hover:bg-gold-300">Add to team</button>
          ) : (
            <>
              <p className="text-sm text-white/70 mb-2">Your team is full. Who goes to the box?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {run.roster.map(m => (
                  <button key={m.uid} onClick={() => swapIn(m.uid)} className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2 flex flex-col items-center">
                    <img src={artworkUrl(m.species)} alt="" className="h-14 object-contain" />
                    <span className="text-sm font-bold">{species(m.species).name}</span>
                    <span className="text-xs text-white/60">Lv {m.level}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
      {teamUid && <TeamModal uid={teamUid} onClose={() => setTeamUid(null)} />}
      {scout && <ScoutModal run={run} trainer={trainer} onClose={() => setScout(false)} onBattle={() => { setScout(false); startBattle() }} />}
    </div>
  )
}
