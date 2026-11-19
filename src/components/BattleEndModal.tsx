import { useEffect, useMemo, useRef } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { trainerSprite, type Trainer } from '../lib/trainers'

const COLORS = ['#f6c443', '#ef6a2f', '#ffffff', '#3b82f6']

function Confetti() {
  const pieces = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
    })),
    [],
  )
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute -top-4 w-2.5 h-1.5 animate-[confetti_linear_forwards]"
          style={{ left: `${p.left}%`, background: p.color, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`, rotate: `${p.rotate}deg` }}
        />
      ))}
    </div>
  )
}

/** "Gym Defended!" (with confetti) or "Gym Fallen…" at the end of a battle. */
export function BattleEndModal({ won, trainer, onContinue, regional, retries = 0 }: {
  won: boolean; trainer: Trainer; onContinue: () => void; regional?: boolean; retries?: number
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const effects = useSettingsStore(s => s.effects)
  useEffect(() => { ref.current?.showModal() }, [])

  return (
    <>
      {won && effects === 'full' && <Confetti />}
      <dialog
        ref={ref}
        onCancel={e => e.preventDefault()}
        className="m-auto w-[min(92vw,26rem)] rounded-xl bg-ink-900 text-white border-2 border-black border-t-8 border-t-gold-400 p-5 backdrop:bg-black/60 font-sans shadow-[0_8px_0_rgba(0,0,0,0.4)]"
      >
        <h2 className={`pixel-title text-center text-2xl ${won ? 'text-gold-400' : 'text-red-400'} [text-shadow:2px_2px_0_#000]`}>
          {regional ? (won ? 'Victory!' : 'Defeated…') : won ? 'Gym defended!' : 'Gym fallen…'}
        </h2>
        <div className="flex items-center gap-3 mt-4">
          <img src={trainerSprite(trainer.sprite)} alt="" className="h-24 [image-rendering:pixelated] -scale-x-100" />
          <div>
            <p className="text-sm text-white/60">{trainer.name}</p>
            <p className="italic font-bold">“{won ? trainer.defeat : regional ? 'Come back when your team is ready.' : 'Your Gym is mine! Better luck next time.'}”</p>
          </div>
        </div>
        <p className="text-center text-sm text-gold-300 mt-3">
          {regional
            ? won ? 'Your team grows stronger · catch a new Pokémon next' : retries > 0 ? `Your team will be healed to try again (${retries} ${retries === 1 ? 'retry' : 'retries'} left).` : 'No retries left: the quest ends here.'
            : won ? 'Your team grows stronger · Gym Funds earned' : 'Your team can’t battle any more.'}
        </p>
        <button autoFocus onClick={onContinue} className="w-full mt-4 rounded-lg bg-gold-400 text-ink-900 font-black py-2.5 border-2 border-black shadow-[0_4px_0_#b8431a] hover:bg-gold-300">
          Continue
        </button>
      </dialog>
    </>
  )
}
