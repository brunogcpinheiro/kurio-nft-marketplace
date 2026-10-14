import { cn } from 'cn'
import type { NftSummary } from '@/api/schemas'
import { HeartIcon } from '@/components/icons'
import { useFavorites, useToggleFavorite } from '@/features/favorites/queries'

type Props = {
  nft: Pick<NftSummary, 'id' | 'name'>
  variant?: 'button' | 'icon'
  className?: string
}

export function FavoriteButton({ nft, variant = 'button', className }: Props) {
  const { isFavorite } = useFavorites()
  const { toggle } = useToggleFavorite()
  const active = isFavorite(nft)
  const label = active ? `Remover ${nft.name} dos favoritos` : `Favoritar ${nft.name}`
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => toggle(nft, active)}
        aria-pressed={active}
        aria-label={label}
        className={cn(
          'bg-surface border-surface-strong text-brand-strong flex size-[35px] items-center justify-center rounded-full border',
          className,
        )}
      >
        <HeartIcon className={cn('size-5', active && 'fill-current')} />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => toggle(nft, active)}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        'border-brand-strong text-brand flex h-10 w-[130px] items-center justify-center gap-2 rounded-md border text-sm font-medium',
        className,
      )}
    >
      <HeartIcon className={cn('size-5', active && 'fill-current')} />
      {active ? 'Favoritado' : 'Favoritar'}
    </button>
  )
}
