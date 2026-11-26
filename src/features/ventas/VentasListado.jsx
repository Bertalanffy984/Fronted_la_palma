import { Alert, Button, EmptyState, Spinner } from '../../components/ui.jsx'
import { TAMANO_PAGINA } from './salesData.js'

export function ColumnaMovil({ children }) {
  return <span className="block text-xs text-slate-500 sm:hidden">{children}</span>
}

export default function VentasListado({ title, icon: Icon, consulta, pagina, onPage, onRetry, columnas, render, emptyTitle }) {
  const { cargando, error, datos } = consulta
  const filas = (datos ?? []).slice(0, TAMANO_PAGINA)
  return error ? (
    <Alert tone="error"><div className="flex flex-wrap items-center justify-between gap-2"><span>{error}</span><Button variant="secondary" onClick={onRetry}>Reintentar</Button></div></Alert>
  ) : (
    <div className="lp-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[#e5ede3] px-5 py-4">
        <div className="grid size-10 place-items-center rounded-xl bg-[#eef5eb] text-[#1d6649]"><Icon size={20} /></div>
        <h2 className="font-bold">{title}</h2>
      </div>
      {cargando ? <div className="grid min-h-48 place-items-center"><Spinner /></div> : filas.length === 0 ? (
        <EmptyState title={emptyTitle} description="Revisa los filtros o registra una nueva venta." />
      ) : (
        <div className="overflow-x-auto">
          <table className="lp-table w-full text-left">
            <thead className="hidden text-xs uppercase tracking-wide text-slate-600 sm:table-header-group">
              <tr>{columnas.map((columna) => <th key={columna} scope="col">{columna || <span className="sr-only">Acciones</span>}</th>)}</tr>
            </thead>
            <tbody className="block divide-y divide-[#edf2eb] sm:table-row-group">{filas.map(render)}</tbody>
          </table>
        </div>
      )}
      {(pagina > 1 || datos?.length > TAMANO_PAGINA) && (
        <nav aria-label="Páginas" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ede3] px-5 py-4">
          <span className="text-sm text-slate-600">Página {pagina}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={cargando || pagina === 1} onClick={() => onPage(pagina - 1)}>Anterior</Button>
            <Button variant="secondary" disabled={cargando || !(datos?.length > TAMANO_PAGINA)} onClick={() => onPage(pagina + 1)}>Siguiente</Button>
          </div>
        </nav>
      )}
    </div>
  )
}
