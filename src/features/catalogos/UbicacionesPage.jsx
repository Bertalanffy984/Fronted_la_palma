import { useState } from 'react'
import { Map, MapPin, Plus } from 'lucide-react'
import { Button, PageHead } from '../../components/ui.jsx'
import CatalogTable, { CatalogTabs, InlineNotice } from './CatalogTable.jsx'
import { CatalogDelete, CatalogEditor, CatalogField, CatalogSelect } from './CatalogDialogs.jsx'
import { useCatalog, useCatalogOptions } from './useCatalog.js'

const tabs = [
  { id: 'municipio', label: 'Municipios', Icon: Map },
  { id: 'vereda', label: 'Veredas', Icon: MapPin },
]
const segments = { municipio: '/municipios', vereda: '/veredas' }
const nameField = { name: 'nombre', label: 'Nombre', required: true, maxLength: 200, wide: true }

const nameColumn = {
  key: 'nombre', label: 'Nombre', render: (row) => <strong className="font-semibold text-[#193b2b]">{row.nombre}</strong>,
}
const municipioColumn = { key: 'municipio', label: 'Municipio', render: (row) => row.municipio }

export default function UbicacionesPage() {
  const [section, setSection] = useState('municipio')
  const [municipio, setMunicipio] = useState('')
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [optionsRevision, setOptionsRevision] = useState(0)
  const options = useCatalogOptions('/municipios', optionsRevision)
  const veredas = section === 'vereda'
  const catalog = useCatalog(segments[section], veredas ? { municipio_id: municipio } : {})
  const close = () => setDialog(null)

  const open = (action, entry = null, kind = section) => {
    setNotice('')
    setDialog({ action, entry, kind })
  }

  const updated = () => {
    const { kind, action, entry } = dialog
    catalog.reload({ created: action === 'new' && kind === section, deleted: action === 'delete' })
    if (kind === 'municipio') {
      if (action === 'delete' && String(entry.id) === municipio) setMunicipio('')
      setOptionsRevision((value) => value + 1)
    }
    const message = { new: 'Registro creado.', edit: 'Cambios guardados.', delete: 'Registro eliminado.' }
    setNotice(message[action])
    close()
  }

  const button = (
    <Button type="button" onClick={() => open('new')} disabled={veredas && !options.rows.length}>
      <Plus aria-hidden="true" size={18} />{veredas ? 'Nueva vereda' : 'Nuevo municipio'}
    </Button>
  )
  const fields = [nameField]
  if (dialog?.kind === 'vereda') {
    fields.push({ name: 'fk_municipio', label: 'Municipio', required: true, wide: true,
      options: options.rows.map((row) => ({ value: row.id, label: row.nombre })) })
  }

  return (
    <>
      <PageHead title="Ubicaciones" description="Gestiona los municipios y las veredas de la finca." action={button} />
      <CatalogTabs tabs={tabs} active={section} onChange={(next) => { setSection(next); setNotice('') }} />
      <InlineNotice tone="success">{notice}</InlineNotice>
      {veredas && options.error && <InlineNotice>{options.error.message}</InlineNotice>}
      <CatalogTable
        catalog={catalog}
        columns={veredas ? [nameColumn, municipioColumn] : [nameColumn]}
        rowName={(row) => row.nombre}
        onEdit={(row) => open('edit', row)}
        onDelete={(row) => open('delete', row)}
        toolbar={veredas && (
          <div className="max-w-xs">
            <CatalogField label="Filtrar por municipio">
              <CatalogSelect value={municipio} disabled={options.loading || !!options.error} onChange={(event) => setMunicipio(event.target.value)}>
                <option value="">Todos los municipios</option>
                {options.rows.map((row) => <option key={row.id} value={row.id}>{row.nombre}</option>)}
              </CatalogSelect>
            </CatalogField>
          </div>
        )}
        empty={veredas ? {
          title: municipio ? 'No hay veredas en este municipio' : 'Todavía no hay veredas',
          description: !options.loading && !options.rows.length && !options.error ? 'Registra un municipio para poder asociarle una vereda.' : undefined,
          action: !options.loading && !options.rows.length && !options.error
            ? <Button type="button" onClick={() => open('new', null, 'municipio')}>Crear municipio</Button>
            : options.rows.length > 0 ? button : undefined,
        } : { title: 'Todavía no hay municipios', action: button }}
      />
      {dialog?.action === 'delete' && (
        <CatalogDelete title={`Eliminar ${dialog.kind}`} name={dialog.entry.nombre} path={`${segments[dialog.kind]}/${dialog.entry.id}`} onClose={close} onDeleted={updated} />
      )}
      {dialog && dialog.action !== 'delete' && (
        <CatalogEditor
          title={`${dialog.action === 'new' ? 'Registrar' : 'Editar'} ${dialog.kind}`}
          fields={fields}
          initialValues={{ nombre: dialog.entry?.nombre ?? '', fk_municipio: dialog.entry?.fk_municipio ?? municipio }}
          toBody={(values) => dialog.kind === 'vereda' ? { nombre: values.nombre.trim(), fk_municipio: Number(values.fk_municipio) } : { nombre: values.nombre.trim() }}
          path={`${segments[dialog.kind]}${dialog.entry ? `/${dialog.entry.id}` : ''}`}
          method={dialog.entry ? 'PATCH' : 'POST'}
          onClose={close}
          onSaved={updated}
        />
      )}
    </>
  )
}
