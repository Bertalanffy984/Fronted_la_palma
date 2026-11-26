import { useState } from 'react'
import { Alert, Button, Spinner } from '../../components/ui.jsx'
import VentaDialog from './VentaDialog.jsx'
import { cantidad, dinero, fechaCalendario, tipoDeCafe, useConsultaVentas } from './salesData.js'

export default function VentaDetalle({ id, onClose }) {
  const [version, setVersion] = useState(0)
  const { datos: venta, error, cargando } = useConsultaVentas('/ventas/' + id, version)

  return (
    <VentaDialog title={'Venta #' + id} description={venta?.nombre_compradora} onClose={onClose}>
      {error ? <Alert tone="error"><div className="flex flex-wrap items-center justify-between gap-2"><span>{error}</span><Button variant="secondary" onClick={() => setVersion((n) => n + 1)}>Reintentar</Button></div></Alert> :
        cargando ? <div className="grid min-h-28 place-items-center"><Spinner /></div> : venta && (
          <div>
            <div className="rounded-xl bg-[#eef5eb] px-4 py-3">
              <p className="text-sm font-semibold text-[#31644f]">Valor total</p>
              <p className="mt-1 break-words text-3xl font-extrabold text-[#175039]">{dinero(venta.valor_total)}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                ['Fecha de venta', fechaCalendario(venta.fecha_venta)],
                ['Jornada', '#' + venta.fk_jornada],
                ['Modalidad de café', tipoDeCafe(venta.tipo_cafe)],
                ['Peso', cantidad(venta.peso_cafe) + ' kg'],
                ['Cargas', cantidad(venta.cantidad_cargas)],
                ['Precio por carga', dinero(venta.precio_carga)],
                ['Precio por kilo', dinero(venta.precio_kg_venta)],
                ['Encargado', '#' + venta.fk_encargado],
              ].map(([label, texto]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-sm text-slate-600">{label}</dt>
                  <dd className="mt-1 break-words font-semibold">{texto}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
    </VentaDialog>
  )
}
