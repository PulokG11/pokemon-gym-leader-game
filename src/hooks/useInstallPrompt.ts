import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// The browser fires this once, often before React mounts, so capture it at module load.
let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  deferred = e as BeforeInstallPromptEvent
  listeners.forEach(l => l())
})
window.addEventListener('appinstalled', () => {
  deferred = null
  listeners.forEach(l => l())
})

/** Returns an install function when the browser offers PWA installation, else null. */
export function useInstallPrompt(): (() => Promise<void>) | null {
  const [, rerender] = useState(0)
  useEffect(() => {
    const l = () => rerender(n => n + 1)
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])
  if (!deferred) return null
  return async () => {
    const e = deferred
    if (!e) return
    await e.prompt()
    await e.userChoice
    deferred = null
    listeners.forEach(l => l())
  }
}
