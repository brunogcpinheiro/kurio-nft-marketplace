import type { AuthResponse } from '@/api/schemas'
import { createStoredValue, parseJson } from '@/lib/storage'

export type StoredSession = { token: string; userId: string; expiresAt: string }

export const session = createStoredValue<StoredSession>('kurio:session', (raw) => {
  const value = parseJson<StoredSession>(raw)
  if (!value || typeof value.token !== 'string' || typeof value.userId !== 'string') return null
  return value
})

export function sessionFromAuth(auth: AuthResponse): StoredSession {
  return { token: auth.token, userId: auth.user.id, expiresAt: auth.expiresAt }
}

export function cartOwnerKey() {
  const current = session.get()
  return current ? `user:${current.userId}` : 'guest'
}
