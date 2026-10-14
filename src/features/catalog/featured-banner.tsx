import { Link } from '@tanstack/react-router'
import type { NftSummary } from '@/api/schemas'
import { NftImage } from '@/components/nft-image'
import { Skeleton } from '@/components/ui/skeleton'

export function FeaturedBanner({ nft }: { nft?: NftSummary }) {
  if (!nft) {
    return (
      <div className="flex flex-col gap-4 pt-6" aria-busy="true">
        <Skeleton className="mx-5 h-8" />
        <Skeleton className="mx-5 h-4 w-2/3" />
        <Skeleton className="h-[368px] rounded-[22px]" />
      </div>
    )
  }
  return (
    <Link
      to="/nft/$slug"
      params={{ slug: nft.slug }}
      className="flex flex-col gap-4 pt-6"
      aria-label={`NFT em destaque: ${nft.name}`}
    >
      <div className="flex flex-col gap-4 px-5">
        <p className="text-brand text-2xl leading-8 font-bold uppercase">NFT em destaque</p>
        <p className="text-fg pl-5 text-[22px] leading-4 font-bold uppercase">Oferta limitada</p>
      </div>
      <NftImage
        imageKey={nft.imageKey}
        name={nft.name}
        base={640}
        sizes="310px"
        className="h-[368px] w-full rounded-[22px] object-cover"
        width={310}
        height={368}
      />
    </Link>
  )
}
