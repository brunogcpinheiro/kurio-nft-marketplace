import { useSyncExternalStore } from 'react'

export type RealtimeNotice = {
  id: string
  kind: 'price' | 'availability' | 'order'
  message: string
  nftId?: string
  createdAt: number
}

let notices: RealtimeNotice[] = []
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export const realtimeNotices = {
  push(notice: Omit<RealtimeNotice, 'id' | 'createdAt'>) {
    const entry = { ...notice, id: crypto.randomUUID(), createdAt: Date.now() }
    notices = [entry, ...notices].slice(0, 5)
    emit()
    return entry
  },
  dismiss(id: string) {
    notices = notices.filter((n) => n.id !== id)
    emit()
  },
  clear() {
    notices = []
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  get: () => notices,
}

export function useRealtimeNotices() {
  return useSyncExternalStore(realtimeNotices.subscribe, realtimeNotices.get, realtimeNotices.get)
}
