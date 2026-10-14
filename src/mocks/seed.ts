import type { Db } from './db'
import nftsJson from './fixtures/nfts.json'
import { userFixtures } from './fixtures/users'

export const seedVersion = 1

export function createSeed(): Db {
  return {
    version: seedVersion,
    users: userFixtures.map(({ user, passwordHash }) => ({ user, passwordHash })),
    sessions: [],
    nfts: structuredClone(nftsJson) as Db['nfts'],
    favorites: Object.fromEntries(userFixtures.map((u) => [u.user.id, [...u.favorites]])),
    carts: [],
    quotes: [],
    orders: [],
    wallets: userFixtures.flatMap((u) => u.wallets.map((w) => ({ ...w, userId: u.user.id }))),
    idempotency: [],
    eventCounter: 0,
  }
}
