import { useCallback, useSyncExternalStore } from 'react'
import type { Collector, Provider } from '@/api/schemas'

export type CheckoutDraft = {
  idempotencyKey: string
  form: Partial<Collector>
  provider: Provider | null
  walletId: string | null
  connectedProvider: Provider | null
  pendingOrderId: string | null
  step: 'collector' | 'wallet'
}

const listeners = new Set<() => void>()
const cache = new Map<string, CheckoutDraft>()

function storageKey(userId: string) {
  return `kurio:checkout:${userId}`
}

function fresh(): CheckoutDraft {
  return {
    idempotencyKey: crypto.randomUUID(),
    form: {},
    provider: null,
    walletId: null,
    connectedProvider: null,
    pendingOrderId: null,
    step: 'collector',
  }
}

function read(userId: string): CheckoutDraft {
  const cached = cache.get(userId)
  if (cached) return cached
  let draft = fresh()
  try {
    const raw = sessionStorage.getItem(storageKey(userId))
    if (raw) draft = { ...draft, ...(JSON.parse(raw) as Partial<CheckoutDraft>) }
  } catch {
    draft = fresh()
  }
  cache.set(userId, draft)
  return draft
}

function write(userId: string, draft: CheckoutDraft) {
  cache.set(userId, draft)
  try {
    sessionStorage.setItem(storageKey(userId), JSON.stringify(draft))
  } catch {
    return
  } finally {
    for (const listener of listeners) listener()
  }
}

export const checkoutDraft = {
  get: read,
  patch(userId: string, patch: Partial<CheckoutDraft>) {
    write(userId, { ...read(userId), ...patch })
  },
  rotateKey(userId: string) {
    write(userId, { ...read(userId), idempotencyKey: crypto.randomUUID() })
  },
  clear(userId: string) {
    cache.delete(userId)
    try {
      sessionStorage.removeItem(storageKey(userId))
    } finally {
      for (const listener of listeners) listener()
    }
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export function useCheckoutDraft(userId: string) {
  const draft = useSyncExternalStore(
    checkoutDraft.subscribe,
    () => read(userId),
    () => read(userId),
  )
  const patch = useCallback(
    (value: Partial<CheckoutDraft>) => checkoutDraft.patch(userId, value),
    [userId],
  )
  return { draft, patch }
}
