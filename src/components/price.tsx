import { cn } from 'cn'

type Props = {
  value: string
  previous?: string | null
  className?: string
  previousClassName?: string
}

export function Price({ value, previous, className, previousClassName }: Props) {
  const label = previous ? `${value} ETH, antes ${previous} ETH` : `${value} ETH`
  return (
    <span className={cn('inline-flex items-baseline gap-3', className)} aria-label={label}>
      <span className="text-brand font-bold" aria-hidden="true">
        {value} ETH
      </span>
      {previous ? (
        <s className={cn('text-fg-subtle font-normal', previousClassName)} aria-hidden="true">
          {previous} ETH
        </s>
      ) : null}
    </span>
  )
}
