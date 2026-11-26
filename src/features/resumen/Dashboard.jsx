import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, ClipboardList, CloudCheck, CloudCog, Coffee, FileSearch, Plus,
  Scale, ShieldCheck, ShoppingBag, UserCheck, UserRoundMinus, UsersRound,
} from 'lucide-react'
import { useAuth } from '../../auth/context.js'
import { Alert, Badge, Button, EmptyState, PageHead, Spinner } from '../../components/ui.jsx'
import useRecurso from '../jornadas/useRecursoJornada.js'
import { mostrarDinero, mostrarFecha, mostrarKilos } from '../jornadas/formatoJornada.js'

const hoyBogota = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'full',
  timeZone: 'America/Bogota',
})

function Stat({ icon: Icon, label, value, nota, color = 'green' }) {
  return <article className="lp-card min-w-0 p-4 sm:p-5">
    <div className={'mb-4 grid h-10 w-10 place-items-center rounded-xl ' +
      (color === 'sand' ? 'bg-[#f4eddf] text-[#876036]' : 'bg-[#eaf3e7] text-[#2e7954]')}>
      <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
    </div>
    <p className="mb-1 text-sm font-semibold text-[#557362]">{label}</p>
    <p className="lp-stat-value">{value}</p>
    {nota && <p className="mt-1.5 text-xs text-[#627c6d]">{nota}</p>}
  </article>
}

function AvisoRecurso({ resource }) {
  return resource.error && <Alert>
    <div className="flex flex-wrap items-center gap-3">
      <span>{resource.error.message}</span>
      <Button variant="secondary" onClick={resource.actualizar}>Reintentar</Button>
    </div>
  </Alert>
}

function Hero({ admin = false }) {
  return <section className={'lp-hero ' + (admin ? 'lp-hero-admin' : '')}>
    <div className="relative max-w-xl">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#d6e9bd]">
        {admin ? <ShieldCheck size={17} aria-hidden="true" /> : <Coffee size={17} aria-hidden="true" />}
        {admin ? 'Administración' : 'Operación cafetera'}
      </p>
      <h2 className="lp-hero-title">{admin ? 'Accesos y auditoría' : 'Control de la cosecha'}</h2>
      <p className="mb-5 mt-3 max-w-md text-sm leading-relaxed text-[#edf5e7] sm:text-base">
        {admin
          ? 'Administra las cuentas de los encargados y consulta el historial de cambios de pesaje.'
          : 'Gestiona la recolección, registra pesajes y consulta los pagos de cada jornada.'}
      </p>
      <Link className="lp-button lp-button-light" to={admin ? '/usuarios' : '/jornadas'}>
        {admin ? 'Gestionar usuarios' : 'Ver jornadas'}
      </Link>
    </div>
  </section>
}

function JornadasRecientes({ jornadas }) {
  return <section className="lp-card min-w-0 overflow-hidden">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7eee4] px-5 py-4">
      <h2 className="text-[1.05rem] font-bold text-[#1d4934]">Jornadas recientes</h2>
      <Link className="text-sm font-bold text-[#1d6649] underline-offset-4 hover:underline" to="/jornadas">Ver todas</Link>
    </header>
    {jornadas.datos?.length ? <ul className="divide-y divide-[#edf2eb]">
      {jornadas.datos.slice(0, 5).map((jornada) => <li key={jornada.id}>
        <Link className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 hover:bg-[#f7faf6]"
          to={'/jornadas?id=' + jornada.id}>
          <span className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf5eb] text-[#2c7451]"><CalendarDays size={17} aria-hidden="true" /></span>
            <span>
              <span className="block text-sm font-bold text-[#244c38]">Jornada {jornada.id}</span>
              <span className="block text-xs text-[#567566]">{mostrarFecha(jornada.fecha_inicio)}</span>
            </span>
          </span>
          <Badge tone={jornada.estado === 'abierta' ? 'success' : 'neutral'}>{jornada.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</Badge>
        </Link>
      </li>)}
    </ul> : jornadas.cargando ? <div className="p-6"><Spinner /></div> : jornadas.error
      ? <div className="p-5"><AvisoRecurso resource={jornadas} /></div>
      : <EmptyState title="Aún no hay jornadas" description="Crea una jornada para empezar a registrar la recolección." />}
  </section>
}

function OperacionDashboard({ fecha }) {
  const jornadas = useRecurso('/jornadas?limite=8')
  const destacada = jornadas.datos?.find((item) => item.estado === 'abierta') ?? jornadas.datos?.[0]
  const detalle = useRecurso(destacada ? '/jornadas/' + destacada.id + '/resumen' : null)
  const sincronizacion = useRecurso(destacada ? '/jornadas/' + destacada.id + '/sincronizacion' : null, { intervalo: 5000 })
  const totales = detalle.datos?.totales
  const estado = sincronizacion.datos
  const nota = destacada && 'Jornada ' + destacada.id
  const textoSync = estado ? (estado.sincronizado ? 'Al día' : estado.ultimo_error ? 'En reintento' : 'Pendiente') : '—'

  return <>
    <PageHead title="Resumen de la finca" description={fecha}
      action={<Link className="lp-button lp-button-primary" to="/jornadas?crear=1"><Plus size={18} aria-hidden="true" />Nueva jornada</Link>} />
    <div className="space-y-5">
      <Hero />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={UsersRound} label="Participantes inscritos" value={totales?.inscripciones ?? '—'} nota={nota} />
        <Stat icon={Scale} label="Kilos recolectados" value={totales ? mostrarKilos(totales.kg_activos) : '—'} nota={nota} />
        <Stat icon={ShoppingBag} label="Liquidado por pagar" value={totales ? mostrarDinero(totales.liquidado_pendiente_cop) : '—'} nota={nota} color="sand" />
        <Stat icon={estado?.sincronizado ? CloudCheck : CloudCog} label="Sincronización" value={textoSync} nota={nota} />
      </div>
      <AvisoRecurso resource={detalle} />
      <AvisoRecurso resource={sincronizacion} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <JornadasRecientes jornadas={jornadas} />
        <section className="lp-card relative isolate flex min-h-[240px] overflow-hidden p-5 sm:p-6">
          <img src="/images/cerezas.jpg" alt="Cerezas maduras de café en la planta" loading="lazy"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[55%_45%]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#173725] via-[#173725]/55 to-transparent" />
          <div className="mt-auto text-white">
            <h2 className="text-xl font-bold">Ventas de café</h2>
            <Link to="/ventas" className="lp-button lp-button-light mt-3">Consultar ventas</Link>
          </div>
        </section>
      </div>
    </div>
  </>
}

function AdminDashboard({ fecha }) {
  const cuentas = useRecurso('/admin/usuarios?limite=100')
  const auditoria = useRecurso('/auditoria/pesajes?por_pagina=5')
  const activas = cuentas.datos?.filter((cuenta) => cuenta.activo).length
  const resultados = auditoria.datos?.resultados

  return <>
    <PageHead title="Administración de la finca" description={fecha} />
    <div className="space-y-5">
      <Hero admin />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={UserCheck} label="Cuentas activas" value={activas ?? '—'} nota={cuentas.datos?.length === 100 ? 'En las 100 cuentas consultadas' : ''} />
        <Stat icon={UserRoundMinus} label="Cuentas desactivadas" value={cuentas.datos ? cuentas.datos.length - activas : '—'} color="sand" />
        <Stat icon={FileSearch} label="Cambios recientes de pesaje" value={resultados?.length ?? '—'} nota="Últimos 5 registros" />
      </div>
      <AvisoRecurso resource={cuentas} />
      <section className="lp-card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7eee4] px-5 py-4">
          <h2 className="font-bold text-[#1d4934]">Actividad de auditoría</h2>
          <Link to="/auditoria" className="text-sm font-bold text-[#1d6649] underline-offset-4 hover:underline">Abrir auditoría</Link>
        </header>
        {resultados?.length ? <ul className="divide-y divide-[#edf2eb]">
          {resultados.map((registro) => <li key={registro.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
            <span className="flex items-center gap-3 text-sm font-bold text-[#244c38]">
              <ClipboardList size={18} aria-hidden="true" className="text-[#1d6649]" />
              {{ INSERT: 'Pesaje registrado', UPDATE: 'Pesaje modificado', DELETE: 'Pesaje retirado' }[registro.operacion] ?? registro.operacion}
              {registro.id_jornada != null && ' · Jornada ' + registro.id_jornada}
            </span>
            <span className="text-xs text-[#567566]">{mostrarFecha(registro.fecha_cambio, true)}</span>
          </li>)}
        </ul> : auditoria.cargando ? <div className="p-6"><Spinner /></div> : auditoria.error
          ? <div className="p-5"><AvisoRecurso resource={auditoria} /></div>
          : <EmptyState title="Aún no hay cambios de pesaje para mostrar" />}
      </section>
    </div>
  </>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [fecha] = useState(() => hoyBogota.format(new Date()))
  return user.rol === 'administrador' ? <AdminDashboard fecha={fecha} /> : <OperacionDashboard fecha={fecha} />
}
