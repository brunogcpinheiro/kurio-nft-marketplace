import { http } from 'msw'
import { addCartItemInputSchema, type Cart } from '@/api/schemas'
import { getDb, nextId, updateDb, type CartRecord } from '../db'
import { ApiFailure, cartOwnerKey, json, mocked, parseBody } from '../http'
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

export function ensureCart(ownerKey: string) {
  return updateDb((db) => {
    let cart = db.carts.find((c) => c.ownerKey === ownerKey)
    if (!cart) {
      cart = { id: nextId('cart'), ownerKey, items: [], couponCode: null, version: 0 }
      db.carts.push(cart)
    }
    return cart
  })
}

function requireOwner(request: Request) {
  const ownerKey = cartOwnerKey(request)
  if (!ownerKey) throw new ApiFailure(422, 'VALIDATION', 'Carrinho não identificado')
  return ownerKey
}

export const cartHandlers = [
  http.get(
    '/api/cart',
    mocked({ key: 'cart' }, ({ request }) => json(serializeCart(findCart(cartOwnerKey(request))))),
  ),
  http.post(
    '/api/cart/items',
    mocked({ key: 'cart' }, async ({ request }) => {
      const ownerKey = requireOwner(request)
      const input = await parseBody(request, addCartItemInputSchema)
      const nft = getDb().nfts.find((n) => n.id === input.nftId)
      const edition = nft?.editions.find((e) => e.id === input.editionId)
      if (!nft || !edition) throw new ApiFailure(404, 'NOT_FOUND', 'Edição não encontrada')
      const cart = ensureCart(ownerKey)
      const existing = cart.items.find(
        (i) => i.nftId === input.nftId && i.editionId === input.editionId,
      )
      const wanted = (existing?.quantity ?? 0) + input.quantity
      if (edition.available === 0) {
        throw new ApiFailure(409, 'CONFLICT', 'Esta edição está esgotada.', undefined, {
          available: 0,
        })
      }
      if (wanted > edition.available) {
        throw new ApiFailure(
          409,
          'CONFLICT',
          `Só restam ${edition.available} ${edition.available === 1 ? 'unidade' : 'unidades'} desta edição.`,
          undefined,
          { available: edition.available },
        )
      }
      updateDb(() => {
        if (existing) existing.quantity = wanted
        else
          cart.items.push({
            id: nextId('item'),
            nftId: nft.id,
            editionId: edition.id,
            quantity: input.quantity,
            priceAtAdd: edition.price,
          })
        cart.version += 1
      })
      return json(serializeCart(cart), 201)
    }),
  ),
]
