import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, CalendarDays, ClipboardList, House, LogOut, MapPin, Menu, ShoppingBag, Sprout, Store, UsersRound, X } from 'lucide-react'
import { useAuth } from '../auth/context.js'
import Brand from './Brand.jsx'

const operador = [
  { label: 'Operación', links: [
    ['/', 'Resumen', House], ['/jornadas', 'Jornadas', CalendarDays], ['/trabajadores', 'Trabajadores', UsersRound],
    ['/ubicaciones', 'Municipios y veredas', MapPin],
  ] },
  { label: 'Comercial', links: [
    ['/compradoras', 'Compradoras y precios', Store], ['/ventas', 'Ventas', ShoppingBag], ['/reportes', 'Reportes', BarChart3],
  ] },
]

const administrador = [{ label: 'Administración', links: [
  ['/', 'Resumen', House], ['/usuarios', 'Usuarios', UsersRound], ['/auditoria', 'Auditoría', ClipboardList],
] }]

function tituloRuta(grupos, pagina) {
  for (const grupo of grupos) {
    const item = grupo.links.find(([path]) => path === pagina)
    if (item) return item[1]
  }
  return 'Resumen'
}

export default function AppShell() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [menu, setMenu] = useState(false)
  const admin = user.rol === 'administrador'
  const grupos = admin ? administrador : operador
  const rol = admin ? 'Administrador' : 'Encargado'
  const iniciales = user.usuario.split(/[_.-]+/).slice(0, 2).map((parte) => parte.charAt(0)).join('').toUpperCase()

  useEffect(() => {
    if (!menu) return undefined
    const cerrar = (evento) => { if (evento.key === 'Escape') setMenu(false) }
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [menu])

  return <div className="lp-layout">
    <a className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:bg-white focus:p-3" href="#contenido">Saltar al contenido</a>
    {menu && <button className="lp-overlay lg:hidden" aria-label="Cerrar navegación" onClick={() => setMenu(false)} />}
    <aside id="navegacion" className={'lp-sidebar ' + (menu ? 'lp-sidebar-open' : '')}>
      <div className="flex items-center justify-between px-5 pb-8 pt-7">
        <NavLink to="/" onClick={() => setMenu(false)} aria-label="La Palma, inicio"><Brand light /></NavLink>
        <button type="button" className="lp-menu-icon lg:hidden" aria-label="Cerrar menú" onClick={() => setMenu(false)}><X size={22} /></button>
      </div>
      <nav aria-label="Navegación principal" className="space-y-6 px-3.5">
        {grupos.map((grupo) => <section key={grupo.label} aria-label={grupo.label}>
          <p className="px-3.5 pb-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#a5c0ad]">{grupo.label}</p>
          <div className="flex flex-col gap-1">
            {grupo.links.map(([ruta, texto, Icon]) => <NavLink key={ruta} to={ruta} end={ruta === '/'}
              className={({ isActive }) => 'lp-nav-link' + (isActive ? ' lp-nav-active' : '')} onClick={() => setMenu(false)}>
              <Icon aria-hidden="true" size={19} strokeWidth={1.85} /><span>{texto}</span>
            </NavLink>)}
          </div>
        </section>)}
      </nav>
      <div className="mt-auto px-4 pb-5 pt-8">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/12 px-3 py-3">
          <span className="lp-avatar grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold">{iniciales}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user.usuario}</p>
            <p className="text-xs text-[#b9cfbc]">{rol}</p>
          </div>
        </div>
        <button className="lp-nav-link w-full text-left" type="button" onClick={signOut}>
          <LogOut size={18} aria-hidden="true" /><span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
    <div className="lp-workspace">
      <header className="lp-topbar">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="lp-mobile-menu lg:hidden" aria-label="Abrir navegación"
            aria-expanded={menu} aria-controls="navegacion" onClick={() => setMenu(true)}>
            <Menu size={21} aria-hidden="true" />
          </button>
          <div className="hidden items-center gap-2 text-sm font-semibold text-[#587163] sm:flex"><Sprout size={16} aria-hidden="true" /> Finca La Palma <span className="px-1 text-[#a0b2a5]">/</span></div>
          <p className="truncate text-sm font-bold text-[#183d2d]">{tituloRuta(grupos, location.pathname)}</p>
        </div>
        <span className="hidden items-center gap-2 rounded-full border border-[#d5e4d7] bg-[#f1f7ef] px-3 py-1.5 text-xs font-bold text-[#315f48] sm:inline-flex">
          {rol}
        </span>
      </header>
      <main id="contenido" className="lp-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  </div>
}
