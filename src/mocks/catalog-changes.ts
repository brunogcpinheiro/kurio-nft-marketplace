import type { NftUpdatedEvent } from '@/api/schemas'
import { updateDb } from './db'

export type NftChange = 'price-up' | 'price-down' | 'sold-out'

function scalePrice(price: string, factor: number) {
  return (Math.round(Number(price) * factor * 100) / 100).toFixed(2)
}

export function applyNftChange(
  nftId: string,
  change: NftChange,
  editionId?: string,
): NftUpdatedEvent | null {
  return updateDb((db) => {
    const nft = db.nfts.find((n) => n.id === nftId)
    if (!nft) return null
    const target = nft.editions.find((e) => e.id === (editionId ?? 'e50')) ?? nft.editions[0]
    if (!target) return null
    if (change === 'sold-out') {
      target.available = 0
    } else {
      target.price = scalePrice(target.price, change === 'price-up' ? 1.15 : 0.85)
      if (target.id === 'e50') {
        nft.previousPrice = nft.price
        nft.price = target.price
      }
    }
    nft.version += 1
    db.eventCounter += 1
    return {
      eventId: `evt_${db.eventCounter}`,
      nftId: nft.id,
      version: nft.version,
      price: nft.price,
      previousPrice: nft.previousPrice,
      editions: structuredClone(nft.editions),
    }
  })
}
