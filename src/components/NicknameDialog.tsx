import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { LeaderboardFailure, nicknameProblem, registerPlayer, renamePlayer, suggestNickname } from '../lib/leaderboard'

const ERRORS: Record<string, string> = {
  nickname_taken: 'That nickname is taken. Try another.',
  nickname_invalid: 'Use 3–16 letters, numbers or _.',
  offline: 'Can’t reach the leaderboard. Check your connection and try again.',
  not_authorized: 'This device no longer owns that nickname.',
}

interface Props {
  /** Called after a nickname is saved, or after "Play without ranking". */
  onDone: () => void
  onCancel: () => void
  /** Offer playing the Daily without a nickname. */
  allowSkip?: boolean
}

export function NicknameDialog({ onDone, onCancel, allowSkip }: Props) {
  const { playerId, token, nickname, setPlayer, setNickname, decline } = usePlayerStore()
  const [name, setName] = useState(() => nickname ?? suggestNickname())
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
    inputRef.current?.select()
  }, [])

  const problem = nicknameProblem(name)
  const renaming = !!playerId

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (problem || busy) return
    if (renaming && name === nickname) return onDone()
    setBusy(true)
    setError(null)
    try {
      if (renaming) {
        await renamePlayer(playerId!, token!, name)
        setNickname(name)
      } else {
        const p = await registerPlayer(name)
        setPlayer(p.playerId, p.token, name)
      }
      onDone()
    } catch (err) {
      const code = err instanceof LeaderboardFailure ? err.code : 'unknown'
      setError(ERRORS[code] ?? 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={e => { e.preventDefault(); onCancel() }}
      className="m-auto w-[min(92vw,26rem)] rounded-2xl bg-ink-900 text-white border-2 border-gold-400 p-0 backdrop:bg-black/70 shadow-[0_8px_0_rgba(0,0,0,0.4)]"
    >
      <form onSubmit={save} className="p-5 flex flex-col gap-3 font-sans">
        <h2 className="font-black text-xl">{renaming ? 'Change nickname' : 'Join the leaderboard'}</h2>
        <p className="text-sm text-white/70">
          {renaming
            ? 'Your Daily results move to the new name.'
            : 'Pick a nickname to appear on the Daily Challenge rankings. No account or email needed; it’s saved on this device.'}
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white/60">Nickname</span>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={name}
              onChange={e => setName(e.target.value.trim())}
              maxLength={16}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!problem || !!error}
              aria-describedby="nickname-help"
              className="flex-1 min-w-0 rounded-lg bg-black/40 border border-white/20 px-3 py-2 font-bold focus:outline-none focus:border-gold-400"
            />
            <button
              type="button"
              onClick={() => { setName(suggestNickname()); setError(null) }}
              className="rounded-lg bg-white/10 hover:bg-white/15 px-3 text-sm font-bold"
              aria-label="Suggest a random nickname"
              title="Random"
            >
              🎲
            </button>
          </div>
          <span id="nickname-help" className={`text-xs ${problem || error ? 'text-red-300' : 'text-white/50'}`} role={error ? 'alert' : undefined}>
            {error ?? problem ?? '3–16 letters, numbers or _. Shown publicly.'}
          </span>
        </label>
        <div className="flex flex-wrap gap-2 justify-end mt-1">
          {allowSkip && !renaming && (
            <button
              type="button"
              onClick={() => { decline(); onDone() }}
              className="mr-auto text-sm text-white/60 hover:text-white underline-offset-2 hover:underline"
            >
              Play without ranking
            </button>
          )}
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/15">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!!problem || busy}
            className="rounded-lg px-4 py-2 text-sm font-black bg-gold-400 text-ink-900 hover:bg-gold-300 disabled:opacity-50"
          >
            {busy ? 'Saving…' : renaming ? 'Save' : 'Join'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
