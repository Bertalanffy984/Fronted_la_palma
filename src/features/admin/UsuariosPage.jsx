import { useState } from 'react'
import { Pencil, Plus, Users } from 'lucide-react'
import { Alert, Button, EmptyState, PageHead, Spinner } from '../../components/ui.jsx'
import { nombreCompleto, useConsultaAdmin } from './adminData.js'
import UsuarioForm from './UsuarioForm.jsx'

const TAMANO = 15

export default function UsuariosPage() {
  const [pagina, setPagina] = useState(1)
  const [version, setVersion] = useState(0)
  const [dialogo, setDialogo] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const offset = (pagina - 1) * TAMANO
  const { datos, error, cargando } = useConsultaAdmin('/admin/usuarios?limite=' + (TAMANO + 1) + '&offset=' + offset, version)
  const usuarios = (datos ?? []).slice(0, TAMANO)

  function guardado(texto) {
    setMensaje(texto)
    if (!dialogo?.cuenta) setPagina(1)
    setDialogo(null)
    setVersion((n) => n + 1)
  }

  return (
    <section className="space-y-5">
      <PageHead
        title="Usuarios"
        description="Gestiona las cuentas y el acceso de los encargados."
        action={<Button onClick={() => { setMensaje(''); setDialogo({ cuenta: null }) }}><Plus size={18} /> Nueva cuenta</Button>}
      />
      {mensaje && <Alert tone="success">{mensaje}</Alert>}
      {error ? (
        <Alert tone="error">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{error}</span>
            <Button variant="secondary" onClick={() => setVersion((n) => n + 1)}>Reintentar</Button>
          </div>
        </Alert>
      ) : (
        <div className="lp-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#e5ede3] px-5 py-4">
            <div className="grid size-10 place-items-center rounded-xl bg-[#eef5eb] text-[#1d6649]"><Users size={20} /></div>
            <h2 className="font-bold">Cuentas de encargados</h2>
          </div>
          {cargando ? <div className="grid min-h-48 place-items-center"><Spinner /></div> : usuarios.length === 0 ? (
            <EmptyState title="Sin cuentas para mostrar" description="Crea una cuenta para que un encargado pueda acceder." />
          ) : (
            <div className="overflow-x-auto">
              <table className="lp-table w-full text-left">
                <thead className="hidden text-xs uppercase tracking-wide text-slate-600 sm:table-header-group">
                  <tr><th scope="col">Encargado</th><th scope="col">Usuario</th><th scope="col">Estado</th><th scope="col"><span className="sr-only">Acciones</span></th></tr>
                </thead>
                <tbody className="block divide-y divide-[#edf2eb] sm:table-row-group">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="grid grid-cols-2 gap-x-2 gap-y-1 p-4 sm:table-row sm:p-0">
                      <td className="min-w-0">
                        <span className="block break-words font-semibold text-[#173e31]">{nombreCompleto(usuario)}</span>
                        {usuario.telefono && <span className="mt-1 block text-sm text-slate-600">{usuario.telefono}</span>}
                      </td>
                      <td className="min-w-0 break-words text-sm text-slate-700">
                        <span className="block text-xs text-slate-500 sm:hidden">Usuario</span>{usuario.usuario}
                      </td>
                      <td>
                        <span className={'inline-flex rounded-full px-2.5 py-1 text-xs font-bold ' + (usuario.activo ? 'bg-[#e5f3e8] text-[#1d6649]' : 'bg-slate-100 text-slate-600')}>
                          {usuario.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="text-right">
                        <Button type="button" variant="secondary" aria-label={'Administrar cuenta ' + usuario.usuario} onClick={() => { setMensaje(''); setDialogo({ cuenta: usuario }) }}>
                          <Pencil size={15} /> Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(pagina > 1 || datos?.length > TAMANO) && (
            <nav aria-label="Páginas de usuarios" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ede3] px-5 py-4">
              <span className="text-sm text-slate-600">Página {pagina}</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={cargando || pagina === 1} onClick={() => setPagina((n) => n - 1)}>Anterior</Button>
                <Button variant="secondary" disabled={cargando || !(datos?.length > TAMANO)} onClick={() => setPagina((n) => n + 1)}>Siguiente</Button>
              </div>
            </nav>
          )}
        </div>
      )}
      {dialogo && <UsuarioForm usuario={dialogo.cuenta} alCerrar={() => setDialogo(null)} alGuardar={guardado} />}
    </section>
  )
}
