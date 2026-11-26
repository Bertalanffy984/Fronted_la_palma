import { useState } from 'react'
import { Building2, CircleDollarSign, Plus, Search } from 'lucide-react'
import { Button, PageHead } from '../../components/ui.jsx'
import CatalogTable, { CatalogTabs, InlineNotice } from './CatalogTable.jsx'
import { CatalogDelete, CatalogEditor, CatalogField, CatalogSelect } from './CatalogDialogs.jsx'
import { displayDate, displayMoney, todayInBogota } from './catalogApi.js'
import { useCatalog, useCatalogOptions } from './useCatalog.js'

const tabs = [
  { id: 'compradora', label: 'Compradoras', Icon: Building2 },
  { id: 'precio', label: 'Precios', Icon: CircleDollarSign },
]
const routes = { compradora: '/compradoras', precio: '/precios' }
const emptyFilters = { fk_compradora: '', desde: '', hasta: '' }
const name = (row) => row.nombre_compradora
const buyerFields = [
  { name: 'nombre_compradora', label: 'Nombre de la compradora', required: true, maxLength: 160, wide: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel', maxLength: 25, wide: true },
]
const buyerColumns = [
  { key: 'nombre', label: 'Compradora', render: (row) => <strong className="font-semibold text-[#193b2b]">{name(row)}</strong> },
  { key: 'telefono', label: 'Teléfono', render: (row) => row.telefono ?? '—' },
]
const priceInputs = [
  { name: 'fecha', label: 'Fecha de la tarifa', type: 'date', required: true, wide: true },
  { name: 'precio_carga_seco', label: 'Carga de café seco (COP)', type: 'number', min: '0.01', max: '999999999999.99', step: '0.01', required: true },
  { name: 'precio_carga_mojado', label: 'Carga de café mojado (COP)', type: 'number', min: '0.01', max: '999999999999.99', step: '0.01', required: true },
]

function buyerBody(values) {
  return { nombre_compradora: values.nombre_compradora.trim(), telefono: values.telefono?.trim() || null }
}

function priceBody(values) {
  return {
    fk_compradora: Number(values.fk_compradora),
    fecha: values.fecha,
    precio_carga_seco: values.precio_carga_seco,
    precio_carga_mojado: values.precio_carga_mojado,
  }
}

function PriceFilters({ buyers, value, onChange, onFilter, onClear, filtering }) {
  return (
    <form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); onFilter() }}>
      <CatalogField label="Compradora">
        <CatalogSelect value={value.fk_compradora} disabled={buyers.loading || !!buyers.error} onChange={(event) => onChange({ ...value, fk_compradora: event.target.value })}>
          <option value="">Todas las compradoras</option>
          {buyers.rows.map((buyer) => <option key={buyer.id} value={buyer.id}>{name(buyer)}</option>)}
        </CatalogSelect>
      </CatalogField>
      <CatalogField label="Desde">
        <input className="lp-input w-full" type="date" max={value.hasta || undefined} value={value.desde} onChange={(event) => onChange({ ...value, desde: event.target.value })} />
      </CatalogField>
      <CatalogField label="Hasta">
        <input className="lp-input w-full" type="date" min={value.desde || undefined} value={value.hasta} onChange={(event) => onChange({ ...value, hasta: event.target.value })} />
      </CatalogField>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary"><Search aria-hidden="true" size={17} />Filtrar</Button>
        {filtering && <Button type="button" variant="ghost" onClick={onClear}>Limpiar</Button>}
      </div>
    </form>
  )
}

export default function CompradorasPage() {
  const [section, setSection] = useState('compradora')
  const [draft, setDraft] = useState(emptyFilters)
  const [filters, setFilters] = useState(emptyFilters)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [optionsRevision, setOptionsRevision] = useState(0)
  const buyers = useCatalogOptions('/compradoras', optionsRevision)
  const prices = section === 'precio'
  const catalog = useCatalog(routes[section], prices ? filters : {})
  const filtering = prices && Object.values(filters).some(Boolean)
  const close = () => setDialog(null)

  const open = (action, entry = null, kind = section) => {
    setNotice('')
    setDialog({ action, entry, kind })
  }

  const changed = () => {
    catalog.reload({ created: dialog.kind === section && dialog.action === 'new', deleted: dialog.action === 'delete' })
    if (dialog.kind === 'compradora') {
      const removed = String(dialog.entry?.id) === filters.fk_compradora
      if (dialog.action === 'delete' && removed) setFilters({ ...filters, fk_compradora: '' })
      if (dialog.action === 'delete' && String(dialog.entry?.id) === draft.fk_compradora) setDraft({ ...draft, fk_compradora: '' })
      setOptionsRevision((value) => value + 1)
    }
    const message = { new: 'Registro creado.', edit: 'Cambios guardados.', delete: 'Registro eliminado.' }
    setNotice(message[dialog.action])
    close()
  }

  const buyerNames = new Map(buyers.rows.map((row) => [row.id, name(row)]))
  const nameOfBuyer = (row) => buyerNames.get(row.fk_compradora) ?? `Compradora ${row.fk_compradora}`
  const priceName = (row) => `${nameOfBuyer(row)} · ${displayDate(row.fecha)}`
  const priceColumns = [
    { key: 'compradora', label: 'Compradora', render: (row) => <strong className="font-semibold text-[#193b2b]">{nameOfBuyer(row)}</strong> },
    { key: 'fecha', label: 'Fecha', render: (row) => displayDate(row.fecha) },
    { key: 'seco', label: 'Carga de café seco', render: (row) => displayMoney(row.precio_carga_seco) },
    { key: 'mojado', label: 'Carga de café mojado', render: (row) => displayMoney(row.precio_carga_mojado) },
  ]
  const fields = [{ name: 'fk_compradora', label: 'Compradora', required: true, wide: true,
    options: buyers.rows.map((row) => ({ value: row.id, label: name(row) })) }, ...priceInputs]
  const button = (
    <Button type="button" onClick={() => open('new')} disabled={prices && !buyers.rows.length}>
      <Plus aria-hidden="true" size={18} />{prices ? 'Registrar precio' : 'Nueva compradora'}
    </Button>
  )

  return (
    <>
      <PageHead title="Compradoras y precios" description="Administra compradoras y consulta sus tarifas por carga de café." action={button} />
      <CatalogTabs tabs={tabs} active={section} onChange={(next) => { setSection(next); setNotice('') }} />
      <InlineNotice tone="success">{notice}</InlineNotice>
      {prices && <InlineNotice>{buyers.error?.message}</InlineNotice>}
      <CatalogTable
        catalog={catalog}
        columns={prices ? priceColumns : buyerColumns}
        rowName={prices ? priceName : name}
        onEdit={prices ? undefined : (row) => open('edit', row)}
        onDelete={(row) => open('delete', row)}
        toolbar={prices && <PriceFilters
          {...{ buyers, filtering }}
          value={draft}
          onChange={setDraft}
          onFilter={() => setFilters({ ...draft })}
          onClear={() => { setDraft(emptyFilters); setFilters(emptyFilters) }}
        />}
        empty={prices ? {
          title: filtering ? 'No hay precios que coincidan con los filtros' : 'Todavía no hay precios',
          description: !buyers.loading && !buyers.rows.length && !buyers.error ? 'Registra una compradora para añadir sus tarifas.' : undefined,
          action: !buyers.loading && !buyers.rows.length && !buyers.error
            ? <Button type="button" onClick={() => open('new', null, 'compradora')}>Crear compradora</Button>
            : buyers.rows.length > 0 && !filtering ? button : undefined,
        } : { title: 'Todavía no hay compradoras', action: button }}
      />
      {dialog?.action === 'delete' && (
        <CatalogDelete title={`Eliminar ${dialog.kind}`} name={dialog.kind === 'precio' ? priceName(dialog.entry) : name(dialog.entry)} path={`${routes[dialog.kind]}/${dialog.entry.id}`} onClose={close} onDeleted={changed} />
      )}
      {dialog && dialog.action !== 'delete' && (
        <CatalogEditor
          title={`${dialog.action === 'new' ? 'Registrar' : 'Editar'} ${dialog.kind}`}
          fields={dialog.kind === 'precio' ? fields : buyerFields}
          initialValues={dialog.entry ?? (dialog.kind === 'precio' ? { fecha: todayInBogota(), fk_compradora: filters.fk_compradora } : {})}
          toBody={dialog.kind === 'precio' ? priceBody : buyerBody}
          path={`${routes[dialog.kind]}${dialog.entry ? `/${dialog.entry.id}` : ''}`}
          method={dialog.entry ? 'PUT' : 'POST'}
          onClose={close}
          onSaved={changed}
        />
      )}
    </>
  )
}
