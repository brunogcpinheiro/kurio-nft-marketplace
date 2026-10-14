export type Versioned = { version: number }

export function isNewerVersion(current: Versioned | undefined, incoming: Versioned): boolean {
  void current
  void incoming
  throw new Error('not implemented')
}

export function createEventDeduper(limit = 500): (eventId: string) => boolean {
  void limit
  throw new Error('not implemented')
}
