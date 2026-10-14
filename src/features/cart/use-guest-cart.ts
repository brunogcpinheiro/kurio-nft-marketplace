import { createStoredValue } from '@/lib/storage'

const store = createStoredValue<string>('kurio:guest-cart', (raw) => {
  const value = raw.startsWith('"') ? raw.slice(1, -1) : raw
  return value || null
})

export const guestCart = {
  get: store.get,
  subscribe: store.subscribe,
  clear: store.clear,
  ensure() {
    const current = store.get()
    if (current) return current
    const id = `g_${crypto.randomUUID().slice(0, 12)}`
    store.set(id)
    return id
  },
}
