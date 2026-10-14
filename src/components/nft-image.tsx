import type { ComponentProps } from 'react'
import type { ImageKey } from '@/api/schemas'
import { nftImage, nftSrcSet, type imageWidths } from '@/lib/images'

type Props = Omit<ComponentProps<'img'>, 'src' | 'srcSet'> & {
  imageKey: ImageKey
  name: string
  base?: (typeof imageWidths)[number]
  priority?: boolean
}

export function NftImage({ imageKey, name, base = 320, priority = false, sizes, ...props }: Props) {
  return (
    <img
      src={nftImage(imageKey, base)}
      srcSet={nftSrcSet(imageKey)}
      sizes={sizes ?? `${base}px`}
      alt={`Arte do NFT ${name}`}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      {...props}
    />
  )
}
