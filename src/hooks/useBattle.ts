import { useEffect, useRef, useCallback } from 'react'
import { useBattleStore } from '../store/battleStore'
import { useSettingsStore } from '../store/settingsStore'
import type { BattleState, WorkerOutbound } from '../types/game'

// How long each kind of event stays on screen before the next one plays.
const EVENT_MS: Record<string, number> = {
  move: 750, damage: 850, heal: 700, faint: 1000, switch: 800, status: 650, miss: 650, info: 600,
}

export function useBattle(p1Team: string, p2Team: string, seed?: number[]) {
  const workerRef = useRef<Worker | null>(null)
  const setBattleState = useBattleStore(s => s.setBattleState)
  const setAnimating = useBattleStore(s => s.setAnimating)
  const clearBattle = useBattleStore(s => s.clearBattle)

  useEffect(() => {
    clearBattle()
    const queue: BattleState[] = []
    let timer: number | null = null

    const drain = () => {
      const next = queue.shift()
      if (!next) {
        timer = null
        setAnimating(false)
        return
      }
      setBattleState(next)
      const speed = useSettingsStore.getState().speed
      timer = window.setTimeout(drain, next.event ? EVENT_MS[next.event.kind] / speed : 0)
    }

    const worker = new Worker(
      new URL('../workers/battle.worker.ts', import.meta.url),
      { type: 'module' }
    )
    worker.onmessage = (e: MessageEvent<WorkerOutbound>) => {
      if (e.data.type === 'ERROR') {
        console.error('[battle worker]', e.data.message)
        return
      }
      queue.push(e.data.state)
      if (timer === null) {
        setAnimating(true)
        drain()
      }
    }
    worker.onerror = e => console.error('[battle worker]', e.message)
    worker.postMessage({
      type: 'INIT',
      payload: { format: 'gen9customgame', p1Team, p2Team, seed },
    })
    workerRef.current = worker
    return () => {
      if (timer !== null) clearTimeout(timer)
      worker.terminate()
      workerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p1Team, p2Team])

  const sendMove = useCallback((choice: string) => {
    workerRef.current?.postMessage({ type: 'MOVE', payload: { choice } })
  }, [])

  const sendSwitch = useCallback((name: string) => {
    workerRef.current?.postMessage({ type: 'SWITCH', payload: { name } })
  }, [])

  return { sendMove, sendSwitch }
}
