import { useState } from 'react'
import { BadgeDollarSign, CircleDollarSign, ClipboardList, Scale, UsersRound } from 'lucide-react'
import { Button, EmptyState } from '../../components/ui.jsx'
import { formatoAsistencia, mostrarDinero, mostrarFecha, mostrarKilos } from './formatoJornada.js'
import { pageSize } from './jornadasApi.js'
import { CargandoJornada, EtiquetaJornada, MensajeJornada, PaginacionJornada, TablaJornada } from './JornadaUI.jsx'

const tarjetas = [
  { key: 'inscripciones', label: 'Participantes', icon: UsersRound, formato: String },
  { key: 'kg_activos', label: 'Kilos activos', icon: Scale, formato: mostrarKilos },
  { key: 'pagado_cop', label: 'Total pagado', icon: CircleDollarSign, formato: mostrarDinero },
  { key: 'liquidado_pendiente_cop', label: 'Liquidado pendiente', icon: BadgeDollarSign, formato: mostrarDinero },
]

export function ResumenJornada({ recurso, onParticipantes }) {
  if (recurso.error && !recurso.datos) return <MensajeJornada onRetry={recurso.actualizar}>{recurso.error.message}</MensajeJornada>
  if (!recurso.datos) return <CargandoJornada texto="Calculando resumen…" />
  const { totales, participantes } = recurso.datos
  const asistencia = {
    presente: participantes.filter((fila) => fila.asistencia === 'presente').length,
    'inscrito sin pesajes': participantes.filter((fila) => fila.asistencia === 'inscrito sin pesajes').length,
    ausente: participantes.filter((fila) => fila.asistencia === 'ausente').length,
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map(({ key, label, icon: Icon, formato }) => (
          <article key={key} className="rounded-xl border border-[#dbe4d9] bg-white p-4">
            <span className="mb-3 grid size-9 place-items-center rounded-lg bg-[#eaf4ea] text-[#1d6649]"><Icon size={20} aria-hidden="true" /></span>
            <p className="text-sm font-medium text-[#4c6658]">{label}</p>
            <p className="mt-1 break-words text-xl font-semibold text-[#173a2b]">{formato(totales[key])}</p>
          </article>
        ))}
      </div>
      <section className="rounded-xl border border-[#dbe4d9] bg-white p-4 sm:p-5" aria-label="Asistencia de la jornada">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#eaf4ea] text-[#1d6649]"><ClipboardList size={20} aria-hidden="true" /></span>
            <div><h2 className="text-base font-semibold text-[#173a2b]">Asistencia de la jornada</h2><p className="mt-1 text-sm text-[#4c6658]">{mostrarKilos(totales.kg_por_cobrar)} pendientes de cobrar</p></div>
          </div>
          <Button type="button" variant="secondary" onClick={onParticipantes}>Ver participantes</Button>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.entries(asistencia).map(([key, total]) => (
            <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-[#f3f6ef] px-3 py-2.5">
              <dt className="text-sm font-medium text-[#4c6658]">{formatoAsistencia[key]?.label ?? key}</dt>
              <dd className="font-semibold text-[#173a2b]">{total}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export function ParticipantesJornada({ recurso, onInscribir, onPesar }) {
  const [busqueda, setBusqueda] = useState('')
  if (recurso.error && !recurso.datos) return <MensajeJornada onRetry={recurso.actualizar}>{recurso.error.message}</MensajeJornada>
  if (!recurso.datos) return <CargandoJornada texto="Cargando participantes…" />
  const participantes = recurso.datos.participantes
  const filas = participantes.filter((fila) => fila.nombre.toLocaleLowerCase('es-CO').includes(busqueda.toLocaleLowerCase('es-CO').trim()))
  const inscribir = <Button type="button" onClick={onInscribir}>Inscribir trabajador</Button>
  const columnas = [
    { etiqueta: 'Trabajador', mostrar: (fila) => <strong className="font-semibold text-[#173a2b]">{fila.nombre}</strong> },
    { etiqueta: 'Asistencia', mostrar: (fila) => <EtiquetaJornada tone={formatoAsistencia[fila.asistencia]?.tone}>{formatoAsistencia[fila.asistencia]?.label ?? fila.asistencia}</EtiquetaJornada> },
    { etiqueta: 'Kilos activos', mostrar: (fila) => mostrarKilos(fila.kg_activos) },
    { etiqueta: 'Kilos por cobrar', mostrar: (fila) => mostrarKilos(fila.kg_por_cobrar) },
    { etiqueta: 'Acciones', id: 'acciones', mostrar: (fila) => <Button type="button" variant="secondary" onClick={() => onPesar(fila)}>Registrar pesaje</Button> },
  ]

  return (
    <section className="rounded-xl border border-[#dbe4d9] bg-white p-4 sm:p-5">
      {participantes.length ? <>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <label className="grid min-w-0 flex-grow gap-1 text-sm font-semibold text-[#254a3b] sm:max-w-xs">
            <span>Buscar participante</span>
            <input type="search" className="min-h-11 w-full rounded-lg border border-[#cddbd0] bg-white px-3 text-sm focus:border-[#28674d] focus-visible:outline-[#1d6649]" placeholder="Nombre del trabajador" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </label>
          {inscribir}
        </div>
        {filas.length ? <TablaJornada columnas={columnas} filas={filas} clave={(fila) => fila.id_participacion} /> : <EmptyState title="Sin coincidencias" description="Prueba con otro nombre." />}
      </> : <EmptyState title="Aún no hay participantes" description="Inscribe a los trabajadores para registrar sus pesajes." action={inscribir} />}
    </section>
  )
}

export function PesajesJornada({ recurso, participantes, pagina, cambiar, onPesar, onCorregir, onInactivar }) {
  const botonPeso = <Button type="button" disabled={!participantes.length} onClick={() => onPesar()}>Registrar pesaje</Button>
  const nombres = new Map(participantes.map((fila) => [fila.id_participacion, fila.nombre]))
  const columnas = [
    { etiqueta: 'Trabajador', mostrar: (fila) => <strong className="font-semibold text-[#173a2b]">{nombres.get(fila.fk_participacion) ?? `Participación ${fila.fk_participacion}`}</strong> },
    { etiqueta: 'Fecha y hora', mostrar: (fila) => mostrarFecha(fila.fecha_hora_pesaje, true) },
    { etiqueta: 'Peso', mostrar: (fila) => mostrarKilos(fila.kg_recolectados) },
    { etiqueta: 'Estado', mostrar: (fila) => <EtiquetaJornada tone={fila.activo ? 'success' : 'neutral'}>{fila.activo ? fila.cobrado ? 'Pagado' : 'Activo' : 'Inactivo'}</EtiquetaJornada> },
    { etiqueta: 'Acciones', id: 'acciones', mostrar: (fila) => fila.activo && !fila.cobrado ? (
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => onCorregir(fila)}>Corregir</Button>
        <Button type="button" variant="ghost" onClick={() => onInactivar(fila)}>Inactivar</Button>
      </div>
    ) : <span className="text-[#597065]">—</span> },
  ]

  return <PanelDatos
    titulo="Pesajes registrados" recurso={recurso} pagina={pagina} cambiar={cambiar}
    columnas={columnas} keyFila={(fila) => `${fila.fk_participacion}-${fila.fecha_hora_pesaje}`}
    accion={botonPeso} tituloVacio="Aún no hay pesajes"
    descripcionVacia={participantes.length ? 'Registra el primer pesaje de la jornada.' : 'Inscribe a un trabajador para empezar a registrar pesajes.'}
  />
}

export function PagosJornada({ recurso, pagina, cambiar, onLiquidar, onPagar }) {
  const columnas = [
    { etiqueta: 'Trabajador', mostrar: (fila) => <strong className="font-semibold text-[#173a2b]">{fila.trabajador}</strong> },
    { etiqueta: 'Peso', mostrar: (fila) => mostrarKilos(fila.total_kg_recolectados) },
    { etiqueta: 'Importe', mostrar: (fila) => mostrarDinero(fila.total_pagar) },
    { etiqueta: 'Estado', mostrar: (fila) => <EtiquetaJornada tone={fila.estado_pago === 'pagado' ? 'success' : 'warning'}>{fila.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}</EtiquetaJornada> },
    { etiqueta: 'Fecha de pago', mostrar: (fila) => mostrarFecha(fila.fecha_pago, true) },
    { etiqueta: 'Acciones', id: 'acciones', mostrar: (fila) => fila.estado_pago === 'pendiente' ? <Button type="button" onClick={() => onPagar(fila)}>Confirmar pago</Button> : <span className="text-[#597065]">—</span> },
  ]

  return <PanelDatos
    titulo="Pagos de la jornada" recurso={recurso} pagina={pagina} cambiar={cambiar}
    columnas={columnas} keyFila={(fila) => fila.id_pago}
    accion={<Button type="button" variant="secondary" onClick={onLiquidar}>Liquidar jornada</Button>}
    tituloVacio="Aún no hay pagos" descripcionVacia="Liquida la jornada para consultar los importes pendientes."
  />
}

function PanelDatos({ titulo, recurso, pagina, cambiar, columnas, keyFila, accion, tituloVacio, descripcionVacia }) {
  if (recurso.error && !recurso.datos) return <MensajeJornada onRetry={recurso.actualizar}>{recurso.error.message}</MensajeJornada>
  if (!recurso.datos) return <CargandoJornada />
  const tieneDatos = recurso.datos.length > 0

  return (
    <section className="rounded-xl border border-[#dbe4d9] bg-white p-4 sm:p-5" aria-busy={recurso.cargando}>
      {tieneDatos ? <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold text-[#173a2b]">{titulo}</h2>{accion}</div>
        <TablaJornada columnas={columnas} filas={recurso.datos.slice(0, pageSize)} clave={keyFila} />
      </> : <EmptyState title={tituloVacio} description={descripcionVacia} action={accion} />}
      <PaginacionJornada pagina={pagina} cambiar={cambiar} haySiguiente={recurso.datos.length > pageSize} cargando={recurso.cargando} />
    </section>
  )
}
