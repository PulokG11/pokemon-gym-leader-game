import { useState } from 'react'
import { ItemIcon, itemSprite } from '../components/ItemIcon'
import { useRunStore } from '../store/runStore'
import { artworkUrl, species } from '../lib/dex'
import { BAG_INFO, heldItemDesc, type BagItem } from '../lib/economy'
import { TeamStrip } from '../components/TeamStrip'
import { TeamModal } from '../components/TeamModal'

const TRAINER = (name: string) => `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`

function EventCard({ sprite, title, desc, onClick }: { sprite: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl bg-ink-900 border-2 border-black/50 p-5 flex flex-col items-center gap-2 hover:-translate-y-1 hover:bg-ink-800 transition-all shadow-[0_5px_0_rgba(0,0,0,0.35)]">
      <img src={TRAINER(sprite)} alt="" className="h-28 [image-rendering:pixelated]" />
      <span className="font-ui font-bold text-xl">{title}</span>
      <span className="text-sm text-white/70 text-center">{desc}</span>
    </button>
  )
}

export function EventScreen() {
  const run = useRunStore(s => s.run)!
  const { chooseEvent, campTrain, buy, finishEvent } = useRunStore()
  const [teamUid, setTeamUid] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const bag = run.bag ?? { potion: 0, revive: 0, candy: 0, stone: 0 }
  const fainted = run.roster.filter(m => (m.hp ?? 1) <= 0).length

  return (
    <div className="home-bg min-h-screen text-white font-sans px-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <h1 className="screen-title text-3xl sm:text-4xl text-center">
          What’s next?
        </h1>
        <TeamStrip roster={run.roster} onSelect={setTeamUid} />
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="rounded-lg bg-ink-900 border-2 border-black/50 px-3 py-1 font-extrabold text-gold-300"><ItemIcon src={itemSprite({ held: 'Amulet Coin' })} className="w-5 h-5 inline-block align-[-4px]" alt="" /> ₽{run.funds}</span>
          {(Object.keys(BAG_INFO) as BagItem[]).map(b => (
            <span key={b} title={BAG_INFO[b].name} className="flex items-center gap-1 rounded-lg bg-ink-900/80 pl-1 pr-2 py-0.5 text-xs font-bold"><ItemIcon src={itemSprite({ bag: b })} className="w-6 h-6" alt={BAG_INFO[b].name} />×{bag[b]}</span>
          ))}
        </div>
        {fainted > 0 && (
          <p className="text-center text-sm bg-ink-900/80 rounded-lg px-3 py-2">
            {fainted} fainted Pokémon will sit out. Tap one above to use a Revive.
          </p>
        )}
        {message && <p role="status" className="text-center rounded-lg bg-ink-900 border border-gold-400/50 px-3 py-2 text-sm">{message}</p>}

        {!run.event && (
          <div className="grid sm:grid-cols-2 gap-3">
            <EventCard sprite="blackbelt" title="Training Camp" desc="Free levels for one Pokémon or the whole team." onClick={() => chooseEvent('camp')} />
            <EventCard sprite="clerk" title="Visiting Merchant" desc="Spend Gym Funds on what’s in stock today." onClick={() => chooseEvent('merchant')} />
          </div>
        )}

        {run.event === 'camp' && (
          <section className="rounded-xl bg-ink-900 border-2 border-black/50 p-4">
            <h2 className="font-black text-lg">Training Camp</h2>
            {run.campUsed ? (
              <p className="text-sm text-white/70 mt-1">Training is done. Good luck in the next battle!</p>
            ) : (
              <>
                <p className="text-sm text-white/70 mt-1 mb-3">Pick one: a Pokémon gains 3 levels, or the whole team gains 1.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {run.roster.map(m => (
                    <button key={m.uid} onClick={() => setMessage(campTrain(m.uid).message)} className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2 flex flex-col items-center">
                      <img src={artworkUrl(m.species)} alt="" className="h-14 object-contain" />
                      <span className="text-sm font-bold">{species(m.species).name}</span>
                      <span className="text-xs text-emerald-300">Lv {m.level} → {Math.min(100, m.level + 3)}</span>
                    </button>
                  ))}
                  <button onClick={() => setMessage(campTrain('team').message)} className="rounded-xl border-2 border-dashed border-gold-400/60 hover:bg-white/5 p-2 font-bold text-sm">
                    Whole team +1 level
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {run.event === 'merchant' && (
          <section className="rounded-xl bg-ink-900 border-2 border-black/50 p-4">
            <h2 className="font-black text-lg">Visiting Merchant</h2>
            <p className="text-sm text-white/70 mt-1 mb-3">Bought items go to your bag. Use them from the team above.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(run.stock ?? []).map(s => {
                const name = s.kind === 'bag' ? BAG_INFO[s.item as BagItem].name : s.item
                const icon = s.kind === 'bag' ? itemSprite({ bag: s.item as BagItem }) : itemSprite({ held: s.item })
                const desc = s.kind === 'bag' ? BAG_INFO[s.item as BagItem].desc : heldItemDesc(s.item)
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
                    <ItemIcon src={icon} className="w-8 h-8 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{name}</p>
                      <p className="text-xs text-white/60">{desc}</p>
                    </div>
                    <button
                      disabled={(run.funds ?? 0) < s.price}
                      onClick={() => setMessage(buy(s.id).message)}
                      className="shrink-0 rounded-lg bg-gold-400 text-ink-900 font-black text-xs px-3 py-1.5 disabled:opacity-40"
                    >
                      ₽{s.price}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <div className="flex justify-center">
          <button onClick={finishEvent} className="rounded-xl bg-gold-400 text-ink-900 font-black px-8 py-3 shadow-[0_5px_0_#b8431a] hover:bg-gold-300">
            Back to the Gym ▶
          </button>
        </div>
      </div>
      {teamUid && <TeamModal uid={teamUid} onClose={() => setTeamUid(null)} />}
    </div>
  )
}
