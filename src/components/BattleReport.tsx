import { ItemIcon, itemSprite } from './ItemIcon'
import { Modal } from './Modal'
import { MoveChip } from './MoveChip'
import { EvolveButtons } from './Evolution'
import { artworkUrl, move, species } from '../lib/dex'
import { xpForLevel } from '../lib/progression'
import type { RunState } from '../types/game'

const hpColor = (f: number) => (f > 0.5 ? 'bg-emerald-400' : f > 0.25 ? 'bg-yellow-400' : 'bg-red-500')

/** After a win: every team member's HP, XP, level-ups, new moves and evolutions, with Evolve buttons. */
export function BattleReport({ run, onClose, onOpenTeam }: { run: RunState; onClose: () => void; onOpenTeam: (uid: string) => void }) {
  return (
    <Modal title="Battle report" onClose={onClose} wide>
      <p className="text-gold-300 font-extrabold mb-3">
        <ItemIcon src={itemSprite({ held: 'Amulet Coin' })} className="w-5 h-5 inline-block align-[-4px]" alt="" /> +₽{run.lastFunds ?? 0} Gym Funds
      </p>
      <ul className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {run.roster.map(m => {
          const r = run.lastProgress.find(p => p.uid === m.uid)
          const s = species(m.species)
          const hp = m.hp ?? 1
          const floor = xpForLevel(m.level)
          const pct = Math.min(100, Math.max(0, ((m.xp - floor) / (xpForLevel(m.level + 1) - floor)) * 100))
          const learned = r?.events.filter(e => e.kind === 'learn') ?? []
          return (
            <li key={m.uid} className="rounded-xl bg-black/30 border-2 border-black p-3 flex gap-3 items-start">
              <img src={artworkUrl(m.species)} alt="" className={`w-16 h-16 object-contain shrink-0 ${hp <= 0 ? 'grayscale opacity-50' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-ui font-bold text-lg">{s.name}</span>
                  <span className="text-sm tabular-nums">
                    {r && r.before.level !== r.after.level
                      ? <><span className="text-white/50">Lv {r.before.level}</span> → <span className="text-emerald-300 font-bold">Lv {m.level}</span></>
                      : <span className="text-white/75">Lv {m.level}</span>}
                  </span>
                  {r && <span className="text-[11px] text-sky-300">+{r.xpGained.toLocaleString()} XP</span>}
                </div>
                <div className="grid grid-cols-[2rem_1fr] items-center gap-x-2 gap-y-1 mt-1 text-[10px] font-bold text-white/60">
                  <span>HP</span>
                  {hp <= 0
                    ? <span className="justify-self-start rounded bg-white/15 px-1.5 text-white">FNT</span>
                    : <span className="h-1.5 rounded-full bg-black/60 overflow-hidden"><span className={`block h-full ${hpColor(hp)}`} style={{ width: `${hp * 100}%` }} /></span>}
                  <span>XP</span>
                  <span className="h-1 rounded-full bg-black/60 overflow-hidden"><span className="block h-full bg-sky-400" style={{ width: `${pct}%` }} /></span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">{m.moves.map(mv => <MoveChip key={mv} id={mv} />)}</div>
                {learned.map((e, i) => e.kind === 'learn' && (
                  e.offered ? (
                    <p key={i} className="text-xs mt-1.5 text-gold-300">
                      New move ★ <b>{move(e.move)?.name ?? e.move}</b>{' '}
                      {m.moves.includes(e.move) ? '(swapped in)' : <button onClick={() => onOpenTeam(m.uid)} className="underline underline-offset-2 hover:text-gold-400">swap in from Team</button>}
                    </p>
                  ) : (
                    <p key={i} className="text-xs mt-1.5 text-sky-300">Learned <b>{move(e.move)?.name ?? e.move}</b></p>
                  )
                ))}
                <EvolveButtons mon={m} />
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-white/50 mt-3">Conscious Pokémon recover 10% HP after every win. Fainted ones need a Revive.</p>
      <button autoFocus onClick={onClose} className="w-full mt-3 rounded-lg bg-gold-400 text-ink-900 font-black py-2.5 border-2 border-black shadow-[0_4px_0_#b8431a] hover:bg-gold-300">
        Continue
      </button>
    </Modal>
  )
}
