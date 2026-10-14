import type { Nft, Order, Quote, User, Wallet } from '@/api/schemas'
import { createSeed, seedVersion } from './seed'

export type NftRecord = Nft & { trendingScore: number }
export type UserRecord = { user: User; passwordHash: string }
export type SessionRecord = { token: string; userId: string; expiresAt: number }
export type CartItemRecord = {
  id: string
  nftId: string
  editionId: string
  quantity: number
  priceAtAdd: string
}
export type CartRecord = {
  id: string
  ownerKey: string
  items: CartItemRecord[]
  couponCode: string | null
  version: number
}
export type QuoteRecord = Quote & {
  ownerKey: string
  cartVersion: number
  nftVersions: Record<string, number>
}
export type OrderRecord = Order & {
  quoteId: string
  settleAt: number
  outcome: 'confirmed' | 'rejected'
  purchased: { cartItemId: string; nftId: string; editionId: string; quantity: number }[]
}
export type WalletRecord = Wallet & { userId: string }
export type IdempotencyRecord = { key: string; userId: string; bodyHash: string; orderId: string }

export type Db = {
  version: number
  users: UserRecord[]
  sessions: SessionRecord[]
  nfts: NftRecord[]
  favorites: Record<string, string[]>
  carts: CartRecord[]
  quotes: QuoteRecord[]
  orders: OrderRecord[]
  wallets: WalletRecord[]
  idempotency: IdempotencyRecord[]
  eventCounter: number
}

export const dbStorageKey = 'kurio:mock-db'

let cache: Db | null = null

function load(): Db {
  try {
    const raw = localStorage.getItem(dbStorageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as Db
      if (parsed.version === seedVersion) return parsed
    }
  } catch {
    localStorage.removeItem(dbStorageKey)
  }
  const fresh = createSeed()
  persist(fresh)
  return fresh
}

function persist(db: Db) {
  localStorage.setItem(dbStorageKey, JSON.stringify(db))
}

export function getDb(): Db {
  if (!cache) cache = load()
  return cache
}

export function updateDb<T>(mutate: (db: Db) => T): T {
  const db = getDb()
  const result = mutate(db)
  persist(db)
  return result
}

export function resetDb() {
  cache = createSeed()
  persist(cache)
  return cache
}

export function nextId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
