import { useUiStore } from '../store/uiStore'

/** Orange header bar used by the menu sub-screens. */
export function ScreenHeader({ title, sub }: { title: string; sub?: string }) {
  const go = useUiStore(s => s.go)
  return (
    <header className="home-bg border-b-4 border-ink-900">
      <div className="max-w-3xl mx-auto px-4 py-5">
        <button onClick={() => go('home')} className="text-sm font-bold text-white/90 hover:text-white">
          ← Home
        </button>
        <h1 className="screen-title text-white text-xl sm:text-2xl mt-3">
          {title}
        </h1>
        {sub && <p className="text-white/90 font-semibold mt-2">{sub}</p>}
      </div>
    </header>
  )
}
