import { cn } from 'cn'
import type { Edition } from '@/api/schemas'

type Props = { editions: Edition[]; value: string; onChange: (id: string) => void }

export function EditionPicker({ editions, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p id="edicao-label" className="text-fg text-[15px] leading-4 font-bold">
        Edição:
      </p>
      <div
        role="radiogroup"
        aria-labelledby="edicao-label"
        className="flex flex-wrap gap-1.5 md:gap-1.5"
      >
        {editions.map((edition) => {
          const soldOut = edition.available === 0
          const selected = edition.id === value
          return (
            <button
              key={edition.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={soldOut}
              onClick={() => onChange(edition.id)}
              aria-label={`${edition.label}${soldOut ? ', esgotada' : `, ${edition.price} ETH`}`}
              className={cn(
                'flex h-7 items-center rounded-full border px-2.5 text-sm leading-4 uppercase',
                selected
                  ? 'border-brand-strong text-brand font-medium'
                  : 'border-surface-strong text-fg-muted',
                soldOut && 'cursor-not-allowed line-through opacity-50',
              )}
            >
              {edition.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
