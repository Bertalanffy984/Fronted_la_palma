import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'

const fechaHora = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Bogota',
})
const kilos = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 })

export function nombreCompleto(persona) {
  return [persona.nombre_1, persona.nombre_2, persona.apellido_1, persona.apellido_2]
    .filter(Boolean)
    .join(' ')
}

export function fechaRegistro(valor) {
  const instante = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(valor) ? valor : valor + '-05:00')
  return Number.isNaN(instante.getTime()) ? '—' : fechaHora.format(instante)
}

export function peso(valor) {
  return valor === null || valor === undefined ? '—' : kilos.format(Number(valor)) + ' kg'
}

export function marcaEstado(valor) {
  return valor === null || valor === undefined ? '—' : valor ? 'Sí' : 'No'
}

function siguienteDia(fecha) {
  const dia = new Date(fecha + 'T00:00:00Z')
  dia.setUTCDate(dia.getUTCDate() + 1)
  return dia.toISOString().slice(0, 10)
}

export function rutaAuditoria(filtros, pagina, filas) {
  const parametros = new URLSearchParams({ pagina, por_pagina: filas })
  if (filtros.jornada) parametros.set('id_jornada', filtros.jornada)
  if (filtros.encargado) parametros.set('id_encargado', filtros.encargado)
  if (filtros.desde) parametros.set('desde', filtros.desde + 'T00:00:00-05:00')
  if (filtros.hasta) parametros.set('hasta', siguienteDia(filtros.hasta) + 'T00:00:00-05:00')
  return '/auditoria/pesajes?' + parametros
}

export function useConsultaAdmin(ruta, version = 0, todas = false) {
  const clave = ruta ? ruta + '@' + version : null
  const [respuesta, setRespuesta] = useState({ clave: null, datos: null, error: '' })

  useEffect(() => {
    if (!ruta) return
    const control = new AbortController()
    const consultar = async () => {
      try {
        const opts = { signal: control.signal }
        let datos
        if (todas) {
          datos = []
          for (let offset = 0; ; offset += 100) {
            const pagina = await api(ruta + '?limite=100&offset=' + offset, opts)
            datos.push(...pagina)
            if (pagina.length < 100) break
          }
        } else {
          datos = await api(ruta, opts)
        }
        if (!control.signal.aborted) setRespuesta({ clave, datos, error: '' })
      } catch (error) {
        if (!control.signal.aborted) setRespuesta({ clave, datos: null, error: error.message })
      }
    }
    consultar()
    return () => control.abort()
  }, [clave, ruta, todas])

  return {
    datos: clave && respuesta.clave === clave ? respuesta.datos : null,
    error: clave && respuesta.clave === clave ? respuesta.error : '',
    cargando: Boolean(clave && respuesta.clave !== clave),
  }
}
