import { api } from '../../api/client.js'

export function catalogUrl(path, parameters = {}) {
  const query = new URLSearchParams()
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  return query.size ? `${path}?${query}` : path
}

export async function fetchCatalogOptions(path, signal) {
  const entries = new Map()
  const limit = 100

  for (let offset = 0; ; offset += limit) {
    const page = await api(catalogUrl(path, { limite: limit, offset }), { signal })
    page.forEach((entry) => entries.set(entry.id, entry))
    if (page.length < limit) return [...entries.values()]
  }
}

export function todayInBogota() {
  const parts = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const fields = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${fields.year}-${fields.month}-${fields.day}`
}

export function displayDate(date) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export function displayMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', currencyDisplay: 'symbol',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(value)
}
