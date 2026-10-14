export type IdempotencyRecord = { key: string; userId: string; bodyHash: string; orderId: string }

export type IdempotencyResolution =
  { kind: 'new' } | { kind: 'replay'; orderId: string } | { kind: 'mismatch' }

export function resolveIdempotentOrder(
  records: IdempotencyRecord[],
  key: string,
  userId: string,
  bodyHash: string,
): IdempotencyResolution {
  const match = records.find((r) => r.key === key && r.userId === userId)
  if (!match) return { kind: 'new' }
  if (match.bodyHash !== bodyHash) return { kind: 'mismatch' }
  return { kind: 'replay', orderId: match.orderId }
}

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}
