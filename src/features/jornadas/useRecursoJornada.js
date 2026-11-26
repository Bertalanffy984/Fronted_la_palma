import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client.js'

const pedir = (path, signal) => api(path, { signal })

export default function useRecursoJornada(path, { cargar = pedir, intervalo = 0 } = {}) {
  const [revision, setRevision] = useState(0)
  const [resultado, setResultado] = useState(null)
  const actualizar = useCallback(() => setRevision((anterior) => anterior + 1), [])

  useEffect(() => {
    if (!path) return undefined
    const abort = new AbortController()
    cargar(path, abort.signal).then(
      (datos) => {
        if (!abort.signal.aborted) setResultado({ path, revision, datos, error: null })
      },
      (error) => {
        if (!abort.signal.aborted) setResultado((anterior) => ({
          path, revision, datos: anterior?.path === path ? anterior.datos : null, error,
        }))
      },
    )
    return () => abort.abort()
  }, [cargar, path, revision])

  useEffect(() => {
    if (!path || !intervalo) return undefined
    const reloj = window.setInterval(actualizar, intervalo)
    return () => window.clearInterval(reloj)
  }, [actualizar, intervalo, path])

  const actual = resultado?.path === path ? resultado : null
  return {
    datos: actual?.datos ?? null,
    error: actual?.error ?? null,
    cargando: Boolean(path && (!actual || actual.revision !== revision)),
    actualizar,
  }
}
