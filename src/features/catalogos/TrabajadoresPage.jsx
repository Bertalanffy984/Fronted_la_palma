import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, PageHead } from '../../components/ui.jsx'
import CatalogTable, { InlineNotice } from './CatalogTable.jsx'
import { CatalogDelete, CatalogEditor, CatalogField, CatalogSelect } from './CatalogDialogs.jsx'
import { useCatalog, useCatalogOptions } from './useCatalog.js'

const initialFilters = { documento: '', municipio_id: '', vereda_id: '' }
const textFields = [
  { name: 'documento', label: 'Documento', maxLength: 25, required: true, wide: true },
  { name: 'nombre_1', label: 'Primer nombre', maxLength: 200, required: true },
  { name: 'nombre_2', label: 'Segundo nombre', maxLength: 200 },
  { name: 'apellido_1', label: 'Primer apellido', maxLength: 200, required: true },
  { name: 'apellido_2', label: 'Segundo apellido', maxLength: 200 },
  { name: 'telefono', label: 'Teléfono', type: 'tel', maxLength: 25 },
]

function fullName(row) {
  return [row.nombre_1, row.nombre_2, row.apellido_1, row.apellido_2].filter(Boolean).join(' ')
}

const columns = [
  { key: 'nombre', label: 'Trabajador', render: (row) => <strong className="font-semibold text-[#193b2b]">{fullName(row)}</strong> },
  { key: 'documento', label: 'Documento', render: (row) => row.documento },
  { key: 'ubicacion', label: 'Ubicación', render: (row) => <span>{row.vereda}<small className="block text-xs text-[#596c5d]">{row.municipio}</small></span> },
  { key: 'telefono', label: 'Teléfono', render: (row) => row.telefono ?? '—' },
]

function workerBody(values) {
  const body = Object.fromEntries(textFields.map(({ name, required }) => {
    const value = String(values[name] ?? '').trim()
    return [name, required ? value : value || null]
  }))
  return { ...body, fk_vereda: Number(values.fk_vereda) }
}

function WorkerFilters({ municipalities, villages, value, onChange, onFilter, onClear, filtering }) {
  const visibleVillages = value.municipio_id
    ? villages.rows.filter((row) => String(row.fk_municipio) === value.municipio_id)
    : villages.rows

  return (
    <form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); onFilter() }}>
      <CatalogField label="Documento">
        <input className="lp-input w-full" placeholder="Buscar por documento" value={value.documento} maxLength={25} onChange={(event) => onChange({ ...value, documento: event.target.value })} />
      </CatalogField>
      <CatalogField label="Municipio">
        <CatalogSelect value={value.municipio_id} disabled={municipalities.loading || !!municipalities.error} onChange={(event) => onChange({ ...value, municipio_id: event.target.value, vereda_id: '' })}>
          <option value="">Todos los municipios</option>
          {municipalities.rows.map((row) => <option key={row.id} value={row.id}>{row.nombre}</option>)}
        </CatalogSelect>
      </CatalogField>
      <CatalogField label="Vereda">
        <CatalogSelect value={value.vereda_id} disabled={villages.loading || !!villages.error} onChange={(event) => onChange({ ...value, vereda_id: event.target.value })}>
          <option value="">Todas las veredas</option>
          {visibleVillages.map((row) => <option key={row.id} value={row.id}>{row.nombre} · {row.municipio}</option>)}
        </CatalogSelect>
      </CatalogField>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary"><Search aria-hidden="true" size={17} />Buscar</Button>
        {filtering && <Button type="button" variant="ghost" onClick={onClear}>Limpiar</Button>}
      </div>
    </form>
  )
}

export default function TrabajadoresPage() {
  const [draft, setDraft] = useState(initialFilters)
  const [filters, setFilters] = useState(initialFilters)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const municipalities = useCatalogOptions('/municipios')
  const villages = useCatalogOptions('/veredas')
  const catalog = useCatalog('/trabajadores', filters)
  const filtering = Object.values(filters).some(Boolean)
  const close = () => setDialog(null)

  const open = (action, entry = null) => {
    setNotice('')
    setDialog({ action, entry })
  }

  const changed = () => {
    catalog.reload({ created: dialog.action === 'new', deleted: dialog.action === 'delete' })
    const messages = { new: 'Trabajador registrado.', edit: 'Cambios guardados.', delete: 'Trabajador eliminado.' }
    setNotice(messages[dialog.action])
    close()
  }

  const button = (
    <Button type="button" disabled={!villages.rows.length} onClick={() => open('new')}>
      <Plus aria-hidden="true" size={18} />Nuevo trabajador
    </Button>
  )
  const fields = [
    ...textFields,
    { name: 'fk_vereda', label: 'Vereda', required: true, wide: true,
      options: villages.rows.map((row) => ({ value: row.id, label: `${row.nombre} · ${row.municipio}` })) },
  ]

  return (
    <>
      <PageHead title="Trabajadores" description="Registra y consulta a quienes participan en las jornadas de la finca." action={button} />
      <InlineNotice tone="success">{notice}</InlineNotice>
      <InlineNotice>{villages.error?.message ?? municipalities.error?.message}</InlineNotice>
      <CatalogTable
        catalog={catalog}
        columns={columns}
        rowName={fullName}
        onEdit={villages.rows.length > 0 ? (row) => open('edit', row) : undefined}
        onDelete={(row) => open('delete', row)}
        toolbar={<WorkerFilters
          {...{ municipalities, villages, filtering }}
          value={draft}
          onChange={setDraft}
          onFilter={() => setFilters({ ...draft, documento: draft.documento.trim() })}
          onClear={() => { setDraft(initialFilters); setFilters(initialFilters) }}
        />}
        empty={filtering ? { title: 'No hay trabajadores que coincidan con los filtros' } : {
          title: 'Todavía no hay trabajadores',
          description: !villages.loading && !villages.rows.length && !villages.error ? 'Registra una vereda antes de crear un trabajador.' : undefined,
          action: villages.rows.length ? button : !villages.loading && !villages.error
            ? <Link to="/ubicaciones" className="inline-flex min-h-10 items-center rounded-lg border border-[#c7daca] px-4 text-sm font-semibold text-[#1d6649] hover:bg-[#edf4ec]">Gestionar ubicaciones</Link>
            : undefined,
        }}
      />
      {dialog?.action === 'delete' && (
        <CatalogDelete title="Eliminar trabajador" name={fullName(dialog.entry)} path={`/trabajadores/${dialog.entry.id}`} onClose={close} onDeleted={changed} />
      )}
      {dialog && dialog.action !== 'delete' && (
        <CatalogEditor
          title={dialog.entry ? 'Editar trabajador' : 'Registrar trabajador'}
          fields={fields}
          initialValues={dialog.entry ?? { fk_vereda: filters.vereda_id }}
          toBody={workerBody}
          path={dialog.entry ? `/trabajadores/${dialog.entry.id}` : '/trabajadores'}
          method={dialog.entry ? 'PATCH' : 'POST'}
          onClose={close}
          onSaved={changed}
        />
      )}
    </>
  )
}
