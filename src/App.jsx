import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import LoginPage from './auth/LoginPage.jsx'
import { useAuth } from './auth/context.js'
import AppShell from './components/AppShell.jsx'
import { Spinner } from './components/ui.jsx'
import Dashboard from './features/resumen/Dashboard.jsx'
import JornadasPage from './features/jornadas/JornadasPage.jsx'
import TrabajadoresPage from './features/catalogos/TrabajadoresPage.jsx'
import UbicacionesPage from './features/catalogos/UbicacionesPage.jsx'
import CompradorasPage from './features/catalogos/CompradorasPage.jsx'
import VentasPage from './features/ventas/VentasPage.jsx'
import ReportesPage from './features/ventas/ReportesPage.jsx'
import UsuariosPage from './features/admin/UsuariosPage.jsx'
import AuditoriaPage from './features/admin/AuditoriaPage.jsx'

function SesionRequerida() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <main className="grid min-h-dvh place-items-center">
    <Spinner label="Verificando tu sesión…" />
  </main>
  if (status === 'authenticated') return <Outlet />
  return <Navigate to="/ingresar" replace state={{ volver: location.pathname + location.search }} />
}

function RolRequerido({ rol }) {
  const { user } = useAuth()
  return user?.rol === rol ? <Outlet /> : <Navigate to="/" replace />
}

export default function App() {
  return <Routes>
    <Route path="/ingresar" element={<LoginPage />} />
    <Route element={<SesionRequerida />}>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route element={<RolRequerido rol="encargado" />}>
          <Route path="jornadas" element={<JornadasPage />} />
          <Route path="trabajadores" element={<TrabajadoresPage />} />
          <Route path="ubicaciones" element={<UbicacionesPage />} />
          <Route path="compradoras" element={<CompradorasPage />} />
          <Route path="ventas" element={<VentasPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
        <Route element={<RolRequerido rol="administrador" />}>
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="auditoria" element={<AuditoriaPage />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
