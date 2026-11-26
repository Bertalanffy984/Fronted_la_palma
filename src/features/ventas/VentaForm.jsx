import { useState } from 'react'
import { api } from '../../api/client.js'
import { Alert, Button, Field, Select, Spinner } from '../../components/ui.jsx'
import VentaDialog from './VentaDialog.jsx'
import { OpcionesCompradora, OpcionesJornada, OpcionesTipo } from './VentasFiltros.jsx'
import { dinero, fechaCalendario, hoyEnLaFinca, useConsultaVentas } from './salesData.js'

export default function VentaForm({ catalogos, onClose, onSaved, onRetry }) {
  const [campos, setCampos] = useState(() => ({
    fk_jornada: '', compradora: '', fk_precio: '', tipo_cafe: 'seco', fecha_venta: hoyEnLaFinca(), peso_cafe: '',
  }))
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [reintento, setReintento] = useState(0)
  const precios = useConsultaVentas(campos.compradora ? '/precios?fk_compradora=' + campos.compradora : null, reintento, 'todos')
  const precioActual = precios.datos?.find((precio) => precio.id === Number(campos.fk_precio))
  const listados = catalogos.datos ?? {}

  function cambiar(event) {
    const { name, value } = event.target
    setCampos((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === 'compradora' ? { fk_precio: '' } : {}),
    }))
    setError('')
  }

  async function registrar(event) {
    event.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const venta = await api('/ventas', {
        method: 'POST',
        body: {
          fk_jornada: Number(campos.fk_jornada),
          fk_precio: Number(campos.fk_precio),
          tipo_cafe: campos.tipo_cafe,
          fecha_venta: campos.fecha_venta,
          peso_cafe: campos.peso_cafe,
        },
      })
      onSaved(venta)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <VentaDialog title="Registrar venta" description="Selecciona la jornada y el precio acordado con la compradora." onClose={onClose} busy={enviando}>
      {catalogos.cargando ? <div className="grid min-h-28 place-items-center"><Spinner /></div> : catalogos.error ? (
        <Alert tone="error"><div className="flex flex-wrap items-center justify-between gap-2"><span>{catalogos.error}</span><Button type="button" variant="secondary" onClick={onRetry}>Reintentar</Button></div></Alert>
      ) : (
        <form onSubmit={registrar} className="grid gap-4">
          {(!listados.jornadas?.length || !listados.compradoras?.length) && (
            <Alert>Para registrar una venta necesitas al menos una jornada y una compradora con precios.</Alert>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Jornada">
              <Select className="w-full" name="fk_jornada" value={campos.fk_jornada} onChange={cambiar} disabled={enviando} required>
                <OpcionesJornada jornadas={listados.jornadas} primera="Selecciona la jornada" />
              </Select>
            </Field>
            <Field label="Compradora">
              <Select className="w-full" name="compradora" value={campos.compradora} onChange={cambiar} disabled={enviando} required>
                <OpcionesCompradora compradoras={listados.compradoras} primera="Selecciona la compradora" />
              </Select>
            </Field>
            <Field label="Tipo de café">
              <Select className="w-full" name="tipo_cafe" value={campos.tipo_cafe} onChange={cambiar} disabled={enviando} required>
                <OpcionesTipo />
              </Select>
            </Field>
            <Field label="Fecha de venta">
              <input type="date" className="lp-input w-full min-w-0" name="fecha_venta" value={campos.fecha_venta} onChange={cambiar} disabled={enviando} max="9999-12-31" required />
            </Field>
          </div>
          <Field label="Precio por carga">
            <Select className="w-full" name="fk_precio" value={campos.fk_precio} onChange={cambiar} required disabled={!campos.compradora || precios.cargando || Boolean(precios.error) || enviando}>
              <option value="">{!campos.compradora ? 'Selecciona primero la compradora' : precios.cargando ? 'Cargando precios…' : precios.datos?.length ? 'Selecciona el precio' : 'Sin precios registrados'}</option>
              {precios.datos?.map((precio) => (
                <option key={precio.id} value={precio.id}>{fechaCalendario(precio.fecha)} · {dinero(precio['precio_carga_' + campos.tipo_cafe])} · #{precio.id}</option>
              ))}
            </Select>
          </Field>
          {precios.error && <Alert tone="error"><div className="flex flex-wrap items-center justify-between gap-2"><span>{precios.error}</span><Button type="button" variant="secondary" onClick={() => setReintento((n) => n + 1)}>Reintentar</Button></div></Alert>}
          <Field label="Peso de café (kg)">
            <input type="number" className="lp-input w-full" inputMode="decimal" name="peso_cafe" value={campos.peso_cafe} onChange={cambiar} min="0.001" max="999999999.999" step="0.001" disabled={enviando} required />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-[#e7eee5] pt-4">
            <Button type="button" variant="secondary" disabled={enviando} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={enviando || !precioActual || !campos.fk_jornada}>{enviando ? 'Registrando…' : 'Registrar venta'}</Button>
          </div>
        </form>
      )}
    </VentaDialog>
  )
}
