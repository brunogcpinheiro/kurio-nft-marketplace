import { StarIcon } from '@/components/icons'

export function Rating({
  average,
  count,
  compact = false,
}: {
  average: number
  count: number
  compact?: boolean
}) {
  const rounded = Math.round(average)
  const label = `${average.toFixed(1)} de 5, ${count} avaliações de colecionadores`
  if (compact) {
    return (
      <span
        className="border-brand-strong text-fg flex h-[27px] items-center gap-1.5 rounded-full border px-2 text-sm"
        aria-label={label}
      >
        <StarIcon className="text-brand-strong size-3.5" />
        <span className="font-medium">{average.toFixed(1)}</span>
        <span className="text-fg-muted">({count})</span>
      </span>
    )
  }
  return (
    <span className="text-fg flex items-center gap-1 text-sm" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={
            i < rounded ? 'text-brand-strong size-[15px]' : 'text-surface-strong size-[15px]'
          }
        />
      ))}
      <span className="ml-1">{count} avaliações de colecionadores</span>
    </span>
  )
}
