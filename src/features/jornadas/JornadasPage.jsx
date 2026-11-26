import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button, PageHead } from '../../components/ui.jsx'
import DetalleJornada from './DetalleJornada.jsx'
import FormularioJornada from './FormularioJornada.jsx'
import ListadoJornadas from './ListadoJornadas.jsx'
import { MensajeJornada } from './JornadaUI.jsx'

export default function JornadasPage() {
  const [params, cambiarParams] = useSearchParams()
  const [crear, setCrear] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const id = Number(params.get('id'))
  const verDetalle = Number.isInteger(id) && id > 0 && id <= 2_147_483_647

  function cerrarAlta() {
    setCrear(false)
    if (params.has('crear')) cambiarParams({}, { replace: true })
  }

  function altaExitosa(resultado) {
    setCrear(false)
    setMensaje(resultado)
    cambiarParams({ id: String(resultado.jornada.id) })
  }

  if (verDetalle) {
    return <>
      {mensaje && <div className="mb-4"><MensajeJornada tone={mensaje.tone}>{mensaje.mensaje}</MensajeJornada></div>}
      <DetalleJornada key={id} id={id} onVolver={() => { setMensaje(null); cambiarParams({}) }} />
    </>
  }

  const accion = <Button onClick={() => setCrear(true)}><Plus size={18} aria-hidden="true" />Nueva jornada</Button>
  return <>
    <PageHead title="Jornadas" description="Consulta la recolección, los pagos y el estado de cada jornada." action={accion} />
    {params.has('id') && <div className="mb-4"><MensajeJornada>Selecciona un identificador de jornada válido.</MensajeJornada></div>}
    <ListadoJornadas onCrear={() => setCrear(true)} onAbrir={(jornada) => {
      setMensaje(null)
      cambiarParams({ id: String(jornada) })
    }} />
    {(crear || params.get('crear') === '1') && <FormularioJornada accion={{ tipo: 'crear' }} onClose={cerrarAlta} onSuccess={altaExitosa} />}
  </>
}
