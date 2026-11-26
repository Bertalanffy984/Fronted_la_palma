import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'

export const FILTROS_VENTA = { fk_jornada: '', fk_compradora: '', tipo_cafe: '', desde: '', hasta: '' }
export const TAMANO_PAGINA = 15

const fechaVista = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'UTC' })
const fechaFinca = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Bogota',
})
const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2,
})
const cantidades = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 })

export function fechaCalendario(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor.slice(0, 10) + 'T00:00:00Z')
  return Number.isNaN(fecha.getTime()) ? '—' : fechaVista.format(fecha)
}

export function hoyEnLaFinca() {
  const valores = Object.fromEntries(fechaFinca.formatToParts(new Date()).map((p) => [p.type, p.value]))
  return [valores.year, valores.month, valores.day].join('-')
}

export function dinero(valor) {
  return valor === null || valor === undefined ? '—' : pesos.format(Number(valor))
}

export function cantidad(valor) {
  return valor === null || valor === undefined ? '—' : cantidades.format(Number(valor))
}

export function tipoDeCafe(tipo) {
  return tipo === 'seco' ? 'Seco' : tipo === 'mojado' ? 'Mojado' : tipo
}

export function urlListado(endpoint, filtros, pagina, admiteFechas) {
  const query = new URLSearchParams({ limite: TAMANO_PAGINA + 1, offset: (pagina - 1) * TAMANO_PAGINA })
  for (const [campo, valor] of Object.entries(filtros)) {
    if (valor && (admiteFechas || (campo !== 'desde' && campo !== 'hasta'))) query.set(campo, valor)
  }
  return endpoint + '?' + query
}

async function listarCatalogo(ruta, signal) {
  const filas = []
  const separador = ruta.includes('?') ? '&' : '?'
  for (let offset = 0; ; offset += 100) {
    const pagina = await api(ruta + separador + 'limite=100&offset=' + offset, { signal })
    filas.push(...pagina)
    if (pagina.length < 100) return filas
  }
}

function consultaApi(ruta, modo, signal) {
  if (modo === 'catalogos') {
    return Promise.all([listarCatalogo('/jornadas', signal), listarCatalogo('/compradoras', signal)])
      .then(([jornadas, compradoras]) => ({ jornadas, compradoras }))
  }
  return modo === 'todos' ? listarCatalogo(ruta, signal) : api(ruta, { signal })
}

export function useConsultaVentas(ruta, version = 0, modo = 'uno') {
  const clave = ruta ? [ruta, version, modo].join('|') : null
  const [respuesta, setRespuesta] = useState({ clave: null, datos: null, error: '' })

  useEffect(() => {
    if (!ruta) return
    const control = new AbortController()
    consultaApi(ruta, modo, control.signal)
      .then((datos) => {
        if (!control.signal.aborted) setRespuesta({ clave, datos, error: '' })
      })
      .catch((error) => {
        if (!control.signal.aborted) setRespuesta({ clave, datos: null, error: error.message })
      })
    return () => control.abort()
  }, [clave, ruta, modo])

  return {
    datos: clave && respuesta.clave === clave ? respuesta.datos : null,
    error: clave && respuesta.clave === clave ? respuesta.error : '',
    cargando: Boolean(clave && respuesta.clave !== clave),
  }
}
