import { http } from 'msw'
import { loginInputSchema, registerInputSchema, type User } from '@/api/schemas'
import { getDb, nextId, updateDb, type CartRecord } from '../db'
import {
  ApiFailure,
  bearerToken,
  hashPassword,
  json,
  mocked,
  noContent,
  parseBody,
  requireSession,
  sessionTtlMs,
} from '../http'
import { getScenario } from '../scenarios'

function openSession(user: User) {
  const token = `sess_${crypto.randomUUID().replace(/-/g, '')}`
  const expiresAt = Date.now() + sessionTtlMs
  updateDb((db) => {
    db.sessions.push({ token, userId: user.id, expiresAt })
  })
  return { user, token, expiresAt: new Date(expiresAt).toISOString() }
}

export function mergeGuestCart(guestId: string | null, userId: string) {
  if (!guestId) return
  updateDb((db) => {
    const guestKey = `guest:${guestId}`
    const userKey = `user:${userId}`
    const guest = db.carts.find((c) => c.ownerKey === guestKey)
    if (!guest || guest.items.length === 0) return
    let target = db.carts.find((c) => c.ownerKey === userKey)
    if (!target) {
      target = { id: nextId('cart'), ownerKey: userKey, items: [], couponCode: null, version: 0 }
      db.carts.push(target)
    }
    const cart: CartRecord = target
    for (const item of guest.items) {
      const nft = db.nfts.find((n) => n.id === item.nftId)
      const edition = nft?.editions.find((e) => e.id === item.editionId)
      if (!nft || !edition) continue
      const existing = cart.items.find(
        (i) => i.nftId === item.nftId && i.editionId === item.editionId,
      )
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + item.quantity,
          Math.max(edition.available, 1),
        )
      } else {
        cart.items.push({
          ...item,
          quantity: Math.min(item.quantity, Math.max(edition.available, 1)),
        })
      }
    }
    if (!cart.couponCode && guest.couponCode) cart.couponCode = guest.couponCode
    cart.version += 1
    db.carts = db.carts.filter((c) => c.ownerKey !== guestKey)
  })
}

export const authHandlers = [
  http.post(
    '/api/auth/register',
    mocked({ key: 'auth' }, async ({ request }) => {
      const input = await parseBody(request, registerInputSchema)
      const db = getDb()
      const email = input.email.toLowerCase()
      const fields: Record<string, string> = {}
      if (getScenario() === 'register-conflict' || db.users.some((u) => u.user.email === email)) {
        fields.email = 'Este e-mail já está em uso'
      }
      if (db.users.some((u) => u.user.username.toLowerCase() === input.username.toLowerCase())) {
        fields.username = 'Este nome de usuário já está em uso'
      }
      if (Object.keys(fields).length) {
        throw new ApiFailure(409, 'CONFLICT', 'Já existe uma conta com esses dados.', fields)
      }
      const user: User = {
        id: nextId('usr'),
        username: input.username,
        displayName: input.username,
        email,
        ensName: input.username.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        walletNickname: 'Principal',
        avatarUrl: null,
      }
      const passwordHash = await hashPassword(input.password)
      updateDb((d) => {
        d.users.push({ user, passwordHash })
        d.favorites[user.id] = []
      })
      mergeGuestCart(request.headers.get('x-guest-cart'), user.id)
      return json(openSession(user), 201)
    }),
  ),
  http.post(
    '/api/auth/login',
    mocked({ key: 'auth' }, async ({ request }) => {
      const input = await parseBody(request, loginInputSchema)
      const record = getDb().users.find((u) => u.user.email === input.email.toLowerCase())
      const hash = await hashPassword(input.password)
      if (!record || record.passwordHash !== hash) {
        throw new ApiFailure(401, 'UNAUTHENTICATED', 'E-mail ou senha inválidos.')
      }
      mergeGuestCart(request.headers.get('x-guest-cart'), record.user.id)
      return json(openSession(record.user))
    }),
  ),
  http.get(
    '/api/auth/session',
    mocked({ key: 'auth', private: true }, ({ request }) => {
      const { user, session } = requireSession(request)
      return json({ user, expiresAt: new Date(session.expiresAt).toISOString() })
    }),
  ),
  http.post(
    '/api/auth/logout',
    mocked({ key: 'auth' }, ({ request }) => {
      const token = bearerToken(request)
      updateDb((db) => {
        db.sessions = db.sessions.filter((s) => s.token !== token)
      })
      return noContent()
    }),
  ),
]
