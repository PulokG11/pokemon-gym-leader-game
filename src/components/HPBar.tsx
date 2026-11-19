interface HPBarProps {
  hp: number
  maxHp: number
  size?: 'sm' | 'lg'
}

export function HPBar({ hp, maxHp, size = 'lg' }: HPBarProps) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0
  const color = pct > 0.5 ? 'bg-green-400' : pct > 0.25 ? 'bg-yellow-400' : 'bg-red-500'
  const h = size === 'lg' ? 'h-3' : 'h-1.5'

  return (
    <div className="w-full">
      <div className={`w-full ${h} bg-ink-800 rounded-full overflow-hidden`}>
        <div
          className={`${h} ${color} rounded-full transition-[width,background-color] duration-700 ease-out`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      {size === 'lg' && (
        <p className="text-xs text-white/65 mt-0.5 text-right tabular-nums">
          {hp} / {maxHp}
        </p>
      )}
    </div>
  )
}
