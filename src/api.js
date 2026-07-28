async function get(path, params) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v != null && v !== '')
  )
  const res = await fetch(`${path}${qs.size ? `?${qs}` : ''}`)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }

  return res.json()
}

export const search = (q, pageToken) => get('/api/search', { q, pageToken })

export const resolveStation = (id) => get(`/api/station/${encodeURIComponent(id)}`)
