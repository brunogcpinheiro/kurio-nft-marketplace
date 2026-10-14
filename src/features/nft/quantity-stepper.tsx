import { cn } from 'cn'

type Props = {
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  label?: string
}

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
  size = 'md',
  label = 'Quantidade',
}: Props) {
  const atMax = value >= max
  const button = cn(
    'bg-brand-strong text-bg flex items-center justify-center rounded-full font-bold disabled:opacity-40',
    size === 'md' ? 'size-[30px] text-lg' : 'size-5 text-sm',
  )
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        className={button}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <output
        className={cn(
          'text-fg min-w-[1ch] text-center font-medium',
          size === 'md' ? 'text-lg' : 'text-base',
        )}
        aria-live="polite"
      >
        {value}
      </output>
      <button
        type="button"
        className={button}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || atMax}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  )
}
