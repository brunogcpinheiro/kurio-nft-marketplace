import type { ImageKey } from '@/api/schemas'

export const imageWidths = [160, 320, 640, 900] as const

export function nftImage(key: ImageKey, width: (typeof imageWidths)[number]) {
  return `/nfts/${key}-${width}.webp`
}

export function nftSrcSet(key: ImageKey) {
  return imageWidths.map((w) => `${nftImage(key, w)} ${w}w`).join(', ')
}
