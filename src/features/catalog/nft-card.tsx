import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import type { NftSummary } from '@/api/schemas'
import { CartSmallIcon, HeartIcon, SearchIcon } from '@/components/icons'
import { NftImage } from '@/components/nft-image'
import { Price } from '@/components/price'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  nft: NftSummary
  favorited?: boolean
  onToggleFavorite?: (nft: NftSummary) => void
  onAddToCart?: (nft: NftSummary) => void
  priority?: boolean
  className?: string
}

const actionClass =
  'bg-surface border-surface-strong text-fg flex size-[35px] items-center justify-center rounded-full border'

export function NftCard({
  nft,
  favorited = false,
  onToggleFavorite,
  onAddToCart,
  priority,
  className,
}: Props) {
  return (
    <article
      className={cn('group relative flex flex-col gap-2 md:gap-3', className)}
      data-testid="nft-card"
    >
      <div className="bg-bg-elevated relative aspect-[175/200] overflow-hidden rounded-[20px] md:aspect-[258/300] md:rounded-none">
        <Link
          to="/nft/$slug"
          params={{ slug: nft.slug }}
          className="absolute inset-0 flex items-center justify-center p-1 md:p-1"
          aria-label={`${nft.name}, ${nft.price} ETH`}
        >
          <NftImage
            imageKey={nft.imageKey}
            name={nft.name}
            base={320}
            priority={priority}
            sizes="(min-width: 1280px) 250px, (min-width: 768px) 30vw, 45vw"
            className="size-full rounded-2xl object-cover md:rounded-[15px]"
          />
        </Link>
        {nft.rare ? (
          <span className="bg-brand-strong text-bg absolute top-4 left-0 px-2 py-2 text-[13px] leading-4 font-medium md:top-6">
            RARO
          </span>
        ) : null}
        {onToggleFavorite ? (
          <button
            type="button"
            onClick={() => onToggleFavorite(nft)}
            aria-pressed={favorited}
            aria-label={favorited ? `Remover ${nft.name} dos favoritos` : `Favoritar ${nft.name}`}
            className="bg-surface border-surface-strong text-brand-strong absolute top-3 right-3 flex size-7 items-center justify-center rounded-full border md:hidden"
          >
            <HeartIcon className={cn('size-4', favorited && 'fill-current')} />
          </button>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 hidden justify-center gap-2.5 opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 md:flex">
          {onAddToCart ? (
            <button
              type="button"
              className={actionClass}
              onClick={() => onAddToCart(nft)}
              aria-label={`Adicionar ${nft.name} ao carrinho`}
            >
              <CartSmallIcon className="size-5" />
            </button>
          ) : null}
          {onToggleFavorite ? (
            <button
              type="button"
              className={cn(actionClass, favorited && 'text-brand')}
              onClick={() => onToggleFavorite(nft)}
              aria-pressed={favorited}
              aria-label={favorited ? `Remover ${nft.name} dos favoritos` : `Favoritar ${nft.name}`}
            >
              <HeartIcon className={cn('size-5', favorited && 'fill-current')} />
            </button>
          ) : null}
          <Link
            to="/nft/$slug"
            params={{ slug: nft.slug }}
            className={actionClass}
            aria-label={`Ver detalhes de ${nft.name}`}
          >
            <SearchIcon className="size-5" />
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-2 md:gap-3 md:px-0">
        <h3 className="text-fg text-[15px] leading-5 font-normal md:text-base md:leading-4">
          <Link to="/nft/$slug" params={{ slug: nft.slug }} tabIndex={-1} aria-hidden="true">
            {nft.name}
          </Link>
        </h3>
        <Price
          value={nft.price}
          previous={nft.previousPrice}
          className="text-base leading-4 md:text-lg"
          previousClassName="text-base md:text-lg"
        />
      </div>
    </article>
  )
}

export function NftCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2 md:gap-3', className)} data-testid="nft-card-skeleton">
      <Skeleton className="aspect-[175/200] rounded-[20px] md:aspect-[258/300] md:rounded-none" />
      <div className="flex flex-col gap-2 px-2 md:gap-3 md:px-0">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}
