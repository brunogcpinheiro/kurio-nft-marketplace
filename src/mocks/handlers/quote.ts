import { http } from 'msw'
import type { Network, Quote, QuoteLine } from '@/api/schemas'
import { addEth, mulEth, percentOf, subEth } from '@/lib/eth'
import { getDb, nextId, updateDb } from '../db'
import { ApiFailure, cartOwnerKey, json, mocked } from '../http'
import { couponBps, couponStatus, findCart } from './cart'

export const networkFees: Record<Network, string> = {
  ethereum: '0.016',
  polygon: '0.002',
  solana: '0.001',
}
export const quoteTtlMs = 2 * 60 * 1000

export function buildQuote(ownerKey: string): Quote {
  const db = getDb()
  const cart = findCart(ownerKey)
  const lines: QuoteLine[] = []
  const nftVersions: Record<string, number> = {}
  const issues: string[] = []
  const networkCount: Record<Network, number> = { ethereum: 0, polygon: 0, solana: 0 }

  for (const item of cart?.items ?? []) {
    const nft = db.nfts.find((n) => n.id === item.nftId)
    const edition = nft?.editions.find((e) => e.id === item.editionId)
    if (!nft || !edition) continue
    const quantity = Math.min(item.quantity, edition.available)
    const availability =
      edition.available === 0 ? 'sold_out' : quantity < item.quantity ? 'reduced' : 'ok'
    if (availability === 'sold_out') issues.push(`${nft.name} (${edition.label}) esgotou.`)
    if (availability === 'reduced')
      issues.push(
        `${nft.name} (${edition.label}) só tem ${quantity} ${quantity === 1 ? 'unidade' : 'unidades'}.`,
      )
    const priceChanged = edition.price !== item.priceAtAdd
    if (priceChanged)
      issues.push(`${nft.name} mudou de ${item.priceAtAdd} para ${edition.price} ETH.`)
    networkCount[nft.network] += quantity
    nftVersions[nft.id] = nft.version
    lines.push({
      cartItemId: item.id,
      nftId: nft.id,
      slug: nft.slug,
      editionId: edition.id,
      name: nft.name,
      tokenId: nft.tokenId,
      imageKey: nft.imageKey,
      editionLabel: edition.label,
      quantity,
      requestedQuantity: item.quantity,
      unitPrice: edition.price,
      lineTotal: mulEth(edition.price, quantity),
      availability,
      priceChanged,
    })
  }

  const subtotal = addEth(...lines.map((l) => l.lineTotal))
  const code = cart?.couponCode ?? null
  const status = couponStatus(code)
  const discount = percentOf(subtotal, couponBps(code))
  const network = (Object.entries(networkCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'ethereum') as Network
  const networkFee = lines.length ? networkFees[network] : '0.00'
  const total = addEth(subEth(subtotal, discount), networkFee)
  const quote: Quote = {
    quoteId: nextId('q'),
    lines,
    subtotal,
    discount,
    networkFee,
    total,
    network,
    coupon: code && status ? { code, status } : null,
    expiresAt: new Date(Date.now() + quoteTtlMs).toISOString(),
    issues,
  }
  updateDb((d) => {
    d.quotes = d.quotes
      .filter((q) => q.ownerKey !== ownerKey || Date.parse(q.expiresAt) > Date.now() - quoteTtlMs)
      .slice(-20)
    d.quotes.push({ ...quote, ownerKey, cartVersion: cart?.version ?? 0, nftVersions })
  })
  return quote
}

export const quoteHandlers = [
  http.post(
    '/api/quote',
    mocked({ key: 'quote' }, ({ request }) => {
      const ownerKey = cartOwnerKey(request)
      if (!ownerKey) throw new ApiFailure(422, 'VALIDATION', 'Carrinho não identificado')
      return json(buildQuote(ownerKey))
    }),
  ),
]
