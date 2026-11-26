import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export default function VentaDialog({ title, description, onClose, busy = false, children }) {
  const modal = useRef(null)
  const titleId = useId()
  useEffect(() => {
    const element = modal.current
    element.showModal()
    return () => { if (element.open) element.close() }
  }, [])

  return (
    <dialog
      ref={modal}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-[1.35rem] border border-[#e2eae1] bg-white p-0 text-[#17362b] shadow-2xl backdrop:bg-emerald-950/45"
    >
      <header className="flex items-start justify-between gap-4 border-b border-[#e7eee5] px-5 py-5 sm:px-7">
        <div>
          <h2 id={titleId} className="text-xl font-bold">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Cerrar" className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-[#eff5ed] focus-visible:outline-2 focus-visible:outline-[#1d6649] disabled:opacity-50">
          <X size={20} />
        </button>
      </header>
      <div className="px-5 py-5 sm:px-7">{children}</div>
    </dialog>
  )
}
