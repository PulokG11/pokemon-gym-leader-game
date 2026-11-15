import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { artworkUrl, battleSpriteUrl, species } from '../lib/dex'
import { BAG_INFO, heldItemDesc, type BagItem } from '../lib/economy'
import { BOSS_NODES, LEADER_SPRITE, challengerTrainer, gymName, trainerSprite } from '../lib/trainers'
import { WEAK_TO, threatsTo } from '../lib/typechart'
import { TypeBadge } from '../components/TypeBadge'
import { TeamModal } from '../components/TeamModal'
import { Modal } from '../components/Modal'
import type { GymType, RunState } from '../types/game'

const ARENA: Record<GymType, string> = {
  fire: 'from-orange-300 via-rose-300 to-red-400', water: 'from-sky-300 via-cyan-300 to-blue-500',
  grass: 'from-lime-200 via-green-300 to-emerald-500', electric: 'from-yellow-200 via-amber-300 to-yellow-500',
  ghost: 'from-violet-300 via-purple-400 to-indigo-700', dragon: 'from-indigo-300 via-violet-400 to-indigo-600',
  normal: 'from-stone-200 via-amber-100 to-stone-400', ice: 'from-cyan-100 via-sky-200 to-cyan-400',
  fighting: 'from-amber-200 via-orange-300 to-red-600', poison: 'from-fuchsia-300 via-purple-400 to-fuchsia-700',
  ground: 'from-amber-200 via-yellow-600 to-amber-700', flying: 'from-sky-200 via-sky-300 to-indigo-300',
  psychic: 'from-pink-200 via-pink-300 to-fuchsia-500', bug: 'from-lime-200 via-lime-400 to-green-600',
  rock: 'from-stone-300 via-stone-400 to-stone-600', dark: 'from-neutral-500 via-neutral-700 to-neutral-900',
  steel: 'from-slate-200 via-slate-300 to-zinc-500', fairy: 'from-rose-100 via-pink-200 to-rose-400',
}

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_5px_0_rgba(0,0,0,0.35)]'

function ProgressTrack({ run }: { run: RunState }) {
  const total = run.totalChallengers
  if (total === null) {
    return <p className="text-sm text-white/70">Daily Challenge · <b className="text-gold-300">{run.challengerIndex}</b> {run.challengerIndex === 1 ? 'win' : 'wins'} so far · endless</p>
  }
  return (
    <ol className="flex items-center overflow-x-auto pb-1" aria-label={`Challenger ${run.challengerIndex + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const done = i < run.challengerIndex
        const current = i === run.challengerIndex
        const boss = BOSS_NODES[i]
        const base = done ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : current ? 'bg-gold-400 border-gold-300 text-ink-900' : 'bg-black/30 border-white/20 text-white/60'
        return (
          <li key={i} className="flex items-center shrink-0">
            {i > 0 && <span className={`w-3 sm:w-5 h-1 ${i <= run.challengerIndex ? 'bg-emerald-400' : 'bg-white/15'}`} />}
            <span
              aria-current={current ? 'step' : undefined}
              title={boss ? 'Boss' : undefined}
              className={`grid place-items-center border-2 text-[11px] font-black ${base} ${boss ? 'w-8 h-8 rotate-45 rounded-md' : 'w-7 h-7 rounded-full'}`}
            >
              <span className={boss ? '-rotate-45' : ''}>{done ? '✓' : boss ?? i + 1}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ScoutModal({ run, onClose, onBattle }: { run: RunState; onClose: () => void; onBattle: () => void }) {
  const t = challengerTrainer(run)
  return (
    <Modal title={t.name} onClose={onClose} wide>
      <div className="flex gap-4 items-start">
        <img src={trainerSprite(t.sprite)} alt="" className="w-24 h-24 object-contain bg-sky-200/80 rounded-lg border-2 border-black [image-rendering:pixelated]" />
        <div className="flex-1 flex flex-col gap-2">
          <span className="self-start text-[10px] font-black uppercase tracking-wider bg-black/50 text-gold-300 rounded px-2 py-0.5">{t.title}</span>
          <p className="rounded-lg bg-[#fdf6e6] text-ink-900 font-bold italic px-3 py-2">“{t.quote}”</p>
          <p className="text-xs text-white/60">Battle style: {t.style}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-4">
        {run.challenger.map(m => {
          const s = species(m.species)
          return (
            <div key={m.uid} className="flex gap-3 rounded-xl border border-white/15 bg-black/20 p-3">
              <img src={artworkUrl(m.species)} alt="" className="w-16 h-16 object-contain" />
              <div>
                <p><b>{s.name}</b> <span className="text-xs text-white/60">Lv {m.level}</span></p>
                <div className="flex gap-1 my-1">{s.types.map(x => <TypeBadge key={x} type={x} small />)}</div>
                <p className="text-[11px] text-white/60">Possible abilities: {s.abilities.join(', ')}</p>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-sm text-white/70 mt-3 flex flex-wrap items-center gap-1.5">
        Your type <TypeBadge type={run.gymType} small /> is weak to {WEAK_TO[run.gymType].map(w => <TypeBadge key={w} type={w} small />)}
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 font-bold text-sm">Back to the Gym</button>
        <button onClick={onBattle} className="rounded-lg bg-gold-400 text-ink-900 hover:bg-gold-300 px-4 py-2 font-black text-sm">Accept the challenge ⚔</button>
      </div>
    </Modal>
  )
}

type Tab = 'team' | 'bag' | 'log'

export function GymScreen() {
  const run = useRunStore(s => s.run)!
  const startBattle = useRunStore(s => s.startBattle)
  const go = useUiStore(s => s.go)
  const [tab, setTab] = useState<Tab>('team')
  const [teamUid, setTeamUid] = useState<string | null>(null)
  const [scout, setScout] = useState(false)

  const trainer = challengerTrainer(run)
  const lead = run.roster.find(m => (m.hp ?? 1) > 0)
  const challengerTypes = [...new Set(run.challenger.flatMap(m => species(m.species).types))]
  const threats = threatsTo(run.gymType, run.challenger.map(m => species(m.species).types))
  const level = Math.max(...run.challenger.map(m => m.level))
  const bag = run.bag ?? { potion: 0, revive: 0, candy: 0, stone: 0 }
  const canFight = !!lead

  return (
    <div className="home-bg min-h-screen text-white font-sans px-3 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <header className={`${panel} px-4 py-3 flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <button onClick={() => go('home')} aria-label="Home" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-lg">☰</button>
            <div className="flex-1 min-w-0">
              <h1 className="pixel-title text-base sm:text-lg [text-shadow:none] truncate">{gymName(run.gymType)}</h1>
              <p className="text-xs text-white/60">
                {run.totalChallengers === null ? 'Daily Challenge' : <>Challenger <b className="text-white">{run.challengerIndex + 1}</b>/{run.totalChallengers}</>}
              </p>
            </div>
            <span className="rounded-full bg-black/40 px-3 py-1 font-black text-gold-300 tabular-nums">💰 {run.funds ?? 0}</span>
          </div>
          <ProgressTrack run={run} />
        </header>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
          {/* Challenger */}
          <section className={`${panel} overflow-hidden`}>
            <div className={`relative h-56 sm:h-64 bg-gradient-to-br ${ARENA[run.gymType]}`}>
              <img src={trainerSprite(LEADER_SPRITE[run.gymType])} alt="" className="absolute left-[6%] bottom-4 h-32 sm:h-40 [image-rendering:pixelated] drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
              {lead && <img src={battleSpriteUrl(lead.species, false)} alt="" className="absolute left-[30%] bottom-4 h-20 sm:h-24 [image-rendering:pixelated] -scale-x-100" />}
              <span className="pixel-title absolute left-1/2 top-1/3 -translate-x-1/2 text-gold-400 text-3xl">VS</span>
              <img src={trainerSprite(trainer.sprite)} alt="" className="absolute right-[6%] bottom-4 h-32 sm:h-40 [image-rendering:pixelated] -scale-x-100 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
            </div>
            <div className="p-4 flex flex-col gap-3 border-t-2 border-black">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/60">{trainer.title}</p>
                  <h2 className="pixel-title text-lg [text-shadow:none]">{trainer.name}</h2>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {challengerTypes.map(t => <TypeBadge key={t} type={t} small />)}
                    {threats > 0 && <span className="text-[10px] font-bold rounded px-1.5 bg-red-900/60 text-red-200">⚠ {threats} strong vs you</span>}
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  {run.challenger.map(m => <img key={m.uid} src={battleSpriteUrl(m.species, false)} alt={species(m.species).name} className="h-10 [image-rendering:pixelated]" />)}
                  <span className="text-xs text-white/70 ml-1">Lv {level}</span>
                </div>
              </div>
              <p className="rounded-lg bg-[#fdf6e6] text-ink-900 font-bold px-3 py-2">“{trainer.quote}”</p>
              {!canFight && <p role="alert" className="text-sm rounded-lg bg-red-900/60 px-3 py-2">All your Pokémon have fainted. Revive one from the Team tab to battle.</p>}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setScout(true)} className="rounded-xl bg-white/10 hover:bg-white/15 border-2 border-black py-3 font-black">Scout team</button>
                <button disabled={!canFight} onClick={startBattle} className="rounded-xl bg-gold-400 text-ink-900 hover:bg-gold-300 border-2 border-black py-3 font-black disabled:opacity-40 shadow-[0_4px_0_#b8431a]">Battle! ⚔</button>
              </div>
            </div>
          </section>

          {/* Team / Bag / Log */}
          <section className={`${panel} p-3`}>
            <div role="tablist" className="flex gap-1.5 mb-3">
              {(['team', 'bag', 'log'] as Tab[]).map(t => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg border-2 py-1.5 text-sm font-bold capitalize ${tab === t ? 'border-gold-400 bg-gold-400/10 text-gold-300' : 'border-white/10 hover:bg-white/5'}`}>
                  {t === 'team' ? '🔴 Team' : t === 'bag' ? '🎒 Bag' : '📜 Log'}
                </button>
              ))}
            </div>

            {tab === 'team' && (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }, (_, i) => run.roster[i]).map((m, i) => {
                  if (!m) return <div key={i} className="h-20 rounded-lg border border-dashed border-white/15 grid place-items-center text-xs text-white/35">Empty slot</div>
                  const hp = m.hp ?? 1
                  return (
                    <button key={m.uid} onClick={() => setTeamUid(m.uid)} className="relative h-20 rounded-lg bg-black/25 hover:bg-white/5 border-2 border-black flex items-center gap-2 px-2 text-left">
                      {m === lead && <span className="absolute -top-1.5 left-1.5 text-[9px] font-black bg-gold-400 text-ink-900 rounded px-1">LEAD</span>}
                      <img src={artworkUrl(m.species)} alt="" className={`w-14 h-14 object-contain ${hp <= 0 ? 'grayscale opacity-50' : ''}`} />
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold truncate">{species(m.species).name}</span>
                        <span className="block text-[11px] text-white/60">Lv {m.level}{hp <= 0 && <span className="ml-1 font-bold bg-white/15 rounded px-1">FNT</span>}{m.item && ` · ${m.item}`}</span>
                        <span className="block h-1.5 mt-1 rounded-full bg-black/60 overflow-hidden"><span className={`block h-full ${hp > 0.5 ? 'bg-emerald-400' : hp > 0.25 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${hp * 100}%` }} /></span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {tab === 'bag' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BAG_INFO) as BagItem[]).map(b => (
                    <div key={b} className={`rounded-lg border-2 border-black bg-black/25 px-3 py-2 ${bag[b] ? '' : 'opacity-45'}`} title={BAG_INFO[b].desc}>
                      <p className="font-bold text-sm">{BAG_INFO[b].icon} {BAG_INFO[b].name}</p>
                      <p className="text-xs text-gold-300">×{bag[b]}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/50 mt-1">Held items</h3>
                {(run.heldItems ?? []).length ? (
                  <ul className="text-sm space-y-1">{run.heldItems!.map((h, i) => <li key={i}><b>{h}</b> <span className="text-white/60">· {heldItemDesc(h)}</span></li>)}</ul>
                ) : <p className="text-sm text-white/50">No spare held items.</p>}
                <p className="text-xs text-white/50">Open a Pokémon from the Team tab to use items or give it a held item.</p>
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

      {teamUid && <TeamModal uid={teamUid} onClose={() => setTeamUid(null)} />}
      {scout && <ScoutModal run={run} onClose={() => setScout(false)} onBattle={() => { setScout(false); startBattle() }} />}
    </div>
  )
}
