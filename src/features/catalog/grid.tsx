import { cn } from 'cn'
import type { CatalogPage, NftSummary } from '@/api/schemas'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { NftCard, NftCardSkeleton } from './nft-card'

type Props = {
  data?: CatalogPage
  error?: unknown
  isPending: boolean
  isPlaceholder: boolean
  isFetching: boolean
  onRetry: () => void
  onReset: () => void
  onToggleFavorite?: (nft: NftSummary) => void
  isFavorite?: (nft: NftSummary) => boolean
  onAddToCart?: (nft: NftSummary) => void
}

const gridClass =
  'grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-2 md:gap-x-8 md:gap-y-[72px] xl:grid-cols-3 [&>*:nth-child(even)]:mt-8 md:[&>*:nth-child(even)]:mt-0'

export function CatalogGrid({
  data,
  error,
  isPending,
  isPlaceholder,
  isFetching,
  onRetry,
  onReset,
  onToggleFavorite,
  isFavorite,
  onAddToCart,
}: Props) {
  if (isPending) {
    return (
      <div
        className={gridClass}
        data-testid="catalog-skeleton"
        aria-busy="true"
        aria-label="Carregando catálogo"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <NftCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (error && !data) {
    return (
      <ErrorState
        title="Não foi possível carregar o catálogo"
        error={error}
        onRetry={onRetry}
        retrying={isFetching}
      />
    )
  }
  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="Nenhum NFT encontrado"
        description="Tente outra busca ou limpe os filtros para ver o catálogo completo."
        action={
          <Button variant="outline" onClick={onReset} className="mt-2">
            Limpar filtros
          </Button>
        }
      />
    )
  }
  return (
    <div
      className={cn(gridClass, isPlaceholder && 'opacity-60 transition-opacity')}
      aria-busy={isPlaceholder}
      data-testid="catalog-grid"
    >
      {data.items.map((nft, index) => (
        <NftCard
          key={nft.id}
          nft={nft}
          priority={index < 3}
          favorited={isFavorite?.(nft)}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
