import { useEffect, useRef } from 'react'

export function BattleLog({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [lines.length])

  return (
    <div ref={ref} className="bg-ink-900 border border-black rounded-xl px-3 py-2 h-32 overflow-y-auto" aria-live="polite">
      {lines.map((line, i) => (
        <p
          key={i}
          className={`text-sm leading-relaxed ${
            line.startsWith('—') ? 'text-white/50 text-xs mt-1' :
            i === lines.length - 1 ? 'text-white font-medium' : 'text-white/65'
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  )
}
