import { cn } from 'cn'

type Props = {
  value: string
  previous?: string | null
  className?: string
  previousClassName?: string
}

export function Price({ value, previous, className, previousClassName }: Props) {
  return (
    <span className={cn('inline-flex items-baseline gap-3', className)} data-price={value}>
      <span className="text-brand font-bold">{value} ETH</span>
      {previous ? (
        <s className={cn('text-fg-subtle font-normal', previousClassName)}>
          <span className="sr-only">antes </span>
          {previous} ETH
        </s>
      ) : null}
    </span>
  )
}
