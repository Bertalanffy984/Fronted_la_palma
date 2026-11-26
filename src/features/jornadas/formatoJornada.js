const zona = 'America/Bogota'
const fecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: zona })
const fechaHora = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: zona })
const dinero = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 })
const kilos = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 })
const partes = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: zona,
})

function fechaEnZona(valor) {
  if (!valor) return null
  const texto = valor.length === 10 ? `${valor}T00:00:00` : valor
  const objeto = new Date(/(?:Z|[+-]\d\d:?\d\d)$/i.test(texto) ? texto : `${texto}-05:00`)
  return Number.isNaN(objeto.getTime()) ? null : objeto
}

export function mostrarFecha(valor, conHora = false) {
  const objeto = fechaEnZona(valor)
  return objeto ? (conHora ? fechaHora : fecha).format(objeto) : '—'
}

export function ahoraBogota() {
  const { year, month, day, hour, minute, second } = Object.fromEntries(
    partes.formatToParts(new Date()).map(({ type, value }) => [type, value]),
  )
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

export const mostrarDinero = (valor) => dinero.format(Number(valor))
export const mostrarKilos = (valor) => `${kilos.format(Number(valor))} kg`

export const formatoAsistencia = {
  presente: { label: 'Presente', tone: 'success' },
  'inscrito sin pesajes': { label: 'Inscrito sin pesajes', tone: 'warning' },
  ausente: { label: 'Ausente', tone: 'neutral' },
}

export function nombreTrabajador(persona) {
  return [persona.nombre_1, persona.nombre_2, persona.apellido_1, persona.apellido_2].filter(Boolean).join(' ')
}
