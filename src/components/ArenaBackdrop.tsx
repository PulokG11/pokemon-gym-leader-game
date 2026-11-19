import type { ReactNode } from 'react'
import type { GymType } from '../types/game'
import { seededRng } from '../lib/daily'

interface Palette { sky: [string, string]; ridge: string; ridgeShade: string; ground: string; groundAlt: string; accent: string; accentCore: string }

const P: Record<GymType, Palette> = {
  fire:     { sky: ['#e9b79c', '#d98d6b'], ridge: '#b77a62', ridgeShade: '#9c604b', ground: '#d9a28c', groundAlt: '#c98d77', accent: '#e8552a', accentCore: '#ffb347' },
  water:    { sky: ['#a9dcf2', '#6fb7e0'], ridge: '#4f8fb8', ridgeShade: '#3c7399', ground: '#7cc3dd', groundAlt: '#64aecb', accent: '#2f78b8', accentCore: '#d8f3ff' },
  grass:    { sky: ['#cdeeb6', '#9fd98a'], ridge: '#5f9e57', ridgeShade: '#4a8445', ground: '#9ccd76', groundAlt: '#87bb63', accent: '#3f7a3a', accentCore: '#c8ef8f' },
  electric: { sky: ['#fff3b0', '#ffd95a'], ridge: '#8c8c9c', ridgeShade: '#6f6f80', ground: '#e8d27a', groundAlt: '#d6bd5f', accent: '#f2b705', accentCore: '#fffbe0' },
  ghost:    { sky: ['#8d7bb8', '#5c4a8a'], ridge: '#3f3266', ridgeShade: '#30264f', ground: '#6b5a92', groundAlt: '#5b4b80', accent: '#b9a6ff', accentCore: '#fff2b8' },
  dragon:   { sky: ['#b9b3ee', '#7e74cf'], ridge: '#5048a0', ridgeShade: '#3e3784', ground: '#9a8fd6', groundAlt: '#8578c4', accent: '#3a2f8f', accentCore: '#f2c66b' },
  normal:   { sky: ['#f4ead2', '#e2d4b2'], ridge: '#b9a98a', ridgeShade: '#a08f71', ground: '#ddcfae', groundAlt: '#cdbd99', accent: '#9a8566', accentCore: '#fff6df' },
  ice:      { sky: ['#e3f7ff', '#b4e6f5'], ridge: '#86c3d9', ridgeShade: '#6aa9c2', ground: '#d2f0f8', groundAlt: '#bde4ee', accent: '#7fc8e0', accentCore: '#ffffff' },
  fighting: { sky: ['#f1c7a0', '#d99a6c'], ridge: '#8a5a3c', ridgeShade: '#704731', ground: '#c99b6f', groundAlt: '#b8875c', accent: '#a33a2a', accentCore: '#f2d1a8' },
  poison:   { sky: ['#d6b3e6', '#a97cc4'], ridge: '#6e4a86', ridgeShade: '#59396f', ground: '#9a78ad', groundAlt: '#87659a', accent: '#7c2fa0', accentCore: '#d9a6ff' },
  ground:   { sky: ['#f2d9a6', '#dcb574'], ridge: '#a8794a', ridgeShade: '#8e633a', ground: '#d4a970', groundAlt: '#c2965c', accent: '#8a5a2e', accentCore: '#f0d39c' },
  flying:   { sky: ['#dff1ff', '#a8d4f5'], ridge: '#ffffff', ridgeShade: '#d8e9f7', ground: '#c2dff2', groundAlt: '#b0d1e8', accent: '#7aa9d6', accentCore: '#ffffff' },
  psychic:  { sky: ['#ffd3e8', '#f3a3c8'], ridge: '#c9709e', ridgeShade: '#b05a86', ground: '#efb5cf', groundAlt: '#e3a0bf', accent: '#d94f91', accentCore: '#fff0f7' },
  bug:      { sky: ['#e3f3b4', '#bfe07a'], ridge: '#6f9a3a', ridgeShade: '#5a822e', ground: '#b5d27a', groundAlt: '#a2c065', accent: '#58731f', accentCore: '#f0ff9e' },
  rock:     { sky: ['#e6dccb', '#c9b9a0'], ridge: '#8a7a64', ridgeShade: '#71634f', ground: '#bba98d', groundAlt: '#a8967a', accent: '#5e5241', accentCore: '#d8c8ad' },
  dark:     { sky: ['#5a4d66', '#2f2738'], ridge: '#1f1a26', ridgeShade: '#17131d', ground: '#4a3f52', groundAlt: '#3e3446', accent: '#8a7aa0', accentCore: '#e7d7ff' },
  steel:    { sky: ['#e8edf2', '#c3ccd6'], ridge: '#8b96a3', ridgeShade: '#737e8b', ground: '#bcc5cf', groundAlt: '#aab4bf', accent: '#5f6b78', accentCore: '#ffffff' },
  fairy:    { sky: ['#ffe4f0', '#ffc2dc'], ridge: '#f39abf', ridgeShade: '#e384ad', ground: '#ffd0e3', groundAlt: '#f9bcd6', accent: '#ff7fb5', accentCore: '#ffffff' },
}

export const arenaPalette = (t: GymType) => P[t]

const W = 160
const H = 90
const HORIZON = 46

/** A stepped, pixel-art ridge line, the same for a type every time. */
function ridgePath(type: GymType, top: number, jag: number, seed: string): string {
  const rng = seededRng(`${type}:${seed}`)
  let d = `M0 ${H} L0 ${top}`
  let y = top
  for (let x = 0; x <= W; x += 4) {
    y = Math.max(top - jag, Math.min(HORIZON - 2, y + Math.round((rng() - 0.5) * 6)))
    d += ` L${x} ${y} L${x + 4} ${y}`
  }
  return `${d} L${W} ${H} Z`
}

function Motif({ type, p }: { type: GymType; p: Palette }) {
  const rng = seededRng(`motif:${type}`)
  const spots = Array.from({ length: 7 }, () => ({ x: 4 + rng() * 150, y: HORIZON + 6 + rng() * 38, s: 0.6 + rng() * 0.8 }))
  switch (type) {
    case 'fire':
      return (
        <g>
          {spots.map((s, i) => (
            <g key={i}>
              <ellipse cx={s.x} cy={s.y} rx={9 * s.s} ry={3 * s.s} fill={p.accent} />
              <ellipse cx={s.x} cy={s.y} rx={5 * s.s} ry={1.6 * s.s} fill={p.accentCore} />
              <rect x={s.x - 1} y={s.y - 14 * s.s} width="2" height={10 * s.s} fill="#fff" opacity="0.25" />
            </g>
          ))}
        </g>
      )
    case 'water':
      return <g>{spots.map((s, i) => <rect key={i} x={s.x - 8} y={s.y} width={16 * s.s} height="1" fill={p.accentCore} opacity="0.8" />)}</g>
    case 'grass':
    case 'bug':
      return <g>{spots.concat(spots.map(s => ({ ...s, x: (s.x + 37) % W }))).map((s, i) => (
        <path key={i} d={`M${s.x} ${s.y} l2 -5 l2 5 l2 -4 l2 4 Z`} fill={p.accent} />
      ))}</g>
    case 'ice':
    case 'flying':
    case 'fairy':
      return <g>{spots.map((s, i) => <path key={i} d={`M${s.x} ${s.y - 3} l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 Z`} fill={p.accentCore} />)}</g>
    case 'ghost':
    case 'dark':
      return (
        <g>
          {spots.slice(0, 4).map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={18} ry={3} fill={p.accent} opacity="0.25" />)}
          {spots.slice(4).map((s, i) => (
            <g key={`c${i}`}><rect x={s.x} y={s.y - 6} width="2" height="6" fill="#efe6d2" /><rect x={s.x} y={s.y - 9} width="2" height="3" fill={p.accentCore} /></g>
          ))}
        </g>
      )
    case 'electric':
      return <g>{spots.slice(0, 4).map((s, i) => <path key={i} d={`M${s.x} ${s.y - 6} l3 3 l-2 1 l3 4`} stroke={p.accent} strokeWidth="1.2" fill="none" />)}</g>
    case 'rock':
    case 'ground':
    case 'fighting':
    case 'steel':
      return <g>{spots.map((s, i) => <rect key={i} x={s.x} y={s.y - 2 * s.s} width={6 * s.s} height={3 * s.s} fill={p.accent} opacity="0.7" />)}</g>
    default:
      return <g>{spots.map((s, i) => <rect key={i} x={s.x} y={s.y} width="2" height="2" fill={p.accent} opacity="0.6" />)}</g>
  }
}

/** Pixel-art arena for a Gym type: sky, stepped ridge, dithered ground and a type motif. */
export function ArenaBackdrop({ type, className = '', children }: { type: GymType; className?: string; children?: ReactNode }) {
  const p = P[type]
  const id = `arena-${type}`
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ ['--platform' as string]: p.groundAlt, ['--platform-rim' as string]: p.ridgeShade }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        shapeRendering="crispEdges"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.sky[0]} />
            <stop offset="1" stopColor={p.sky[1]} />
          </linearGradient>
          <pattern id={`${id}-dither`} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill={p.ground} />
            <rect width="1" height="1" fill={p.groundAlt} />
            <rect x="2" y="2" width="1" height="1" fill={p.groundAlt} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${id}-sky)`} />
        <path d={ridgePath(type, 20, 10, 'far')} fill={p.ridgeShade} opacity="0.55" />
        <path d={ridgePath(type, 32, 8, 'near')} fill={p.ridge} />
        <rect y={HORIZON} width={W} height={H - HORIZON} fill={`url(#${id}-dither)`} />
        <rect y={HORIZON} width={W} height="1" fill={p.ridgeShade} />
        <Motif type={type} p={p} />
      </svg>
      {children}
    </div>
  )
}

/** Raised battle platform in the arena's colours. */
export function Platform({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-[50%] ${className}`}
      style={{ background: 'var(--platform)', boxShadow: 'inset 0 -6px 0 var(--platform-rim), 0 4px 0 rgba(28,22,19,0.35)', border: '3px solid #1c1613' }}
      aria-hidden="true"
    />
  )
}
