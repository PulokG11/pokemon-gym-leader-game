import type { BagItem, RewardKind } from '../lib/economy'
import type { GymType } from '../types/game'

const ITEMS = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const BAG_SPRITE: Record<BagItem, string> = { potion: 'hyper-potion', revive: 'revive', candy: 'rare-candy', stone: 'shiny-stone' }

const STONE: Partial<Record<GymType, string>> = {
  fire: 'fire-stone', water: 'water-stone', grass: 'leaf-stone', electric: 'thunder-stone', ice: 'ice-stone',
  fairy: 'moon-stone', psychic: 'moon-stone', dark: 'dusk-stone', ghost: 'dusk-stone',
}

const REWARD_SPRITE: Record<Exclude<RewardKind, 'held_item' | 'evo_stone'>, string> = {
  recruit: 'poke-ball', training: 'exp-share', team_training: 'exp-share', revive_pack: 'revive',
  potion_supply: 'hyper-potion', rare_candy: 'rare-candy', league_favour: 'lucky-egg',
}

export function itemSprite(opts: { bag?: BagItem; held?: string; reward?: RewardKind; gymType?: GymType }): string {
  if (opts.bag) return `${ITEMS}/${BAG_SPRITE[opts.bag]}.png`
  if (opts.held) return `${ITEMS}/${slug(opts.held)}.png`
  if (opts.reward === 'evo_stone') return `${ITEMS}/${(opts.gymType && STONE[opts.gymType]) ?? 'shiny-stone'}.png`
  if (opts.reward && opts.reward !== 'held_item') return `${ITEMS}/${REWARD_SPRITE[opts.reward]}.png`
  return `${ITEMS}/poke-ball.png`
}

/** A Pokémon item sprite, pixel-crisp; falls back to a Poké Ball if the sprite is missing. */
export function ItemIcon({ src, className = 'w-8 h-8', alt = '' }: { src: string; className?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`object-contain [image-rendering:pixelated] ${className}`}
      onError={e => {
        const img = e.currentTarget
        if (!img.src.endsWith('poke-ball.png')) img.src = `${ITEMS}/poke-ball.png`
      }}
    />
  )
}
