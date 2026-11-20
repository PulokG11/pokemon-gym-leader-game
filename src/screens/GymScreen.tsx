import { useState } from 'react'
import { ItemIcon, itemSprite } from '../components/ItemIcon'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import { artworkUrl, battleSpriteUrl, effectiveness, species } from '../lib/dex'
import { BAG_INFO, heldItemDesc, type BagItem } from '../lib/economy'
import { BOSS_NODES, LEADER_SPRITE, challengerTrainer, gymName, trainerSprite } from '../lib/trainers'
import { WEAK_TO, threatsTo } from '../lib/typechart'
import { scoutReport, upgradesFor } from '../lib/upgrades'
import { readyEvolutions } from '../lib/progression'
import { TypeBadge } from '../components/TypeBadge'
import { TeamModal } from '../components/TeamModal'
import { Modal } from '../components/Modal'
import type { RunState } from '../types/game'
import { ArenaBackdrop } from '../components/ArenaBackdrop'


const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_5px_0_rgba(0,0,0,0.35)]'

const cap = (t: string) => t[0].toUpperCase() + t.slice(1)
/** The challenger Pokémon has a type your Gym type is weak to. */
const isThreat = (run: RunState, types: string[]) => types.some(t => WEAK_TO[run.gymType].includes(t.toLowerCase() as never))
/** Your Gym type's attacks hit this Pokémon super-effectively. */
const isWeakToYou = (run: RunState, types: string[]) => effectiveness(cap(run.gymType), types) >= 2

function ProgressTrack({ run }: { run: RunState }) {
  const total = run.totalChallengers
  if (run.endless) {
    const wins = run.challengerIndex - (run.losses ?? 0)
    return (
      <p className="text-sm text-white/70">
        Endless · <b className="text-emerald-300">{wins}</b> {wins === 1 ? 'win' : 'wins'} · <b className="text-red-300">{run.losses ?? 0}</b> {run.losses === 1 ? 'loss' : 'losses'} · you keep the title whatever happens
      </p>
    )
  }
  if (total === null) {
    return <p className="text-sm text-white/70">Daily Challenge · <b className="text-gold-300">{run.challengerIndex}</b> {run.challengerIndex === 1 ? 'win' : 'wins'} so far · endless</p>
  }
  return (
    <ol className="flex items-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] py-1" aria-label={`Challenger ${run.challengerIndex + 1} of ${total}`}>
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

function ScoutDetails({ report }: { report: ReturnType<typeof scoutReport> }) {
  return (
    <div className="flex flex-col gap-1 text-[11px]">
      <p className="text-white/70"><span className="text-white/45">Ability</span> <b className="text-white">{report.ability}</b></p>
      <p className="text-white/70 flex items-center gap-1">
        <span className="text-white/45">Item</span>
        {report.item ? <><ItemIcon src={itemSprite({ held: report.item })} className="w-5 h-5" /><b className="text-white" title={heldItemDesc(report.item)}>{report.item}</b></> : <span>none</span>}
      </p>
      <ul className="grid grid-cols-2 gap-1 mt-0.5" aria-label="Moves">
        {report.moves.map(mv => (
          <li key={mv.id} className={`rounded px-1.5 py-0.5 font-bold ${mv.superEffective ? 'bg-red-900/70 text-red-100' : 'bg-white/5 text-white/85'}`} title={`${mv.type}${mv.power ? ` · ${mv.power}` : ''}${mv.superEffective ? ' · super effective on your type' : ''}`}>
            {mv.superEffective && <span aria-label="super effective on your type">⚠ </span>}{mv.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoutModal({ run, onClose, onBattle }: { run: RunState; onClose: () => void; onBattle: () => void }) {
  const t = challengerTrainer(run)
  const scouted = (run.upgrades ?? []).includes('scouting')
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
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {isThreat(run, s.types) && <span className="text-[10px] font-black rounded px-1.5 py-0.5 bg-red-900/70 text-red-200">⚠ THREAT</span>}
                  {isWeakToYou(run, s.types) && <span className="text-[10px] font-black rounded px-1.5 py-0.5 bg-emerald-900/70 text-emerald-200">✓ WEAK TO YOU</span>}
                </div>
                <div className="flex gap-1 my-1">{s.types.map(x => <TypeBadge key={x} type={x} small />)}</div>
                {scouted ? (
                  <ScoutDetails report={scoutReport(m, run.gymType)} />
                ) : (
                  <p className="text-[11px] text-white/60">Possible abilities: {s.abilities.join(', ')}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {!scouted && run.mode !== 'daily' && (
        <p className="text-xs text-white/60 mt-3 rounded-lg border border-dashed border-white/20 px-3 py-2">
          ⌕ Build the <b className="text-white">Scouting Room</b> (Upgrades tab) to see each challenger’s exact moves, ability and held item.
        </p>
      )}
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

function UpgradesTab() {
  const run = useRunStore(s => s.run)!
  const buyUpgrade = useRunStore(s => s.buyUpgrade)
  const [message, setMessage] = useState<string | null>(null)
  if (run.mode === 'daily') return <p className="text-sm text-white/60 p-2">The Daily Challenge has no Gym upgrades: everyone plays on equal terms.</p>
  const owned = run.upgrades ?? []
  return (
    <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto pr-1">
      {message && <p role="status" className="rounded-lg bg-gold-400/15 border border-gold-400/40 px-3 py-1.5 text-sm">{message}</p>}
      {upgradesFor(run.gymType).map(u => {
        const built = owned.includes(u.id)
        const afford = (run.funds ?? 0) >= u.price
        return (
          <div key={u.id} className={`flex items-center gap-3 rounded-lg border-2 p-2.5 ${u.typed ? 'border-ember-600/70 bg-ember-700/15' : 'border-black bg-black/25'}`}>
            <span className="w-9 h-9 shrink-0 rounded-md bg-black/50 grid place-items-center text-lg" aria-hidden="true">{u.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">{u.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/45">{u.category}</p>
              <p className="text-xs text-white/70">{u.desc}</p>
            </div>
            {built ? (
              <span className="shrink-0 text-xs font-black text-emerald-300">Built ✓</span>
            ) : (
              <button
                disabled={!afford}
                onClick={() => setMessage(buyUpgrade(u.id).message)}
                className="shrink-0 rounded-lg bg-gold-400 text-ink-900 border-2 border-black px-2.5 py-1 text-xs font-black disabled:opacity-40 leading-tight"
              >
                Build<br />₽{u.price}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

type Tab = 'team' | 'upgrades' | 'bag' | 'log'
const TAB_LABEL: Record<Tab, string> = { team: 'Team', upgrades: 'Upgrades', bag: 'Bag', log: 'Log' }
const TAB_ICON: Record<Tab, string> = { team: 'Poke Ball', upgrades: 'Up-Grade', bag: 'Explorer Kit', log: 'Town Map' }

export function GymScreen() {
  const run = useRunStore(s => s.run)!
  const startBattle = useRunStore(s => s.startBattle)
  const go = useUiStore(s => s.go)
  const [tab, setTab] = useState<Tab>('team')
  const [teamUid, setTeamUid] = useState<string | null>(null)
  const [scout, setScout] = useState(false)
  const [retire, setRetire] = useState(false)
  const retireRun = useRunStore(s => s.retireRun)

  const trainer = challengerTrainer(run)
  const lead = run.roster.find(m => (m.hp ?? 1) > 0)
  const challengerTypes = [...new Set(run.challenger.flatMap(m => species(m.species).types))]
  const threats = threatsTo(run.gymType, run.challenger.map(m => species(m.species).types))
  const weakToYou = run.challenger.filter(m => isWeakToYou(run, species(m.species).types)).length
  const introDismissed = useSettingsStore(s => s.introDismissed)
  const dismissIntro = useSettingsStore(s => s.dismissIntro)
  const evolvable = run.roster.filter(m => readyEvolutions(m).length > 0)
  const showIntro = !introDismissed && run.challengerIndex === 0 && run.mode === 'quest'
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
              <h1 className="font-ui font-bold text-xl sm:text-2xl truncate flex items-center gap-2">
                <span className="truncate">{gymName(run.gymType)}</span>
                {run.format === 'doubles' && <span className="shrink-0 text-[11px] font-black rounded-md bg-sky-500/25 border border-sky-300/50 text-sky-200 px-1.5 py-0.5">Doubles</span>}
              </h1>
              <p className="text-xs text-white/60">
                {run.endless ? <>Endless · challenger <b className="text-white">#{run.challengerIndex + 1}</b></> : run.totalChallengers === null ? 'Daily Challenge' : <>Challenger <b className="text-white">{run.challengerIndex + 1}</b>/{run.totalChallengers}</>}
              </p>
            </div>
            {run.endless && (
              <button onClick={() => setRetire(true)} className="shrink-0 rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black px-2.5 py-1 text-xs font-bold">Retire</button>
            )}
            <span className="rounded-full bg-black/40 px-3 py-1 font-black text-gold-300 tabular-nums"><ItemIcon src={itemSprite({ held: 'Amulet Coin' })} className="w-5 h-5 inline-block align-[-4px]" alt="" /> ₽{run.funds ?? 0}</span>
          </div>
          <ProgressTrack run={run} />
        </header>

        {showIntro && (
          <section className={`${panel} px-4 py-3 relative`} aria-label="First run">
            <button onClick={dismissIntro} aria-label="Dismiss tips" className="absolute top-2 right-2 w-8 h-8 rounded-lg hover:bg-white/10 text-white/70">✕</button>
            <h2 className="font-ui font-bold text-lg text-gold-300">First run</h2>
            <ul className="mt-1.5 grid sm:grid-cols-3 gap-3 text-sm text-white/85 pr-6">
              <li><b className="text-white">Your goal.</b> {run.endless ? 'Win as many battles as you can. Losing doesn’t end the run: your team is healed and the next challenger steps in. Retire whenever you like.' : `Defend the Gym against ${run.totalChallengers} challengers. Lose once and you lose your title.`} Every win pays prize money and offers a reward.</li>
              {run.endless
                ? <li><b className="text-white">Your score.</b> Wins are your score; losses are counted too. Press Retire to end the run and save the result to your records.</li>
                : <li><b className="text-white">Losing is progress.</b> Every win still counts when the run ends: it is saved to your records and the Ranking. Learn the matchups and go again.</li>}
              <li><b className="text-white">Tip.</b> Press Scout team before each battle: <span className="text-red-200">⚠ THREAT</span> Pokémon hit your type hard, <span className="text-emerald-200">✓ WEAK TO YOU</span> ones are easy targets.</li>
            </ul>
          </section>
        )}

        {evolvable.length > 0 && (
          <button
            onClick={() => setTeamUid(evolvable[0].uid)}
            className="rounded-xl bg-amber-400/15 border-2 border-amber-400/60 hover:bg-amber-400/25 px-4 py-2.5 flex items-center gap-3 text-left"
          >
            <span className="flex -space-x-2">{evolvable.slice(0, 4).map(m => <img key={m.uid} src={battleSpriteUrl(m.species, false)} alt="" className="h-9 [image-rendering:pixelated]" />)}</span>
            <span className="flex-1 font-bold text-amber-200">✦ {evolvable.length} Pokémon can evolve</span>
            <span className="text-xs font-black rounded-lg bg-amber-400 text-ink-900 border-2 border-black px-2.5 py-1">View</span>
          </button>
        )}

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
          {/* Challenger */}
          <section className={`${panel} overflow-hidden`}>
            <ArenaBackdrop type={run.gymType} className="h-56 sm:h-64">
              <img src={trainerSprite(LEADER_SPRITE[run.gymType])} alt="" className="absolute left-[6%] bottom-4 h-32 sm:h-40 [image-rendering:pixelated] drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
              {lead && <img src={battleSpriteUrl(lead.species, false)} alt="" className="absolute left-[30%] bottom-4 h-20 sm:h-24 [image-rendering:pixelated] -scale-x-100" />}
              <span className="pixel-title absolute left-1/2 top-[30%] -translate-x-1/2 text-gold-400 text-3xl">VS</span>
              <img src={trainerSprite(trainer.sprite)} alt="" className="absolute right-[6%] bottom-4 h-32 sm:h-40 [image-rendering:pixelated] -scale-x-100 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" />
            </ArenaBackdrop>
            <div className="p-4 flex flex-col gap-3 border-t-2 border-black">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/60">{trainer.title}</p>
                  <h2 className="font-ui font-bold text-2xl leading-tight">{trainer.name}</h2>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {challengerTypes.map(t => <TypeBadge key={t} type={t} small />)}
                    {threats > 0 && <span className="text-[10px] font-bold rounded px-1.5 bg-red-900/60 text-red-200">⚠ {threats} strong vs you</span>}
                    {weakToYou > 0 && <span className="text-[10px] font-bold rounded px-1.5 bg-emerald-900/60 text-emerald-200">✓ {weakToYou} weak to you</span>}
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
              {(['team', 'upgrades', 'bag', 'log'] as Tab[]).map(t => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg border-2 py-1.5 text-sm font-bold capitalize ${tab === t ? 'border-gold-400 bg-gold-400/10 text-gold-300' : 'border-white/10 hover:bg-white/5'}`}>
                  <span className="flex items-center justify-center gap-1"><ItemIcon src={itemSprite({ held: TAB_ICON[t] })} className="w-5 h-5" />{TAB_LABEL[t]}</span>
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
                      {readyEvolutions(m).length > 0 && <span className="absolute -top-1.5 right-1.5 text-[9px] font-black bg-amber-400 text-ink-900 rounded px-1">✦ EVOLVE</span>}
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

            {tab === 'upgrades' && <UpgradesTab />}

            {tab === 'bag' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BAG_INFO) as BagItem[]).map(b => (
                    <div key={b} className={`rounded-lg border-2 border-black bg-black/25 px-3 py-2 ${bag[b] ? '' : 'opacity-45'}`} title={BAG_INFO[b].desc}>
                      <p className="font-bold text-sm flex items-center gap-1.5"><ItemIcon src={itemSprite({ bag: b })} className="w-7 h-7" />{BAG_INFO[b].name}</p>
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
      {retire && (
        <Modal title="Retire as Gym Leader?" onClose={() => setRetire(false)}>
          <p className="text-sm text-white/80">This ends the Endless run and saves <b className="text-white">{run.challengerIndex - (run.losses ?? 0)} wins</b> and {run.losses ?? 0} losses to your records.</p>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setRetire(false)} className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 font-bold text-sm">Keep defending</button>
            <button onClick={() => { setRetire(false); retireRun() }} className="rounded-lg bg-red-500 hover:bg-red-400 text-white px-4 py-2 font-black text-sm">Retire</button>
          </div>
        </Modal>
      )}
      {scout && <ScoutModal run={run} onClose={() => setScout(false)} onBattle={() => { setScout(false); startBattle() }} />}
    </div>
  )
}
