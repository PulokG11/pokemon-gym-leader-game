// Battle worker — runs @pkmn/sim isolated from the main thread.
// Only an allowlisted command set is accepted; privileged simulator
// commands (eval, forcewin, reseed, editbattle) are never forwarded.

export type WorkerCommand =
  | { type: 'INIT'; payload: { format: string; p1Team: string; p2Team: string; seed?: number[] } }
  | { type: 'MOVE'; payload: { player: 'p1' | 'p2'; choice: string } }
  | { type: 'SWITCH'; payload: { player: 'p1' | 'p2'; slot: number } }

export type WorkerEvent =
  | { type: 'READY' }
  | { type: 'UPDATE'; payload: { lines: string[] } }
  | { type: 'SIDE_UPDATE'; payload: { player: 'p1' | 'p2'; data: string } }
  | { type: 'END'; payload: { winner: 'p1' | 'p2' | null } }
  | { type: 'ERROR'; payload: { message: string } }

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const { type } = e.data
  // Battle stream will be wired here in the battle integration step.
  switch (type) {
    case 'INIT':
      self.postMessage({ type: 'READY' } satisfies WorkerEvent)
      break
    case 'MOVE':
    case 'SWITCH':
      // Dispatch to BattleStream once integrated.
      break
    default:
      self.postMessage({
        type: 'ERROR',
        payload: { message: `Unknown command: ${(e.data as WorkerCommand).type}` }
      } satisfies WorkerEvent)
  }
}
