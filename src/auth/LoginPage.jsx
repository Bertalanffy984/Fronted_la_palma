import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context.js'
import Brand from '../components/Brand.jsx'
import { Alert, Button, Spinner } from '../components/ui.jsx'

export default function LoginPage() {
  const { signIn, status, error: sesionError, restore, signOut } = useAuth()
  const location = useLocation()
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [visible, setVisible] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function iniciar(evento) {
    evento.preventDefault()
    if (enviando) return
    setEnviando(true)
    setError('')
    try {
      await signIn(usuario.trim(), contrasena)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  if (status === 'authenticated') return <Navigate to={location.state?.volver ?? '/'} replace />

  return <div className="lp-login">
    <div className="lp-login-imagen">
      <img src="/images/cafetales.jpg" alt="Cafetales en las laderas de los Andes colombianos" fetchPriority="high" />
      <div className="lp-login-velo" />
      <div className="lp-login-marca"><Brand light /></div>
      <div className="lp-login-caption">
        <div className="mb-4 h-[2px] w-12 rounded bg-[#cee4a3]" aria-hidden="true" />
        <p>Finca La Palma</p>
      </div>
    </div>
    <main className="lp-login-panel">
      <div className="lp-login-form">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-[#dce8db] bg-[#eef5eb] text-[#1d6649]">
          <LockKeyhole size={22} aria-hidden="true" strokeWidth={1.8} />
        </span>
        <h1 className="lp-heading text-[clamp(2.05rem,4vw,3rem)]">Inicia sesión</h1>
        <p className="mb-7 mt-2 max-w-md leading-relaxed text-[#52685c]">Ingresa con la cuenta que te entregó la administración de la finca.</p>
        {status === 'loading' ? <Spinner label="Verificando tu sesión…" /> : status === 'error' ? <div className="space-y-4">
          <Alert>{sesionError}</Alert>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void restore()}>Reintentar</Button>
            <Button variant="secondary" onClick={signOut}>Volver al inicio de sesión</Button>
          </div>
        </div> : <form className="space-y-5" onSubmit={iniciar} aria-busy={enviando}>
          {(error || sesionError) && <Alert>{error || sesionError}</Alert>}
          <label className="block" htmlFor="usuario">
            <span className="lp-label">Usuario</span>
            <span className="relative block">
              <UserRound size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-4 text-[#6a8777]" />
              <input className="lp-input lp-login-input" id="usuario" name="usuario" required autoComplete="username"
                value={usuario} onChange={(evento) => setUsuario(evento.target.value)} />
            </span>
          </label>
          <label className="block" htmlFor="contrasena">
            <span className="lp-label">Contraseña</span>
            <span className="relative block">
              <LockKeyhole size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-4 text-[#6a8777]" />
              <input className="lp-input lp-login-input pr-12" id="contrasena" name="contrasena" required
                type={visible ? 'text' : 'password'} autoComplete="current-password" value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)} />
              <button type="button" className="lp-eye-button" onClick={() => setVisible((actual) => !actual)}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={visible}>
                {visible ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </span>
          </label>
          <Button type="submit" className="min-h-12 w-full" disabled={enviando || !usuario.trim() || !contrasena}>
            {enviando ? 'Ingresando…' : 'Entrar'}
          </Button>
        </form>}
      </div>
    </main>
  </div>
}
