import { useEffect, useRef, useCallback } from 'react'
import { useBattleStore } from '../store/battleStore'
import type { WorkerOutbound } from '../types/game'

export function useBattle(p1Team: string, p2Team: string, seed?: number[]) {
  const workerRef = useRef<Worker | null>(null)
  const setBattleState = useBattleStore(s => s.setBattleState)
  const clearBattle = useBattleStore(s => s.clearBattle)

  useEffect(() => {
    clearBattle()
    const worker = new Worker(
      new URL('../workers/battle.worker.ts', import.meta.url),
      { type: 'module' }
    )
    worker.onmessage = (e: MessageEvent<WorkerOutbound>) => {
      if (e.data.type === 'STATE') setBattleState(e.data.state)
      else console.error('[battle worker]', e.data.message)
    }
    worker.onerror = e => console.error('[battle worker]', e.message)
    worker.postMessage({
      type: 'INIT',
      payload: { format: 'gen9customgame', p1Team, p2Team, seed },
    })
    workerRef.current = worker
    return () => { worker.terminate(); workerRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p1Team, p2Team])

  const sendMove = useCallback((choice: string) => {
    workerRef.current?.postMessage({ type: 'MOVE', payload: { choice } })
  }, [])

  const sendSwitch = useCallback((slot: number) => {
    workerRef.current?.postMessage({ type: 'SWITCH', payload: { slot } })
  }, [])

  return { sendMove, sendSwitch }
}
