import { http } from 'msw'
import type { Cart } from '@/api/schemas'
import { getDb, type CartRecord } from '../db'
import { cartOwnerKey, json, mocked } from '../http'
import { toSummary } from './nfts'

export function serializeCart(record: CartRecord | undefined): Cart {
  if (!record) return { id: '', items: [], couponCode: null, version: 0 }
  const db = getDb()
  const items = record.items.flatMap((item) => {
    const nft = db.nfts.find((n) => n.id === item.nftId)
    const edition = nft?.editions.find((e) => e.id === item.editionId)
    if (!nft || !edition) return []
    return [
      {
        id: item.id,
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
        nft: toSummary(nft),
        edition: { ...edition },
      },
    ]
  })
  return { id: record.id, items, couponCode: record.couponCode, version: record.version }
}

export function findCart(ownerKey: string | null) {
  if (!ownerKey) return undefined
  return getDb().carts.find((c) => c.ownerKey === ownerKey)
}

export const cartHandlers = [
  http.get(
    '/api/cart',
    mocked({ key: 'cart' }, ({ request }) => json(serializeCart(findCart(cartOwnerKey(request))))),
  ),
]
