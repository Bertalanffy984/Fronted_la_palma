import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui.jsx'

export function CatalogTabs({ tabs, active, onChange }) {
  return (
    <div className="mb-5 flex w-full gap-1 rounded-xl border border-[#e0e8de] bg-white p-1 sm:w-fit" aria-label="Secciones del catálogo" role="group">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          onClick={() => onChange(id)}
          className={`inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition sm:flex-initial ${active === id ? 'bg-[#e5f2e9] text-[#1d6649]' : 'text-[#526258] hover:bg-[#f3f6ef]'}`}
        >
          {Icon && <Icon aria-hidden="true" size={17} />}{label}
        </button>
      ))}
    </div>
  )
}

export function InlineNotice({ children, tone = 'error' }) {
  if (!children) return null
  const success = tone === 'success'
  return (
    <div role={success ? 'status' : 'alert'} className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${success ? 'border-[#c3dfcc] bg-[#eaf6ee] text-[#20553d]' : 'border-red-200 bg-red-50 text-red-800'}`}>
      {children}
    </div>
  )
}

function RowActions({ row, onEdit, onDelete, rowName }) {
  if (!onEdit && !onDelete) return null
  return (
    <div className="flex justify-end gap-1.5" aria-label={`Acciones para ${rowName(row)}`}>
      {onEdit && (
        <button type="button" title="Editar" aria-label={`Editar ${rowName(row)}`} onClick={() => onEdit(row)} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-[#266347] transition hover:bg-[#e4f1e8] hover:text-[#164932]">
          <Pencil aria-hidden="true" size={17} />
        </button>
      )}
      {onDelete && (
        <button type="button" title="Eliminar" aria-label={`Eliminar ${rowName(row)}`} onClick={() => onDelete(row)} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-[#687a6e] transition hover:bg-red-50 hover:text-red-700">
          <Trash2 aria-hidden="true" size={17} />
        </button>
      )}
    </div>
  )
}

export default function CatalogTable({ catalog, columns, empty, onEdit, onDelete, rowName, toolbar }) {
  const actions = Boolean(onEdit || onDelete)
  return (
    <section className="lp-card overflow-hidden rounded-2xl border border-[#e0e8de] bg-white" aria-busy={catalog.loading}>
      {toolbar && <div className="border-b border-[#e8eee6] p-4 sm:p-5">{toolbar}</div>}
      {catalog.loading ? (
        <div className="grid gap-3 p-5" role="status" aria-label="Cargando catálogo">
          {[0, 1, 2].map((index) => <div key={index} className="h-12 rounded-lg bg-[#f0f5ee] motion-safe:animate-pulse" />)}
        </div>
      ) : catalog.error ? (
        <div className="p-5">
          <InlineNotice>{catalog.error.message}</InlineNotice>
          <Button type="button" variant="secondary" onClick={() => catalog.reload()}>Reintentar</Button>
        </div>
      ) : catalog.rows.length ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="lp-table w-full border-collapse text-left text-sm">
              <thead className="bg-[#f6f9f4] text-[#526258]">
                <tr>
                  {columns.map((column) => <th key={column.key} scope="col" className="px-5 py-3.5 font-semibold">{column.label}</th>)}
                  {actions && <th scope="col" className="px-5 py-3.5 text-right font-semibold">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ec]">
                {catalog.rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#fafcf9]">
                    {columns.map((column) => <td key={column.key} className="max-w-72 px-5 py-3 break-words text-[#334a3d]">{column.render(row)}</td>)}
                    {actions && <td className="px-5 py-2"><RowActions {...{ row, rowName, onEdit, onDelete }} /></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-[#e8eee6] md:hidden">
            {catalog.rows.map((row) => (
              <li key={row.id} className="px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 break-words">{columns[0].render(row)}</div>
                  {actions && <RowActions {...{ row, rowName, onEdit, onDelete }} />}
                </div>
                {columns.length > 1 && (
                  <dl className="mt-2 grid grid-cols-2 gap-3">
                    {columns.slice(1).map((column) => (
                      <div key={column.key} className="min-w-0">
                        <dt className="text-xs font-medium text-[#596c5d]">{column.label}</dt>
                        <dd className="mt-0.5 text-sm break-words text-[#334a3d]">{column.render(row)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="px-5 py-12 text-center">
          <h2 className="text-base font-semibold text-[#193b2b]">{empty.title}</h2>
          {empty.description && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#576a5d]">{empty.description}</p>}
          {empty.action && <div className="mt-4">{empty.action}</div>}
        </div>
      )}
      {!catalog.loading && !catalog.error && (catalog.page > 0 || catalog.hasMore) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8eee6] px-4 py-3 sm:px-5">
          <span className="text-sm text-[#526258]">{catalog.rows.length ? `${catalog.offset + 1}–${catalog.offset + catalog.rows.length}` : `Página ${catalog.page + 1}`}</span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={catalog.page === 0} onClick={() => catalog.navigate(catalog.page - 1)}>Anterior</Button>
            <Button type="button" variant="secondary" disabled={!catalog.hasMore} onClick={() => catalog.navigate(catalog.page + 1)}>Siguiente</Button>
          </div>
        </div>
      )}
    </section>
  )
}
