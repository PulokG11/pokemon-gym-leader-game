interface BattleLogProps {
  lines: string[]
}

export function BattleLog({ lines }: BattleLogProps) {
  const recent = lines.slice(-8)
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 h-36 overflow-y-auto flex flex-col-reverse">
      <div>
        {recent.map((line, i) => (
          <p key={i} className={`text-sm leading-relaxed ${i === recent.length - 1 ? 'text-white' : 'text-slate-400'}`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
