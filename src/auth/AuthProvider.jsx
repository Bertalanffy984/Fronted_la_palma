import { useCallback, useEffect, useState } from 'react'
import { api, getToken, SESSION_EXPIRED, setToken } from '../api/client.js'
import { AuthContext } from './context.js'

const anonymous = { user: null, status: 'anonymous', error: '' }

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getToken()
    ? { user: null, status: 'loading', error: '' }
    : anonymous)

  const restore = useCallback(async (signal) => {
    const token = getToken()
    if (!token || signal?.aborted) return
    try {
      const user = await api('/auth/me', { signal })
      if (!signal?.aborted && getToken() === token) {
        setSession({ user, status: 'authenticated', error: '' })
      }
    } catch (error) {
      if (error.name !== 'AbortError' && error.status !== 401 && getToken() === token) {
        setSession({ user: null, status: 'error', error: error.message })
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const expired = () => setSession({ ...anonymous, error: 'Tu sesión venció. Inicia sesión nuevamente.' })
    window.addEventListener(SESSION_EXPIRED, expired)
    queueMicrotask(() => void restore(controller.signal))
    return () => {
      controller.abort()
      window.removeEventListener(SESSION_EXPIRED, expired)
    }
  }, [restore])

  const signIn = async (usuario, contrasena) => {
    const data = await api('/auth/login', {
      method: 'POST',
      auth: false,
      body: { usuario, contrasena },
    })
    setToken(data.access_token)
    try {
      const user = await api('/auth/me')
      setSession({ user, status: 'authenticated', error: '' })
    } catch (error) {
      setToken(null)
      throw error
    }
  }

  const signOut = () => {
    setToken(null)
    setSession(anonymous)
  }

  return <AuthContext.Provider value={{ ...session, signIn, signOut, restore }}>
    {children}
  </AuthContext.Provider>
}
