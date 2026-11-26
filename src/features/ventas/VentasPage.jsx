import { useState } from 'react'
import { Plus, ReceiptText } from 'lucide-react'
import { Alert, Button, PageHead } from '../../components/ui.jsx'
import VentaDetalle from './VentaDetalle.jsx'
import VentaForm from './VentaForm.jsx'
import VentasFiltros from './VentasFiltros.jsx'
import VentasListado, { ColumnaMovil } from './VentasListado.jsx'
import { cantidad, dinero, fechaCalendario, FILTROS_VENTA, tipoDeCafe, urlListado, useConsultaVentas } from './salesData.js'

export default function VentasPage() {
  const [filtros, setFiltros] = useState(FILTROS_VENTA)
  const [pagina, setPagina] = useState(1)
  const [version, setVersion] = useState(0)
  const [versionCatalogos, setVersionCatalogos] = useState(0)
  const [creando, setCreando] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const catalogos = useConsultaVentas('/catalogos', versionCatalogos, 'catalogos')
  const consulta = useConsultaVentas(urlListado('/ventas', filtros, pagina, true), version)

  function aplicar(campos) {
    setFiltros(campos)
    setPagina(1)
    setVersion((n) => n + 1)
  }

  function guardado(venta) {
    setCreando(false)
    setMensaje('Venta #' + venta.id + ' registrada por ' + dinero(venta.valor_total) + '.')
    setPagina(1)
    setVersion((n) => n + 1)
    setDetalle(venta.id)
  }

  return (
    <section className="space-y-5">
      <PageHead
        title="Ventas"
        description="Registra las ventas de café y consulta su detalle."
        action={<Button onClick={() => { setMensaje(''); setCreando(true) }}><Plus size={18} /> Registrar venta</Button>}
      />
      {mensaje && <Alert tone="success">{mensaje}</Alert>}
      <VentasFiltros conFechas catalogos={catalogos} onApply={aplicar} onRetry={() => setVersionCatalogos((n) => n + 1)} />
      <VentasListado
        title="Ventas registradas" icon={ReceiptText} consulta={consulta} pagina={pagina} onPage={setPagina}
        onRetry={() => setVersion((n) => n + 1)} columnas={['Compradora', 'Jornada', 'Tipo', 'Peso', 'Total', '']}
        emptyTitle="Sin ventas para mostrar"
        render={(venta) => (
          <tr key={venta.id} className="grid grid-cols-2 gap-x-3 gap-y-2 p-4 sm:table-row sm:p-0">
            <td className="col-span-2 min-w-0"><p className="break-words font-semibold text-[#173e31]">{venta.nombre_compradora}</p><p className="mt-1 text-sm text-slate-600">{fechaCalendario(venta.fecha_venta)}</p></td>
            <td><ColumnaMovil>Jornada</ColumnaMovil>#{venta.fk_jornada}</td>
            <td><ColumnaMovil>Tipo</ColumnaMovil>{tipoDeCafe(venta.tipo_cafe)}</td>
            <td><ColumnaMovil>Peso</ColumnaMovil>{cantidad(venta.peso_cafe)} kg</td>
            <td className="break-words font-semibold"><ColumnaMovil>Total</ColumnaMovil>{dinero(venta.valor_total)}</td>
            <td className="col-span-2 text-right"><Button type="button" variant="secondary" aria-label={'Ver venta ' + venta.id} onClick={() => setDetalle(venta.id)}>Ver detalle</Button></td>
          </tr>
        )}
      />
      {creando && <VentaForm catalogos={catalogos} onClose={() => setCreando(false)} onSaved={guardado} onRetry={() => setVersionCatalogos((n) => n + 1)} />}
      {detalle && <VentaDetalle id={detalle} onClose={() => setDetalle(null)} />}
    </section>
  )
}
