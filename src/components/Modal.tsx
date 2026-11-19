import { useEffect, useRef, type ReactNode } from 'react'

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return (
    <dialog
      ref={ref}
      onCancel={e => { e.preventDefault(); onClose() }}
      className={`m-auto ${wide ? 'w-[min(94vw,52rem)]' : 'w-[min(94vw,32rem)]'} max-h-[90vh] rounded-2xl bg-ink-900 text-white border-2 border-black p-0 backdrop:bg-black/70 shadow-[0_8px_0_rgba(0,0,0,0.4)] font-sans`}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="font-ui font-bold text-lg">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-white/60 hover:text-white">×</button>
      </div>
      <div className="p-5 pt-3">{children}</div>
    </dialog>
  )
}
