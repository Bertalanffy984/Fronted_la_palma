import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../components/ui.jsx'
import { ejecutarAccion, trabajadoresParaJornada } from './jornadasApi.js'
import { ahoraBogota, mostrarDinero, mostrarFecha, mostrarKilos, nombreTrabajador } from './formatoJornada.js'
import useRecursoJornada from './useRecursoJornada.js'
import { CargandoJornada, MensajeJornada } from './JornadaUI.jsx'

const configuracion = {
  crear: ['Nueva jornada', 'Crear jornada'],
  cerrar: ['Cerrar jornada', 'Confirmar cierre'],
  inscribir: ['Inscribir trabajador', 'Inscribir trabajador'],
  pesar: ['Registrar pesaje', 'Guardar pesaje'],
  corregir: ['Corregir pesaje', 'Guardar corrección'],
  inactivar: ['Inactivar pesaje', 'Inactivar pesaje'],
  liquidar: ['Liquidar jornada', 'Liquidar jornada'],
  pagar: ['Confirmar pago', 'Confirmar pago'],
}

const campo = 'w-full min-h-11 rounded-lg border border-[#cddbd0] bg-white px-3 py-2 text-sm text-[#18392b] focus:border-[#28674d] focus:outline-none focus:ring-2 focus:ring-[#c7e1d0] disabled:bg-[#edf2ed]'

function Campo({ label, children }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-[#254a3b]"><span>{label}</span>{children}</label>
}

function SelectorTrabajador({ trabajadores, participantes }) {
  const [busqueda, setBusqueda] = useState('')
  const inscritos = new Set(participantes.map((persona) => persona.id_trabajador))
  const disponibles = trabajadores.datos?.filter((persona) => !inscritos.has(persona.id)) ?? []
  const texto = busqueda.toLocaleLowerCase('es-CO').trim()
  const filtrados = disponibles.filter((persona) => (
    `${nombreTrabajador(persona)} ${persona.documento}`.toLocaleLowerCase('es-CO').includes(texto)
  ))

  if (trabajadores.error) return <MensajeJornada onRetry={trabajadores.actualizar}>{trabajadores.error.message}</MensajeJornada>
  if (!trabajadores.datos) return <CargandoJornada texto="Buscando trabajadores…" />
  if (!disponibles.length) return <p className="text-sm text-[#4c6658]">No hay trabajadores disponibles. Puedes registrar uno desde el módulo Trabajadores.</p>

  return (
    <>
      <Campo label="Filtrar por nombre o documento">
        <input type="search" className={campo} placeholder="Nombre o documento" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </Campo>
      <Campo label="Trabajador">
        <select key={texto} name="fk_trabajador" className={campo} required defaultValue="">
          <option value="" disabled>{filtrados.length ? 'Selecciona un trabajador' : 'Sin coincidencias'}</option>
          {filtrados.map((persona) => <option key={persona.id} value={persona.id}>{nombreTrabajador(persona)} · {persona.documento}</option>)}
        </select>
      </Campo>
    </>
  )
}

function CamposAccion({ tipo, fila, jornada, participantes, trabajadores, fecha }) {
  const campoKilos = (valor) => (
    <Campo label="Peso en kilogramos">
      <input type="number" name="kg_recolectados" className={campo} inputMode="decimal" min="0.001" max="999999999.999" step="0.001" required defaultValue={valor} placeholder="0,000" />
    </Campo>
  )
  switch (tipo) {
    case 'crear':
      return <>
        <Campo label="Fecha y hora de inicio">
          <input type="datetime-local" name="fecha_inicio" className={campo} required step="1" defaultValue={fecha} />
        </Campo>
        <Campo label="Tarifa por kilogramo (COP)">
          <input type="number" name="precio_pagar_kg" className={campo} inputMode="decimal" min="0.01" max="9999999999.99" step="0.01" required placeholder="1500" />
        </Campo>
      </>
    case 'cerrar':
      return <Campo label="Fecha de cierre">
        <input type="date" name="fecha_fin" className={campo} min={jornada?.fecha_inicio?.slice(0, 10)} defaultValue={fecha.slice(0, 10)} required />
      </Campo>
    case 'inscribir':
      return <SelectorTrabajador trabajadores={trabajadores} participantes={participantes} />
    case 'pesar':
      return <>
        <Campo label="Trabajador inscrito">
          <select name="id_participacion" className={campo} required defaultValue={fila?.id_participacion ?? ''}>
            <option value="" disabled>Selecciona un participante</option>
            {participantes.map((persona) => <option key={persona.id_participacion} value={persona.id_participacion}>{persona.nombre}</option>)}
          </select>
        </Campo>
        <Campo label="Fecha y hora del pesaje">
          <input type="datetime-local" name="fecha_hora_pesaje" className={campo} defaultValue={fecha} step="1" required />
        </Campo>
        {campoKilos()}
      </>
    case 'corregir':
      return <>
        <p className="text-sm text-[#4c6658]">Pesaje del {mostrarFecha(fila.fecha_hora_pesaje, true)}.</p>
        {campoKilos(fila.kg_recolectados)}
      </>
    case 'inactivar':
      return <p className="text-[#345747]">El pesaje de <strong>{mostrarKilos(fila.kg_recolectados)}</strong> del {mostrarFecha(fila.fecha_hora_pesaje, true)} se excluirá de los totales y seguirá visible en el registro.</p>
    case 'liquidar':
      return <p className="text-[#345747]">Se calcularán los importes pendientes de la jornada según los pesajes registrados y la tarifa de {mostrarDinero(jornada.precio_pagar_kg)} por kilogramo.</p>
    case 'pagar':
      return <p className="text-[#345747]">Confirma el pago de <strong>{mostrarDinero(fila.total_pagar)}</strong> a <strong>{fila.trabajador}</strong> por {mostrarKilos(fila.total_kg_recolectados)}.</p>
    default:
      return null
  }
}

export default function FormularioJornada({ accion, jornada, participantes = [], onClose, onSuccess }) {
  const { tipo, fila } = accion
  const [fecha] = useState(ahoraBogota)
  const referencia = useRef(null)
  const ejecutando = useRef(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const tituloId = useId()
  const trabajadores = useRecursoJornada(tipo === 'inscribir' ? '/trabajadores' : null, { cargar: trabajadoresParaJornada })
  const [titulo, boton] = configuracion[tipo]

  useEffect(() => {
    const dialogo = referencia.current
    if (!dialogo.open) dialogo.showModal()
    return () => { if (dialogo.open) dialogo.close() }
  }, [])

  async function enviar(evento) {
    evento.preventDefault()
    if (ejecutando.current) return
    ejecutando.current = true
    setGuardando(true)
    setError('')
    try {
      const respuesta = await ejecutarAccion({ tipo, id: jornada?.id, fila, datos: new FormData(evento.currentTarget) })
      onSuccess(respuesta)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo completar la operación.')
    } finally {
      ejecutando.current = false
      setGuardando(false)
    }
  }

  const sinTrabajadores = tipo === 'inscribir' && !trabajadores.datos?.some((persona) => (
    !participantes.some((inscrito) => inscrito.id_trabajador === persona.id)
  ))

  return (
    <dialog
      ref={referencia}
      aria-labelledby={tituloId}
      className="inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-auto rounded-2xl border border-[#dbe4d9] bg-white p-5 shadow-xl backdrop:bg-[#102b20]/55 sm:p-6"
      onCancel={(evento) => { evento.preventDefault(); if (!ejecutando.current) onClose() }}
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 id={tituloId} className="text-xl font-semibold text-[#173a2b]">{titulo}</h2>
        <button type="button" aria-label="Cerrar diálogo" className="grid size-10 place-items-center rounded-lg text-[#44675a] hover:bg-[#eff5ed] focus-visible:outline-[#1d6649]" disabled={guardando} onClick={onClose}>
          <X size={21} aria-hidden="true" />
        </button>
      </header>
      <form aria-busy={guardando} onSubmit={enviar}>
        <fieldset className="grid min-w-0 gap-4" disabled={guardando}>
          <CamposAccion tipo={tipo} fila={fila} jornada={jornada} participantes={participantes} trabajadores={trabajadores} fecha={fecha} />
        </fieldset>
        {error && <div className="mt-4"><MensajeJornada>{error}</MensajeJornada></div>}
        <footer className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" disabled={guardando} onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant={tipo === 'inactivar' ? 'danger' : 'primary'} disabled={guardando || sinTrabajadores || (tipo === 'pesar' && !participantes.length)}>
            {guardando ? 'Guardando…' : boton}
          </Button>
        </footer>
      </form>
    </dialog>
  )
}
