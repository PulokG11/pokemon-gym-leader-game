import { Component, type ReactNode } from 'react'
import { useRunStore } from '../store/runStore'

/** Recovers from a crash (e.g. an incompatible saved run) instead of leaving a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  reset = () => {
    useRunStore.getState().clearRun()
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="home-bg min-h-screen text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
                <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-white/65 text-sm max-w-md">{this.state.error.message}</p>
        <button onClick={this.reset} className="px-6 py-2.5 bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black shadow-[0_4px_0_#b8431a] rounded-xl font-semibold">
          Start over
        </button>
      </div>
    )
  }
}
