export function PokeBall({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#f1f1f1" stroke="#1c1613" strokeWidth="2.5" />
      <path d="M2 16a14 14 0 0 1 28 0Z" fill="#e5412e" stroke="#1c1613" strokeWidth="2.5" />
      <path d="M2 16h28" stroke="#1c1613" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="4.5" fill="#f1f1f1" stroke="#1c1613" strokeWidth="2.5" />
    </svg>
  )
}
