/**
 * In-memory TTL cache.
 *
 * Two jobs. It keeps quota use sane, and it keeps this server from ever becoming a
 * durable store of YouTube data: the policies cap retention of API data at 30 days,
 * and nothing here outlives a few hours or a process restart. There is no database
 * and nothing is written to disk on purpose.
 */
export function createCache({ ttlMs, max = 500 }) {
  const entries = new Map()

  const get = (key) => {
    const hit = entries.get(key)
    if (!hit) return undefined

    if (hit.expires < Date.now()) {
      entries.delete(key)
      return undefined
    }

    return hit.value
  }

  const set = (key, value) => {
    if (entries.size >= max) {
      // Map preserves insertion order, so the first key is the oldest.
      entries.delete(entries.keys().next().value)
    }
    entries.set(key, { value, expires: Date.now() + ttlMs })
  }

  return {
    get,
    set,
    async wrap(key, produce) {
      const cached = get(key)
      if (cached !== undefined) return cached

      const value = await produce()
      set(key, value)
      return value
    }
  }
}
