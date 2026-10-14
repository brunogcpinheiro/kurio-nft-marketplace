import { Link, createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { NftCard, NftCardSkeleton } from '@/features/catalog/nft-card'
import { useFavorites, useToggleFavorite } from '@/features/favorites/queries'

export const Route = createFileRoute('/_auth/perfil/favoritos')({
  component: FavoritesPage,
})

function FavoritesPage() {
  const favorites = useFavorites()
  const { toggle } = useToggleFavorite()
  const grid =
    'grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-2 md:gap-x-7 md:gap-y-12 xl:grid-cols-3'

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-fg text-base leading-4 font-bold">Lista de interesse</h1>
      {favorites.isPending ? (
        <div className={grid} aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <NftCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.isError ? (
        <ErrorState
          title="Não foi possível carregar os favoritos"
          error={favorites.error}
          onRetry={() => void favorites.refetch()}
          retrying={favorites.isFetching}
        />
      ) : favorites.data && favorites.data.items.length > 0 ? (
        <div className={grid} data-testid="favorites-grid">
          {favorites.data.items.map((nft) => (
            <NftCard
              key={nft.id}
              nft={nft}
              favorited
              onToggleFavorite={(item) => toggle(item, true)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Você ainda não favoritou nenhum NFT"
          description="Toque no coração de um NFT para guardá-lo aqui."
          action={
            <Button asChild className="mt-2">
              <Link to="/">Explorar catálogo</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
