import { useState } from 'react'
import { UserCheck, UserPlus } from 'lucide-react'
import { api } from '../../api/client.js'
import { Alert, Button, Field, Select, Spinner } from '../../components/ui.jsx'
import AdminDialog from './AdminDialog.jsx'
import { nombreCompleto, useConsultaAdmin } from './adminData.js'

const perfilVacio = { nombre_1: '', nombre_2: '', apellido_1: '', apellido_2: '', telefono: '' }

export default function UsuarioForm({ usuario, alCerrar, alGuardar }) {
  const editando = Boolean(usuario)
  const [modo, setModo] = useState('nuevo')
  const [cuenta, setCuenta] = useState(usuario?.usuario ?? '')
  const [contrasena, setContrasena] = useState('')
  const [activo, setActivo] = useState(usuario?.activo ?? true)
  const [perfil, setPerfil] = useState(perfilVacio)
  const [encargado, setEncargado] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const [reintento, setReintento] = useState(0)
  const disponibles = useConsultaAdmin(!editando && modo === 'existente' ? '/admin/usuarios/encargados-disponibles' : null, reintento, true)

  function asignarPerfil(event) {
    setPerfil((anterior) => ({ ...anterior, [event.target.name]: event.target.value }))
  }

  async function guardar(event) {
    event.preventDefault()
    setError('')
    setOcupado(true)
    const nombre = cuenta.trim()
    try {
      if (editando) {
        const cambios = {}
        if (nombre.toLowerCase() !== usuario.usuario) cambios.usuario = nombre
        if (contrasena) cambios.contrasena = contrasena
        if (activo !== usuario.activo) cambios.activo = activo
        if (Object.keys(cambios).length === 0) {
          setError('Cambia algún dato antes de guardar.')
          return
        }
        await api('/admin/usuarios/' + usuario.id, { method: 'PATCH', body: cambios })
      } else {
        const datos = { usuario: nombre, contrasena }
        if (modo === 'existente') datos.encargado_id = Number(encargado)
        else datos.encargado = Object.fromEntries(Object.entries(perfil).map(
          ([clave, valor]) => [clave, valor.trim() || null],
        ))
        await api('/admin/usuarios', { method: 'POST', body: datos })
      }
      alGuardar(editando ? 'Cambios guardados.' : 'Cuenta creada. El encargado ya puede iniciar sesión.')
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <AdminDialog
      title={editando ? 'Administrar cuenta' : 'Nueva cuenta'}
      description={editando ? nombreCompleto(usuario) : 'Crea las credenciales de acceso de un encargado.'}
      busy={ocupado}
      onClose={alCerrar}
    >
      <form className="grid gap-5" onSubmit={guardar}>
        {!editando && (
          <fieldset className="grid gap-3">
            <legend className="lp-label mb-2">Perfil del encargado</legend>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f1f6ef] p-1.5">
              {[
                ['nuevo', 'Nuevo perfil', UserPlus],
                ['existente', 'Perfil existente', UserCheck],
              ].map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={modo === value}
                  disabled={ocupado}
                  onClick={() => { setModo(value); setError('') }}
                  className={'flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#1d6649] ' + (modo === value ? 'bg-white text-[#1d6649] shadow-sm' : 'text-slate-600 hover:text-[#1d6649]')}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            {modo === 'existente' ? (
              disponibles.error ? (
                <Alert tone="error">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>{disponibles.error}</span>
                    <Button type="button" variant="secondary" onClick={() => setReintento((n) => n + 1)}>Reintentar</Button>
                  </div>
                </Alert>
              ) : disponibles.cargando ? <Spinner /> : (
                <Field label="Encargado disponible">
                  <Select required value={encargado} onChange={(event) => setEncargado(event.target.value)} disabled={ocupado}>
                    <option value="">{disponibles.datos?.length ? 'Selecciona un encargado' : 'Todos los encargados ya tienen cuenta'}</option>
                    {disponibles.datos?.map((persona) => (
                      <option key={persona.id} value={persona.id}>{nombreCompleto(persona)} · #{persona.id}</option>
                    ))}
                  </Select>
                </Field>
              )
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['nombre_1', 'Primer nombre', true],
                  ['apellido_1', 'Primer apellido', true],
                  ['nombre_2', 'Segundo nombre', false],
                  ['apellido_2', 'Segundo apellido', false],
                  ['telefono', 'Teléfono', false],
                ].map(([name, label, requerido]) => (
                  <Field key={name} label={label}>
                    <input
                      className="lp-input"
                      type={name === 'telefono' ? 'tel' : 'text'}
                      name={name}
                      value={perfil[name]}
                      onChange={asignarPerfil}
                      maxLength={name === 'telefono' ? 25 : 80}
                      required={requerido}
                      disabled={ocupado}
                    />
                  </Field>
                ))}
              </div>
            )}
          </fieldset>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Usuario">
            <input className="lp-input" name="usuario" autoComplete="username" spellCheck={false} value={cuenta} onChange={(event) => setCuenta(event.target.value)} maxLength={80} required disabled={ocupado} />
          </Field>
          <Field label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña de acceso'}>
            <input className="lp-input" type="password" name="contrasena" autoComplete="new-password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} maxLength={1024} required={!editando} disabled={ocupado} />
          </Field>
        </div>
        {editando && (
          <label className="flex items-start gap-3 rounded-xl bg-[#f0f6ee] p-4">
            <input type="checkbox" checked={activo} onChange={(event) => setActivo(event.target.checked)} disabled={ocupado} className="mt-0.5 size-5 shrink-0 accent-[#1d6649]" />
            <span>
              <span className="block font-semibold">Cuenta activa</span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">Desactivar la cuenta o cambiar su contraseña cierra las sesiones anteriores.</span>
            </span>
          </label>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-[#e7eee5] pt-4">
          <Button type="button" variant="secondary" disabled={ocupado} onClick={alCerrar}>Cancelar</Button>
          <Button type="submit" disabled={ocupado || !cuenta.trim() || (!editando && modo === 'existente' && !encargado)}>
            {ocupado ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear cuenta'}
          </Button>
        </div>
      </form>
    </AdminDialog>
  )
}
