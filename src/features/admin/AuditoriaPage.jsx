import { useState } from 'react'
import { ClipboardList, Filter } from 'lucide-react'
import { Alert, Button, EmptyState, PageHead, Spinner } from '../../components/ui.jsx'
import { fechaRegistro, marcaEstado, peso, rutaAuditoria, useConsultaAdmin } from './adminData.js'

const FILTROS = { jornada: '', encargado: '', desde: '', hasta: '' }
const FILAS = 12
const OPERACIONES = {
  INSERT: { etiqueta: 'Registro', color: 'bg-[#e5f3e8] text-[#1d6649]' },
  UPDATE: { etiqueta: 'Edición', color: 'bg-[#e9f0f9] text-[#275985]' },
  DELETE: { etiqueta: 'Eliminación', color: 'bg-rose-50 text-rose-700' },
}

function Cambio({ label, anterior, nuevo, formatear }) {
  return (
    <div>
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="mt-1 break-words font-semibold">{formatear(anterior)} <span className="px-0.5 font-normal text-slate-500">→</span> {formatear(nuevo)}</dd>
    </div>
  )
}

function Registro({ fila }) {
  const operacion = OPERACIONES[fila.operacion] ?? { etiqueta: fila.operacion, color: 'bg-slate-100 text-slate-700' }
  return (
    <article className="grid gap-4 border-b border-[#e8eee7] px-5 py-4 last:border-0 xl:grid-cols-[minmax(12rem,1.16fr)_minmax(8rem,0.74fr)_minmax(16rem,1.7fr)] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={'rounded-full px-2.5 py-1 text-xs font-bold ' + operacion.color}>{operacion.etiqueta}</span>
          <span className="text-sm font-semibold">Jornada {fila.id_jornada ?? '—'}</span>
        </div>
        <p className="mt-2 text-sm text-slate-700">{fechaRegistro(fila.fecha_cambio)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm xl:grid-cols-1">
        <p><span className="text-slate-500">Encargado</span> <span className="font-semibold">#{fila.fk_encargado}</span></p>
        <p><span className="text-slate-500">Participación</span> <span className="font-semibold">#{fila.fk_participacion}</span></p>
      </div>
      <details className="rounded-xl bg-[#f3f7f1] p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#1d6649] focus-visible:outline-2 focus-visible:outline-[#1d6649]">
          {peso(fila.kg_anteriores)} → {peso(fila.kg_nuevos)}
        </summary>
        <p className="mt-3 text-sm text-slate-600">Pesaje {fechaRegistro(fila.fecha_hora_pesaje)}</p>
        <dl className="mt-3 grid gap-2 min-[440px]:grid-cols-2">
          <Cambio label="Cobrado" anterior={fila.cobrado_anterior} nuevo={fila.cobrado_nuevo} formatear={marcaEstado} />
          <Cambio label="Activo" anterior={fila.activo_anterior} nuevo={fila.activo_nuevo} formatear={marcaEstado} />
        </dl>
      </details>
    </article>
  )
}

export default function AuditoriaPage() {
  const [filtro, setFiltro] = useState(FILTROS)
  const [aplicado, setAplicado] = useState(FILTROS)
  const [pagina, setPagina] = useState(1)
  const [version, setVersion] = useState(0)
  const [errorFiltro, setErrorFiltro] = useState('')
  const { datos, error, cargando } = useConsultaAdmin(rutaAuditoria(aplicado, pagina, FILAS), version)

  function cambiar(event) {
    setFiltro((anterior) => ({ ...anterior, [event.target.name]: event.target.value }))
    setErrorFiltro('')
  }

  function aplicar(event) {
    event.preventDefault()
    if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta) {
      setErrorFiltro('La fecha final debe ser igual o posterior a la inicial.')
      return
    }
    setPagina(1)
    setAplicado(filtro)
    setVersion((n) => n + 1)
  }

  function limpiar() {
    setFiltro(FILTROS)
    setAplicado(FILTROS)
    setPagina(1)
    setErrorFiltro('')
  }

  return (
    <section className="space-y-5">
      <PageHead title="Auditoría" description="Consulta el historial de los cambios en los pesajes." />
      <form onSubmit={aplicar} className="lp-card grid gap-4 p-5">
        <h2 className="flex items-center gap-2 font-bold"><Filter size={17} className="text-[#1d6649]" /> Filtros</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['jornada', 'N.º de jornada', 'number'],
            ['encargado', 'ID del encargado', 'number'],
            ['desde', 'Desde', 'date'],
            ['hasta', 'Hasta', 'date'],
          ].map(([name, label, type]) => (
            <label key={name} className="grid min-w-0 gap-1.5">
              <span className="lp-label">{label}</span>
              <input className="lp-input w-full min-w-0" type={type} name={name} min={type === 'number' ? 1 : undefined} max={type === 'number' ? 2147483647 : '9999-12-30'} value={filtro[name]} onChange={cambiar} />
            </label>
          ))}
        </div>
        {errorFiltro && <Alert tone="error">{errorFiltro}</Alert>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={limpiar}>Limpiar</Button>
          <Button type="submit">Aplicar filtros</Button>
        </div>
      </form>
      {error ? <Alert tone="error"><div className="flex flex-wrap items-center justify-between gap-2"><span>{error}</span><Button variant="secondary" onClick={() => setVersion((n) => n + 1)}>Reintentar</Button></div></Alert> : (
        <div className="lp-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#e5ede3] px-5 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-[#eef5eb] text-[#1d6649]"><ClipboardList size={20} /></span>
            <h2 className="font-bold">Historial de pesajes</h2>
          </div>
          {cargando ? <div className="grid min-h-48 place-items-center"><Spinner /></div> :
            datos?.resultados.length ? datos.resultados.map((fila) => <Registro key={fila.id} fila={fila} />) :
              <EmptyState title="Sin cambios registrados" description="Los cambios en los pesajes aparecerán aquí. Puedes revisar los filtros aplicados." />}
          {(pagina > 1 || datos?.hay_mas) && (
            <nav aria-label="Páginas de auditoría" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ede3] px-5 py-4">
              <span className="text-sm text-slate-600">Página {pagina}</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={pagina === 1 || cargando} onClick={() => setPagina((n) => n - 1)}>Anterior</Button>
                <Button variant="secondary" disabled={!datos?.hay_mas || cargando} onClick={() => setPagina((n) => n + 1)}>Siguiente</Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </section>
  )
}
