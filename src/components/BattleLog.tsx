import { useEffect, useRef } from 'react'

export function BattleLog({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [lines.length])

  return (
    <div ref={ref} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 h-32 overflow-y-auto" aria-live="polite">
      {lines.map((line, i) => (
        <p
          key={i}
          className={`text-sm leading-relaxed ${
            line.startsWith('—') ? 'text-slate-500 text-xs mt-1' :
            i === lines.length - 1 ? 'text-white font-medium' : 'text-slate-400'
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  )
}
