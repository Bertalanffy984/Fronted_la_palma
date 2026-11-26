import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Alert, Button, Field, Select } from '../../components/ui.jsx'
import { fechaCalendario, FILTROS_VENTA } from './salesData.js'

export function OpcionesJornada({ jornadas = [], primera }) {
  return (
    <>
      <option value="">{primera}</option>
      {jornadas.map((jornada) => (
        <option key={jornada.id} value={jornada.id}>#{jornada.id} · {fechaCalendario(jornada.fecha_inicio)}</option>
      ))}
    </>
  )
}

export function OpcionesCompradora({ compradoras = [], primera }) {
  return (
    <>
      <option value="">{primera}</option>
      {compradoras.map((compradora) => (
        <option key={compradora.id} value={compradora.id}>{compradora.nombre_compradora}</option>
      ))}
    </>
  )
}

export function OpcionesTipo({ primera }) {
  return <>{primera && <option value="">{primera}</option>}<option value="seco">Seco</option><option value="mojado">Mojado</option></>
}

export default function VentasFiltros({ conFechas = false, catalogos, onApply, onRetry }) {
  const [campos, setCampos] = useState(FILTROS_VENTA)
  const [error, setError] = useState('')
  const listados = catalogos.datos ?? {}

  function cambiar(event) {
    setCampos((anterior) => ({ ...anterior, [event.target.name]: event.target.value }))
    setError('')
  }

  function aplicar(event) {
    event.preventDefault()
    if (campos.desde && campos.hasta && campos.desde > campos.hasta) {
      setError('La fecha final debe ser igual o posterior a la inicial.')
      return
    }
    onApply(campos)
  }

  function limpiar() {
    setCampos(FILTROS_VENTA)
    setError('')
    onApply(FILTROS_VENTA)
  }

  return (
    <form onSubmit={aplicar} className="lp-card grid gap-4 p-5">
      <h2 className="flex items-center gap-2 font-bold"><Filter size={17} className="text-[#1d6649]" /> Filtros</h2>
      {catalogos.error && <Alert tone="error"><div className="flex flex-wrap items-center justify-between gap-2"><span>Error al cargar los catálogos. {catalogos.error}</span><Button type="button" variant="secondary" onClick={onRetry}>Reintentar</Button></div></Alert>}
      <div className={'grid gap-3 sm:grid-cols-2 ' + (conFechas ? 'lg:grid-cols-3 2xl:grid-cols-5' : 'lg:grid-cols-3')}>
        <Field label="Jornada">
          <Select className="w-full" name="fk_jornada" value={campos.fk_jornada} onChange={cambiar}>
            <OpcionesJornada jornadas={listados.jornadas} primera="Todas las jornadas" />
          </Select>
        </Field>
        <Field label="Compradora">
          <Select className="w-full" name="fk_compradora" value={campos.fk_compradora} onChange={cambiar}>
            <OpcionesCompradora compradoras={listados.compradoras} primera="Todas las compradoras" />
          </Select>
        </Field>
        <Field label="Tipo de café">
          <Select className="w-full" name="tipo_cafe" value={campos.tipo_cafe} onChange={cambiar}>
            <OpcionesTipo primera="Seco y mojado" />
          </Select>
        </Field>
        {conFechas && <>
          <Field label="Desde"><input className="lp-input w-full min-w-0" type="date" name="desde" value={campos.desde} onChange={cambiar} max={campos.hasta || '9999-12-31'} /></Field>
          <Field label="Hasta"><input className="lp-input w-full min-w-0" type="date" name="hasta" value={campos.hasta} onChange={cambiar} min={campos.desde || undefined} max="9999-12-31" /></Field>
        </>}
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={limpiar}>Limpiar</Button>
        <Button type="submit">Aplicar filtros</Button>
      </div>
    </form>
  )
}
