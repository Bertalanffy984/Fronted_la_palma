import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../../api/client.js'
import { Button } from '../../components/ui.jsx'
import { InlineNotice } from './CatalogTable.jsx'

export function CatalogField({ label, children }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="lp-label text-sm font-semibold text-[#304d3c]">{label}</span>
      {children}
    </label>
  )
}

export function CatalogSelect({ children, ...props }) {
  return <select {...props} className="lp-input w-full min-w-0">{children}</select>
}

function CatalogDialog({ title, children, onClose, busy }) {
  const dialogRef = useRef(null)
  const heading = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={heading}
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-[#dbe7db] bg-white p-0 text-[#193b2b] shadow-2xl backdrop:bg-[#10291d]/45"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#e8eee6] px-5 py-4 sm:px-6">
        <h2 id={heading} className="text-lg font-bold">{title}</h2>
        <button type="button" aria-label="Cerrar" disabled={busy} onClick={onClose} className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#526258] hover:bg-[#edf4ec] disabled:cursor-not-allowed disabled:opacity-50">
          <X aria-hidden="true" size={19} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

function useDialogAction() {
  const inProgress = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  return {
    busy,
    error,
    async perform(action, onDone) {
      if (inProgress.current) return
      inProgress.current = true
      setBusy(true)
      setError('')
      try {
        onDone(await action())
      } catch (failure) {
        setError(failure.message || 'No fue posible completar la operación.')
      } finally {
        inProgress.current = false
        setBusy(false)
      }
    },
  }
}

export function CatalogEditor({ title, fields, initialValues, toBody, path, method, onClose, onSaved }) {
  const [values, setValues] = useState(initialValues)
  const { busy, error, perform } = useDialogAction()

  const submit = (event) => {
    event.preventDefault()
    perform(() => {
      const incomplete = fields.find(({ name, required }) => required && !String(values[name] ?? '').trim())
      if (incomplete) throw new Error(`Completa el campo «${incomplete.label}».`)
      return api(path, { method, body: toBody(values) })
    }, onSaved)
  }

  return (
    <CatalogDialog {...{ title, onClose, busy }}>
      <form onSubmit={submit}>
        <div className="p-5 sm:p-6">
          <InlineNotice>{error}</InlineNotice>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ name, label, options, wide, ...props }) => {
              const fieldProps = {
                ...props,
                name,
                value: values[name] ?? '',
                disabled: busy,
                onChange: (event) => setValues({ ...values, [name]: event.target.value }),
              }
              return (
                <div key={name} className={wide ? 'sm:col-span-2' : ''}>
                  <CatalogField label={label}>
                    {options ? (
                      <CatalogSelect {...fieldProps}>
                        <option value="">Selecciona una opción</option>
                        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </CatalogSelect>
                    ) : (
                      <input {...fieldProps} className="lp-input w-full" />
                    )}
                  </CatalogField>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-[#e8eee6] px-5 py-4 sm:px-6">
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </form>
    </CatalogDialog>
  )
}

export function CatalogDelete({ title, name, path, onClose, onDeleted }) {
  const { busy, error, perform } = useDialogAction()
  const remove = () => perform(() => api(path, { method: 'DELETE' }), onDeleted)

  return (
    <CatalogDialog {...{ title, onClose, busy }}>
      <div className="p-5 sm:p-6">
        <InlineNotice>{error}</InlineNotice>
        <p className="text-sm leading-relaxed text-[#526258]">¿Deseas eliminar <strong className="text-[#193b2b]">{name}</strong> del catálogo?</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-[#e8eee6] px-5 py-4 sm:px-6">
        <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Cancelar</Button>
        <Button type="button" variant="danger" disabled={busy} onClick={remove}>{busy ? 'Eliminando…' : 'Eliminar'}</Button>
      </div>
    </CatalogDialog>
  )
}
