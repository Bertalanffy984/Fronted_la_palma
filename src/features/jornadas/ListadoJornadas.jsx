import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Button, EmptyState } from '../../components/ui.jsx'
import { listado, pageSize } from './jornadasApi.js'
import { mostrarDinero, mostrarFecha } from './formatoJornada.js'
import { CargandoJornada, EtiquetaJornada, MensajeJornada, PaginacionJornada, TablaJornada } from './JornadaUI.jsx'
import useRecursoJornada from './useRecursoJornada.js'

export default function ListadoJornadas({ onCrear, onAbrir }) {
  const [pagina, cambiarPagina] = useState(0)
  const recurso = useRecursoJornada(listado('/jornadas', pagina))
  const filas = recurso.datos?.slice(0, pageSize) ?? []
  const columnas = [
    { etiqueta: 'Jornada', mostrar: (fila) => <span className="font-bold text-[#173e2d]">Jornada {fila.id}</span> },
    { etiqueta: 'Fecha de inicio', mostrar: (fila) => mostrarFecha(fila.fecha_inicio, true) },
    { etiqueta: 'Tarifa por kg', mostrar: (fila) => mostrarDinero(fila.precio_pagar_kg) },
    { etiqueta: 'Estado', mostrar: (fila) => <EtiquetaJornada tone={fila.estado === 'abierta' ? 'success' : 'neutral'}>{fila.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</EtiquetaJornada> },
    { etiqueta: 'Acciones', id: 'acciones', mostrar: (fila) => <Button variant="secondary" onClick={() => onAbrir(fila.id)} aria-label={'Abrir jornada ' + fila.id}>Abrir jornada</Button> },
  ]
  return <section className="lp-card min-w-0 p-4 sm:p-5" aria-label="Listado de jornadas">
    <div className="mb-4 flex items-center gap-2 text-[#244b37]">
      <CalendarDays size={20} aria-hidden="true" /><h2 className="font-bold">Jornadas de recolección</h2>
    </div>
    {recurso.error && <div className="mb-3"><MensajeJornada onRetry={recurso.actualizar}>{recurso.error.message}</MensajeJornada></div>}
    {recurso.cargando && !recurso.datos ? <CargandoJornada /> : filas.length
      ? <TablaJornada columnas={columnas} filas={filas} clave={(fila) => fila.id} />
      : !recurso.error && <EmptyState title="No hay jornadas para mostrar" description="Crea una jornada para registrar la recolección." action={<Button onClick={onCrear}>Nueva jornada</Button>} />}
    <PaginacionJornada pagina={pagina} cambiar={cambiarPagina} haySiguiente={(recurso.datos?.length ?? 0) > pageSize} cargando={recurso.cargando} />
  </section>
}
