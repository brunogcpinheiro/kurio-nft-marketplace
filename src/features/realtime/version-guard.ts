export type Versioned = { version: number }

export function isNewerVersion(current: Versioned | undefined, incoming: Versioned): boolean {
  if (!current) return true
  return incoming.version > current.version
}

export function createEventDeduper(limit = 500): (eventId: string) => boolean {
  const seen = new Set<string>()
  return (eventId) => {
    if (seen.has(eventId)) return false
    seen.add(eventId)
    if (seen.size > limit) {
      const oldest = seen.values().next().value
      if (oldest !== undefined) seen.delete(oldest)
    }
    return true
  }
}
