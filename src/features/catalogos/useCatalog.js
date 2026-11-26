import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { catalogUrl, fetchCatalogOptions } from './catalogApi.js'

const PAGE_SIZE = 12

export function useCatalog(path, filters) {
  const filterKey = catalogUrl(path, filters)
  const [pagination, setPagination] = useState({ key: null, page: 0 })
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const page = pagination.key === filterKey ? pagination.page : 0
  const query = catalogUrl(path, { ...filters, limite: PAGE_SIZE + 1, offset: page * PAGE_SIZE })

  useEffect(() => {
    const controller = new AbortController()
    api(query, { signal: controller.signal }).then(
      (rows) => {
        if (!controller.signal.aborted) setResult({ query, revision, rows })
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ query, revision, error })
      },
    )
    return () => controller.abort()
  }, [query, revision])

  const current = result?.query === query && result?.revision === revision ? result : null
  const rows = current?.rows ?? []
  const navigate = (next) => setPagination({ key: filterKey, page: next })

  return {
    rows: rows.slice(0, PAGE_SIZE),
    loading: !current,
    error: current?.error,
    page,
    offset: page * PAGE_SIZE,
    hasMore: rows.length > PAGE_SIZE,
    navigate,
    reload({ created = false, deleted = false } = {}) {
      if (created) navigate(0)
      if (deleted && page > 0 && rows.length === 1) navigate(page - 1)
      setRevision((value) => value + 1)
    },
  }
}

export function useCatalogOptions(path, revision = 0) {
  const [result, setResult] = useState(null)
  useEffect(() => {
    const controller = new AbortController()
    fetchCatalogOptions(path, controller.signal).then(
      (rows) => {
        if (!controller.signal.aborted) setResult({ path, revision, rows })
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ path, revision, error })
      },
    )
    return () => controller.abort()
  }, [path, revision])

  const current = result?.path === path && result?.revision === revision ? result : null
  return { rows: current?.rows ?? [], loading: !current, error: current?.error }
}
