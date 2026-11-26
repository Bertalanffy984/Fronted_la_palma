import { useState } from 'react'
import { ChartNoAxesCombined } from 'lucide-react'
import { PageHead } from '../../components/ui.jsx'
import VentasFiltros from './VentasFiltros.jsx'
import VentasListado, { ColumnaMovil } from './VentasListado.jsx'
import { cantidad, dinero, FILTROS_VENTA, tipoDeCafe, urlListado, useConsultaVentas } from './salesData.js'

export default function ReportesPage() {
  const [filtros, setFiltros] = useState(FILTROS_VENTA)
  const [pagina, setPagina] = useState(1)
  const [version, setVersion] = useState(0)
  const [versionCatalogos, setVersionCatalogos] = useState(0)
  const catalogos = useConsultaVentas('/catalogos', versionCatalogos, 'catalogos')
  const consulta = useConsultaVentas(urlListado('/reportes/ventas', filtros, pagina, false), version)

  function aplicar(campos) {
    setFiltros(campos)
    setPagina(1)
    setVersion((n) => n + 1)
  }

  return (
    <section className="space-y-5">
      <PageHead title="Reportes de ventas" description="Consulta el peso vendido y los ingresos por jornada, compradora y tipo de café." />
      <VentasFiltros catalogos={catalogos} onApply={aplicar} onRetry={() => setVersionCatalogos((n) => n + 1)} />
      <VentasListado
        title="Resumen de ventas" icon={ChartNoAxesCombined} consulta={consulta} pagina={pagina} onPage={setPagina}
        onRetry={() => setVersion((n) => n + 1)} columnas={['Compradora', 'Jornada', 'Tipo', 'Ventas', 'Peso vendido', 'Ingresos']}
        emptyTitle="Sin ventas en este reporte"
        render={(fila) => (
          <tr key={[fila.fk_jornada, fila.fk_compradora, fila.tipo_cafe, fila.nombre_compradora].join(':')} className="grid grid-cols-2 gap-x-3 gap-y-2 p-4 sm:table-row sm:p-0">
            <td className="col-span-2 min-w-0 break-words font-semibold text-[#173e31]">{fila.nombre_compradora}</td>
            <td><ColumnaMovil>Jornada</ColumnaMovil>#{fila.fk_jornada}</td>
            <td><ColumnaMovil>Tipo</ColumnaMovil>{tipoDeCafe(fila.tipo_cafe)}</td>
            <td><ColumnaMovil>Ventas</ColumnaMovil>{fila.numero_ventas}</td>
            <td><ColumnaMovil>Peso vendido</ColumnaMovil>{cantidad(fila.kg_vendidos)} kg</td>
            <td className="col-span-2 break-words font-semibold"><ColumnaMovil>Ingresos</ColumnaMovil>{dinero(fila.ingresos)}</td>
          </tr>
        )}
      />
    </section>
  )
}
