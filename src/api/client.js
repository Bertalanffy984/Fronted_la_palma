const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const TOKEN_KEY = 'la-palma:token'
export const SESSION_EXPIRED = 'la-palma:session-expired'

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = 'GET', body, signal, auth = true } = {}) {
  const token = auth ? getToken() : null
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = 'Bearer ' + token
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(BASE_URL + path, {
      method,
      signal,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, 'conexion', 'No se pudo conectar con el servidor de La Palma.')
  }

  if (response.status === 204) return null
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && token && getToken() === token) {
      setToken(null)
      window.dispatchEvent(new Event(SESSION_EXPIRED))
    }
    const detail = payload?.detail
    const message = detail?.mensaje || (typeof detail === 'string' ? detail : null) ||
      (response.status >= 500 ? 'El servidor no está disponible. Intenta nuevamente.' : 'No se pudo completar la solicitud.')
    throw new ApiError(response.status, detail?.codigo, message)
  }
  if (payload === null) {
    throw new ApiError(response.status, 'respuesta_invalida', 'La API devolvió una respuesta inesperada.')
  }
  return payload
}
