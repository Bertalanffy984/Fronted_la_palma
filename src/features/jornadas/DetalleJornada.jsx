import { useState } from 'react'
import { CalendarCheck, CloudCheck, CloudCog, RefreshCw } from 'lucide-react'
import { Button, PageHead } from '../../components/ui.jsx'
import FormularioJornada from './FormularioJornada.jsx'
import { ResumenJornada, ParticipantesJornada, PesajesJornada, PagosJornada } from './PestanasJornada.jsx'
import { CargandoJornada, EtiquetaJornada, MensajeJornada } from './JornadaUI.jsx'
import { mostrarDinero, mostrarFecha } from './formatoJornada.js'
import { listado } from './jornadasApi.js'
import useRecursoJornada from './useRecursoJornada.js'

const secciones = [
  ['resumen', 'Resumen'],
  ['participantes', 'Participantes'],
  ['pesajes', 'Pesajes'],
  ['pagos', 'Pagos'],
]

function TarjetaSincronizacion({ recurso }) {
  const estado = recurso.datos
  const lista = estado?.sincronizado
  const fallo = estado?.ultimo_error
  const Icono = lista ? CloudCheck : CloudCog
  const texto = estado ? (lista ? 'Sincronizada' : fallo ? 'En reintento' : 'Pendiente') : 'Consultando estado'
  return <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#edf5ed] text-[#1d6649]"><Icono size={18} aria-hidden="true" /></span>
      <div>
        <p className="text-sm font-bold text-[#1f5139]">Sincronización con MongoDB</p>
        {recurso.error ? <p className="text-sm text-red-700">{recurso.error.message}</p> : <p className="text-sm text-[#577062]">{estado ? 'Revisión ' + estado.revision_sincronizada + ' de ' + estado.revision : 'Cargando estado…'}</p>}
        {fallo && <p className="mt-1 text-sm text-[#82551f]">{fallo}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <EtiquetaJornada tone={lista ? 'success' : estado ? 'warning' : 'neutral'}>{texto}</EtiquetaJornada>
      <Button variant="ghost" onClick={recurso.actualizar} aria-label="Actualizar sincronización"><RefreshCw size={17} aria-hidden="true" /></Button>
    </div>
  </div>
}

export default function DetalleJornada({ id, onVolver }) {
  const [tab, setTab] = useState('resumen')
  const [paginaPesajes, setPaginaPesajes] = useState(0)
  const [paginaPagos, setPaginaPagos] = useState(0)
  const [accion, setAccion] = useState(null)
  const [noticia, setNoticia] = useState(null)
  const ruta = '/jornadas/' + id
  const jornada = useRecursoJornada(ruta)
  const resumen = useRecursoJornada(ruta + '/resumen')
  const pesajes = useRecursoJornada(tab === 'pesajes' ? listado(ruta + '/pesajes', paginaPesajes) : null)
  const pagos = useRecursoJornada(tab === 'pagos' ? listado(ruta + '/pagos', paginaPagos) : null)
  const sync = useRecursoJornada(ruta + '/sincronizacion', { intervalo: 5000 })
  const seleccion = jornada.datos
  const participantes = resumen.datos?.participantes ?? []

  function cambiar(tipo, fila) {
    setAccion({ tipo, fila })
  }

  function actualizar(resultado) {
    setAccion(null)
    setNoticia(resultado)
    jornada.actualizar()
    resumen.actualizar()
    pesajes.actualizar()
    pagos.actualizar()
    sync.actualizar()
  }

  return <>
    <Button variant="secondary" className="mb-4" onClick={onVolver}>Volver a jornadas</Button>
    <PageHead title={'Jornada ' + id} description={seleccion && mostrarFecha(seleccion.fecha_inicio, true)}
      action={seleccion?.estado === 'abierta' && <Button variant="secondary" onClick={() => cambiar('cerrar')}>
        <CalendarCheck size={19} aria-hidden="true" />Cerrar jornada
      </Button>} />
    {jornada.error && !seleccion ? <MensajeJornada onRetry={jornada.actualizar}>{jornada.error.message}</MensajeJornada> : !seleccion
      ? <CargandoJornada texto="Cargando jornada…" />
      : <div className="space-y-4">
        {noticia && <MensajeJornada tone={noticia.tone}>{noticia.mensaje}</MensajeJornada>}
        <section className="lp-card grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)]">
          <div className="flex flex-wrap items-center gap-2.5">
            <EtiquetaJornada tone={seleccion.estado === 'abierta' ? 'success' : 'neutral'}>{seleccion.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</EtiquetaJornada>
            <span className="text-sm font-semibold text-[#34604a]">{mostrarDinero(seleccion.precio_pagar_kg)} por kilo</span>
            {seleccion.fecha_fin && <span className="text-sm text-[#577062]">Cierre {mostrarFecha(seleccion.fecha_fin)}</span>}
          </div>
          <TarjetaSincronizacion recurso={sync} />
        </section>
        <div aria-label="Secciones de la jornada" role="group" className="lp-card flex flex-wrap gap-1 p-1.5">
          {secciones.map(([valor, etiqueta]) => <Button key={valor} variant={tab === valor ? 'primary' : 'ghost'}
            aria-pressed={tab === valor} onClick={() => setTab(valor)}>{etiqueta}</Button>)}
        </div>
        {tab === 'resumen' && <ResumenJornada recurso={resumen} onParticipantes={() => setTab('participantes')} />}
        {tab === 'participantes' && <ParticipantesJornada recurso={resumen} onInscribir={() => cambiar('inscribir')} onPesar={(fila) => cambiar('pesar', fila)} />}
        {tab === 'pesajes' && <PesajesJornada recurso={pesajes} participantes={participantes} pagina={paginaPesajes}
          cambiar={setPaginaPesajes} onPesar={() => cambiar('pesar')} onCorregir={(fila) => cambiar('corregir', fila)} onInactivar={(fila) => cambiar('inactivar', fila)} />}
        {tab === 'pagos' && <PagosJornada recurso={pagos} pagina={paginaPagos} cambiar={setPaginaPagos}
          onLiquidar={() => cambiar('liquidar')} onPagar={(fila) => cambiar('pagar', fila)} />}
        {accion && <FormularioJornada accion={accion} jornada={seleccion} participantes={participantes}
          onClose={() => setAccion(null)} onSuccess={actualizar} />}
      </div>}
  </>
}
