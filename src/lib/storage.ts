type Listener = () => void

export function createStoredValue<T>(key: string, parse: (raw: string) => T | null) {
  const listeners = new Set<Listener>()
  let snapshot: T | null | undefined
  let snapshotRaw: string | null | undefined

  function read(): T | null {
    let raw: string | null = null
    try {
      raw = localStorage.getItem(key)
    } catch {
      raw = null
    }
    if (raw === snapshotRaw && snapshot !== undefined) return snapshot
    snapshotRaw = raw
    snapshot = raw ? parse(raw) : null
    return snapshot
  }

  function notify() {
    for (const listener of listeners) listener()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === key || event.key === null) notify()
    })
  }

  return {
    get: read,
    set(value: T) {
      localStorage.setItem(key, JSON.stringify(value))
      notify()
    },
    clear() {
      localStorage.removeItem(key)
      notify()
    },
    subscribe(listener: Listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
