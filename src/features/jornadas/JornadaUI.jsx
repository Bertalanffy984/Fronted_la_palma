import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Button } from '../../components/ui.jsx'

export function MensajeJornada({ children, tone = 'error', onRetry }) {
  const colores = tone === 'error'
    ? 'border-rose-200 bg-rose-50 text-rose-900'
    : tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-emerald-200 bg-emerald-50 text-emerald-950'
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm ${colores}`}>
      {tone === 'error' && <CircleAlert size={17} aria-hidden="true" />}
      <span className="min-w-0 flex-1">{children}</span>
      {onRetry && <Button type="button" variant="secondary" onClick={onRetry}>Reintentar</Button>}
    </div>
  )
}

export function CargandoJornada({ texto = 'Cargando datos…' }) {
  return (
    <div role="status" className="flex min-h-36 items-center justify-center gap-2 text-sm font-medium text-[#44675a]">
      <LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> {texto}
    </div>
  )
}

export function TablaJornada({ columnas, filas, clave }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-y border-[#e1e8de] bg-[#f5f8f3] text-[#466257]">
            <tr>{columnas.map(({ etiqueta, id = etiqueta }) => <th key={id} scope="col" className="px-4 py-3 font-semibold">{etiqueta}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#e7eee5]">
            {filas.map((fila) => (
              <tr key={clave(fila)} className="hover:bg-[#f8faf6]">
                {columnas.map(({ etiqueta, id = etiqueta, mostrar }) => <td key={id} className="px-4 py-3.5 align-middle">{mostrar(fila)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {filas.map((fila) => (
          <li key={clave(fila)} className="rounded-xl border border-[#dbe4d9] bg-[#fcfdfb] p-3.5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {columnas.map(({ etiqueta, id = etiqueta, mostrar }, index) => (
                <div key={id} className={index === 0 || id === 'acciones' ? 'col-span-2' : 'min-w-0'}>
                  {id !== 'acciones' && <dt className="mb-0.5 text-sm font-medium text-[#486456]">{etiqueta}</dt>}
                  <dd className="break-words text-sm text-[#18392b]">{mostrar(fila)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}

export function PaginacionJornada({ pagina, cambiar, haySiguiente, cargando }) {
  if (pagina === 0 && !haySiguiente) return null
  return (
    <div aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-[#486456]">
      <span>Página {pagina + 1}</span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" disabled={cargando || pagina === 0} onClick={() => cambiar(pagina - 1)}>Anterior</Button>
        <Button type="button" variant="secondary" disabled={cargando || !haySiguiente} onClick={() => cambiar(pagina + 1)}>Siguiente</Button>
      </div>
    </div>
  )
}

export function EtiquetaJornada({ children, tone = 'neutral' }) {
  const estilos = {
    neutral: 'bg-[#eef2ed] text-[#4c6658]',
    success: 'bg-[#e3f2e8] text-[#145638]',
    warning: 'bg-[#fff2d9] text-[#7d4f0c]',
    error: 'bg-rose-50 text-rose-800',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${estilos[tone]}`}>{children}</span>
}
