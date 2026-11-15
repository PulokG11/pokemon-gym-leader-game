import { useEffect, useRef } from 'react'
import { battleSpriteUrl } from '../lib/dex'
import type { BattleEvent } from '../types/game'

interface SpriteProps {
  species: string
  back: boolean
  fainted: boolean
  event: BattleEvent['kind'] | null   // event affecting this side in the current snapshot
  seq: number
  className?: string
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function Sprite({ species, back, fainted, event, seq, className = '' }: SpriteProps) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !event || reduceMotion()) return
    const dir = back ? 1 : -1 // player lunges up-right, opponent down-left
    switch (event) {
      case 'move':
        el.animate(
          [{ transform: 'translate(0,0)' }, { transform: `translate(${28 * dir}px, ${-18 * dir}px)` }, { transform: 'translate(0,0)' }],
          { duration: 380, easing: 'ease-out' },
        )
        break
      case 'damage':
        el.animate(
          [
            { transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(-8px)', opacity: 0.2 },
            { transform: 'translateX(8px)', opacity: 1 }, { transform: 'translateX(-6px)', opacity: 0.2 },
            { transform: 'translateX(4px)', opacity: 1 }, { transform: 'translateX(0)', opacity: 1 },
          ],
          { duration: 500 },
        )
        break
      case 'heal':
        el.animate(
          [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8) drop-shadow(0 0 12px #4ade80)' }, { filter: 'brightness(1)' }],
          { duration: 600 },
        )
        break
      case 'faint':
        el.animate(
          [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(48px)', opacity: 0 }],
          { duration: 700, easing: 'ease-in', fill: 'forwards' },
        )
        break
      case 'switch':
        el.getAnimations().forEach(a => a.cancel())
        el.animate(
          [{ transform: 'scale(0.2)', opacity: 0, filter: 'brightness(3)' }, { transform: 'scale(1)', opacity: 1, filter: 'brightness(1)' }],
          { duration: 500, easing: 'cubic-bezier(.2,1.4,.4,1)' },
        )
        break
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq])

  const src = battleSpriteUrl(species, back)
  if (!src) return null
  return (
    <img
      ref={ref}
      src={src}
      alt={species}
      draggable={false}
      className={`object-contain [image-rendering:pixelated] select-none transition-opacity ${fainted && event !== 'faint' ? 'opacity-0' : ''} ${className}`}
    />
  )
}
