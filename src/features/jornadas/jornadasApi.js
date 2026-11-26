import { api } from '../../api/client.js'

export const pageSize = 15

export function listado(endpoint, pagina = 0) {
  return `${endpoint}?limite=${pageSize + 1}&offset=${pagina * pageSize}`
}

export async function trabajadoresParaJornada(path, signal) {
  const trabajadores = []
  for (let offset = 0; ; offset += 100) {
    const filas = await api(`${path}?limite=100&offset=${offset}`, { signal })
    trabajadores.push(...filas)
    if (filas.length < 100) return trabajadores
  }
}

const mensajesPago = {
  pagado: { mensaje: 'Pago confirmado.', tone: 'success' },
  ya_pagado: { mensaje: 'Este pago ya estaba confirmado.', tone: 'success' },
  revisar: { mensaje: 'La liquidación cambió. Revisa los kilos y el importe antes de confirmar.', tone: 'warning' },
  sin_liquidacion: { mensaje: 'Este pago ya no está disponible. Actualiza la liquidación.', tone: 'warning' },
}

const exito = (mensaje) => ({ mensaje, tone: 'success' })

export async function ejecutarAccion({ tipo, id, fila, datos }) {
  const form = Object.fromEntries(datos)
  const ruta = `/jornadas/${id}`
  switch (tipo) {
    case 'crear': {
      const jornada = await api('/jornadas', { method: 'POST', body: form })
      return { ...exito('Jornada creada.'), jornada }
    }
    case 'cerrar':
      await api(`${ruta}/cierre`, { method: 'PATCH', body: { fecha_fin: form.fecha_fin } })
      return exito('Jornada cerrada.')
    case 'inscribir':
      await api(`${ruta}/participantes`, { method: 'POST', body: { fk_trabajador: Number(form.fk_trabajador) } })
      return exito('Trabajador inscrito.')
    case 'pesar':
      await api(`/participaciones/${form.id_participacion}/pesajes`, {
        method: 'POST', body: { fecha_hora_pesaje: form.fecha_hora_pesaje, kg_recolectados: form.kg_recolectados },
      })
      return exito('Pesaje registrado.')
    case 'corregir': {
      const fecha = encodeURIComponent(fila.fecha_hora_pesaje)
      await api(`/participaciones/${fila.fk_participacion}/pesajes/${fecha}`, {
        method: 'PATCH', body: { kg_recolectados: form.kg_recolectados },
      })
      return exito('Pesaje corregido.')
    }
    case 'inactivar': {
      const fecha = encodeURIComponent(fila.fecha_hora_pesaje)
      await api(`/participaciones/${fila.fk_participacion}/pesajes/${fecha}`, { method: 'DELETE' })
      return exito('Pesaje inactivado.')
    }
    case 'liquidar':
      await api(`${ruta}/liquidar`, { method: 'POST' })
      return exito('Liquidación actualizada.')
    case 'pagar': {
      const pago = await api(`/pagos/${fila.id_pago}/confirmar`, {
        method: 'POST', body: { kg_vistos: fila.total_kg_recolectados, importe_visto: fila.total_pagar },
      })
      return mensajesPago[pago.resultado] ?? { mensaje: 'Consulta el estado actualizado del pago.', tone: 'warning' }
    }
    default:
      throw new Error('Operación de jornada desconocida.')
  }
}
