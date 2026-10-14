import { http } from 'msw'
import {
  addCartItemInputSchema,
  couponInputSchema,
  updateCartItemInputSchema,
  type Cart,
} from '@/api/schemas'
import { getDb, nextId, updateDb, type CartRecord } from '../db'
import { couponFixtures } from '../fixtures/coupons'
import { ApiFailure, cartOwnerKey, json, mocked, noContent, parseBody } from '../http'
import { getScenario } from '../scenarios'
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
  http.patch(
    '/api/cart/items/:itemId',
    mocked({ key: 'cart' }, async ({ request, params }) => {
      const ownerKey = requireOwner(request)
      const input = await parseBody(request, updateCartItemInputSchema)
      const cart = findCart(ownerKey)
      const item = cart?.items.find((i) => i.id === params.itemId)
      if (!cart || !item) throw new ApiFailure(404, 'NOT_FOUND', 'Item não encontrado no carrinho')
      const nft = getDb().nfts.find((n) => n.id === item.nftId)
      const edition = nft?.editions.find((e) => e.id === item.editionId)
      if (!nft || !edition) throw new ApiFailure(404, 'NOT_FOUND', 'Edição não encontrada')
      if (input.quantity > edition.available) {
        throw new ApiFailure(
          409,
          'CONFLICT',
          edition.available === 0
            ? 'Esta edição está esgotada.'
            : `Só restam ${edition.available} ${edition.available === 1 ? 'unidade' : 'unidades'} desta edição.`,
          undefined,
          { available: edition.available },
        )
      }
      updateDb(() => {
        item.quantity = input.quantity
        cart.version += 1
      })
      return json(serializeCart(cart))
    }),
  ),
  http.delete(
    '/api/cart/items/:itemId',
    mocked({ key: 'cart' }, ({ request, params }) => {
      const ownerKey = requireOwner(request)
      const cart = findCart(ownerKey)
      if (!cart) throw new ApiFailure(404, 'NOT_FOUND', 'Carrinho não encontrado')
      updateDb(() => {
        cart.items = cart.items.filter((i) => i.id !== params.itemId)
        cart.version += 1
      })
      return json(serializeCart(cart))
    }),
  ),
  http.put(
    '/api/cart/coupon',
    mocked({ key: 'cart' }, async ({ request }) => {
      const ownerKey = requireOwner(request)
      const { code } = await parseBody(request, couponInputSchema)
      const status = couponStatus(code)
      if (status === 'invalid')
        throw new ApiFailure(422, 'VALIDATION', 'Cupom inválido.', { code: 'Cupom inválido' })
      if (status === 'expired')
        throw new ApiFailure(422, 'VALIDATION', 'Cupom expirado.', { code: 'Cupom expirado' })
      const cart = ensureCart(ownerKey)
      updateDb(() => {
        cart.couponCode = code
        cart.version += 1
      })
      return json(serializeCart(cart))
    }),
  ),
  http.delete(
    '/api/cart/coupon',
    mocked({ key: 'cart' }, ({ request }) => {
      const ownerKey = requireOwner(request)
      const cart = findCart(ownerKey)
      if (!cart) return noContent()
      updateDb(() => {
        cart.couponCode = null
        cart.version += 1
      })
      return json(serializeCart(cart))
    }),
  ),
]

export function couponStatus(code: string | null): 'applied' | 'invalid' | 'expired' | null {
  if (!code) return null
  const coupon = couponFixtures.find((c) => c.code === code.toUpperCase())
  if (!coupon) return 'invalid'
  if (getScenario() === 'coupon-expired' && coupon.code === 'KURIO10') return 'expired'
  if (Date.parse(coupon.expiresAt) < Date.now()) return 'expired'
  return 'applied'
}

export function couponBps(code: string | null) {
  if (!code || couponStatus(code) !== 'applied') return 0
  return couponFixtures.find((c) => c.code === code.toUpperCase())?.percentBps ?? 0
}
