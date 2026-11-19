import type { GymType } from '../types/game'

export const TYPE_COLORS: Record<GymType, { bg: string; text: string; border: string }> = {
  fire:     { bg: 'bg-orange-500',  text: 'text-orange-400',  border: 'border-orange-500' },
  water:    { bg: 'bg-blue-500',    text: 'text-blue-400',    border: 'border-blue-500' },
  grass:    { bg: 'bg-green-500',   text: 'text-green-400',   border: 'border-green-500' },
  electric: { bg: 'bg-yellow-400',  text: 'text-yellow-400',  border: 'border-yellow-400' },
  ghost:    { bg: 'bg-purple-600',  text: 'text-purple-400',  border: 'border-purple-600' },
  dragon:   { bg: 'bg-indigo-600',  text: 'text-indigo-400',  border: 'border-indigo-600' },
  normal:   { bg: 'bg-slate-500',   text: 'text-slate-400',   border: 'border-slate-500' },
  ice:      { bg: 'bg-cyan-400',    text: 'text-cyan-400',    border: 'border-cyan-400' },
  fighting: { bg: 'bg-red-700',     text: 'text-red-400',     border: 'border-red-700' },
  poison:   { bg: 'bg-fuchsia-600', text: 'text-fuchsia-400', border: 'border-fuchsia-600' },
  ground:   { bg: 'bg-amber-600',   text: 'text-amber-400',   border: 'border-amber-600' },
  flying:   { bg: 'bg-sky-500',     text: 'text-sky-400',     border: 'border-sky-500' },
  psychic:  { bg: 'bg-pink-500',    text: 'text-pink-400',    border: 'border-pink-500' },
  bug:      { bg: 'bg-lime-600',    text: 'text-lime-400',    border: 'border-lime-600' },
  rock:     { bg: 'bg-stone-600',   text: 'text-stone-400',   border: 'border-stone-600' },
  dark:     { bg: 'bg-neutral-700', text: 'text-neutral-400', border: 'border-neutral-700' },
  steel:    { bg: 'bg-zinc-500',    text: 'text-zinc-400',    border: 'border-zinc-500' },
  fairy:    { bg: 'bg-rose-400',    text: 'text-rose-400',    border: 'border-rose-400' },
}

/** Text colour that meets WCAG AA on each type's background colour. */
const LIGHT_ON_TYPE = new Set<GymType>(['ghost', 'dragon', 'fighting', 'poison', 'dark', 'rock', 'steel', 'normal'])
export const typeTextClass = (type: string) =>
  LIGHT_ON_TYPE.has(type.toLowerCase() as GymType) ? 'text-white' : 'text-ink-900'
