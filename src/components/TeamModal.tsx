import { useState } from 'react'
import { ItemIcon, itemSprite } from './ItemIcon'
import { useRunStore } from '../store/runStore'
import { artworkUrl, species } from '../lib/dex'
import { BAG_INFO, heldItemDesc, type BagItem } from '../lib/economy'
import { Modal } from './Modal'
import { TypeBadge } from './TypeBadge'
import { MoveInfo } from './MoveInfo'

/** One team member: HP, moves, held item, order, and bag items to use on it. */
export function TeamModal({ uid, onClose }: { uid: string; onClose: () => void }) {
  const run = useRunStore(s => s.run)!
  const { useBagItem, giveHeldItem, takeHeldItem, moveMember } = useRunStore()
  const [selected, setSelected] = useState(uid)
  const [message, setMessage] = useState<string | null>(null)
  const m = run.roster.find(x => x.uid === selected) ?? run.roster[0]
  if (!m) return null
  const s = species(m.species)
  const hp = m.hp ?? 1
  const index = run.roster.indexOf(m)
  const bag = run.bag ?? { potion: 0, revive: 0, candy: 0, stone: 0 }

  return (
    <Modal title="Team" onClose={onClose} wide>
      <div className="flex gap-2 mb-4 flex-wrap">
        {run.roster.map(x => (
          <button
            key={x.uid}
            onClick={() => { setSelected(x.uid); setMessage(null) }}
            className={`w-12 h-12 rounded-lg border-2 ${x.uid === m.uid ? 'border-gold-400 bg-white/10' : 'border-white/10 hover:bg-white/5'}`}
          >
            <img src={artworkUrl(x.species)} alt={species(x.species).name} className={`w-full h-full object-contain ${(x.hp ?? 1) <= 0 ? 'grayscale opacity-50' : ''}`} />
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-[14rem_1fr] gap-5">
        <div className="flex flex-col gap-2">
          <div className="rounded-xl bg-black/30 p-3 flex flex-col items-center">
            <img src={artworkUrl(m.species)} alt="" className={`w-32 h-32 object-contain ${hp <= 0 ? 'grayscale opacity-60' : ''}`} />
            <p className="font-black text-lg">
              {s.name} {index === 0 && <span className="ml-1 text-[10px] bg-gold-400 text-ink-900 rounded px-1 align-middle">LEAD</span>}
            </p>
            <div className="flex items-center gap-1.5 mt-1">{s.types.map(t => <TypeBadge key={t} type={t} small />)}<span className="text-sm text-white/70">Lv {m.level}</span></div>
            <div className="w-full mt-2">
              <div className="flex justify-between text-[11px] text-white/60"><span>HP</span><span>{hp <= 0 ? 'FNT' : `${Math.round(hp * 100)}%`}</span></div>
              <div className="h-2 rounded-full bg-black/60 overflow-hidden"><div className={`h-full ${hp > 0.5 ? 'bg-emerald-400' : hp > 0.25 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${hp * 100}%` }} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(BAG_INFO) as BagItem[]).map(item => (
              <button
                key={item}
                disabled={!bag[item]}
                onClick={() => setMessage(useBagItem(item, m.uid).message)}
                title={BAG_INFO[item].desc}
                className="rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed px-2 py-1.5 text-left text-xs font-bold"
              >
                <span className="flex items-center gap-1.5"><ItemIcon src={itemSprite({ bag: item })} className="w-6 h-6" />{BAG_INFO[item].name} <span className="text-gold-300">×{bag[item]}</span></span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button disabled={index === 0} onClick={() => moveMember(m.uid, -1)} className="flex-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-35 py-1.5 text-xs font-bold">◀ Move up</button>
            <button disabled={index === run.roster.length - 1} onClick={() => moveMember(m.uid, 1)} className="flex-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-35 py-1.5 text-xs font-bold">Move down ▶</button>
          </div>
          <p className="text-[11px] text-white/50">The first conscious Pokémon leads. Fainted Pokémon sit out until revived.</p>
        </div>

        <div className="flex flex-col gap-3">
          {message && <p role="status" className="rounded-lg bg-gold-400/15 border border-gold-400/40 px-3 py-2 text-sm">{message}</p>}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Moves</h3>
            <div className="grid sm:grid-cols-2 gap-1.5">{m.moves.map(mv => <MoveInfo key={mv} id={mv} />)}</div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Held item</h3>
            {m.item ? (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
                <span className="text-sm"><b>{m.item}</b> <span className="text-white/60">· {heldItemDesc(m.item)}</span></span>
                <button onClick={() => takeHeldItem(m.uid)} className="text-xs font-bold text-white/70 hover:text-white shrink-0">Take</button>
              </div>
            ) : (
              <p className="text-sm text-white/50">No held item.</p>
            )}
            {(run.heldItems ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[...new Set(run.heldItems)].map(item => (
                  <button key={item} onClick={() => giveHeldItem(item, m.uid)} title={heldItemDesc(item)} className="rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1 text-xs font-bold">
                    Give {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
