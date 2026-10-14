import { useState } from 'react'
import { cn } from 'cn'
import type { CatalogPage, CatalogQuery, Network } from '@/api/schemas'
import { FilterIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'

type Facets = CatalogPage['facets']

type Props = {
  facets?: Facets
  search: CatalogQuery
  onChange: (patch: Partial<CatalogQuery>) => void
}

const rowClass = 'flex h-10 w-full items-center justify-between text-[15px] leading-10'

function formatRange(value: number) {
  return value.toFixed(2).replace('.', ',')
}

export function FiltersPanel({ facets, search, onChange }: Props) {
  if (!facets) return <FiltersSkeleton />
  const min = Number(facets.priceRange.min)
  const max = Number(facets.priceRange.max)

  return (
    <div className="bg-bg-elevated flex flex-col gap-10 p-5">
      <section aria-labelledby="filtro-colecoes" className="flex flex-col gap-3">
        <h2 id="filtro-colecoes" className="text-fg text-lg leading-4 font-bold">
          Coleções
        </h2>
        <ul className="px-3">
          {facets.categories.map((category) => {
            const active = search.category === category.slug
            return (
              <li key={category.slug}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ category: active ? undefined : category.slug })}
                  className={cn(rowClass, active ? 'text-brand' : 'text-fg-muted hover:text-fg')}
                >
                  <span>{category.name}</span>
                  <span className="font-bold">({category.count})</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="filtro-preco" className="flex flex-col gap-3">
        <h2 id="filtro-preco" className="text-fg text-lg leading-4 font-bold">
          Faixa de preço
        </h2>
        <PriceRangeForm
          key={`${min}-${max}-${search.minPrice ?? ''}-${search.maxPrice ?? ''}`}
          min={min}
          max={max}
          initial={[
            search.minPrice ? Number(search.minPrice) : min,
            search.maxPrice ? Number(search.maxPrice) : max,
          ]}
          onApply={(range) =>
            onChange({
              minPrice: range[0] > min ? range[0].toFixed(2) : undefined,
              maxPrice: range[1] < max ? range[1].toFixed(2) : undefined,
            })
          }
        />
      </section>

      <section aria-labelledby="filtro-rede" className="flex flex-col gap-3">
        <h2 id="filtro-rede" className="text-fg text-lg leading-4 font-bold">
          Rede
        </h2>
        <ul className="pl-3">
          {facets.networks.map((network) => {
            const active = search.network === network.slug
            return (
              <li key={network.slug}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange({ network: active ? undefined : (network.slug as Network) })
                  }
                  className={cn(rowClass, active ? 'text-brand' : 'text-fg-muted hover:text-fg')}
                >
                  <span>{network.name}</span>
                  <span>({network.count})</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

type PriceRangeProps = {
  min: number
  max: number
  initial: [number, number]
  onApply: (range: [number, number]) => void
}

function PriceRangeForm({ min, max, initial, onApply }: PriceRangeProps) {
  const [range, setRange] = useState<[number, number]>(initial)
  return (
    <form
      className="flex flex-col gap-3 pl-3"
      onSubmit={(event) => {
        event.preventDefault()
        onApply(range)
      }}
    >
      <Slider
        min={min}
        max={max}
        step={0.01}
        value={range}
        onValueChange={(value) => setRange([value[0] ?? min, value[1] ?? max])}
        minStepsBetweenThumbs={1}
        aria-label="Faixa de preço em ETH"
        className="[&_[data-slot=slider-range]]:bg-brand-strong [&_[data-slot=slider-thumb]]:border-bg [&_[data-slot=slider-thumb]]:bg-brand-strong [&_[data-slot=slider-track]]:bg-brand-strong py-1 [&_[data-slot=slider-thumb]]:size-[15px] [&_[data-slot=slider-thumb]]:border-[3px] [&_[data-slot=slider-track]]:h-1"
      />
      <p className="text-fg text-[15px] leading-5" aria-live="polite">
        Preço: {formatRange(range[0])} - {formatRange(range[1])} ETH
      </p>
      <Button type="submit" className="h-9 w-[92px] text-base font-bold">
        Aplicar
      </Button>
    </form>
  )
}

function FiltersSkeleton() {
  return (
    <div
      className="bg-bg-elevated flex flex-col gap-10 p-5"
      aria-busy="true"
      aria-label="Carregando filtros"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-9 w-[92px]" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}

export function FiltersDrawer({
  facets,
  search,
  onChange,
  triggerClassName,
}: Props & { triggerClassName?: string }) {
  const [open, setOpen] = useState(false)
  const active = [search.category, search.network, search.minPrice, search.maxPrice].filter(
    Boolean,
  ).length
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            'bg-brand-strong text-bg flex size-[45px] shrink-0 items-center justify-center rounded-[14px]',
            triggerClassName,
          )}
          aria-label={active ? `Filtros, ${active} ativos` : 'Filtros'}
        >
          <FilterIcon className="size-[22px]" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-bg w-[320px] overflow-y-auto p-0 sm:max-w-[320px]">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Refine o catálogo por coleção, preço e rede.</SheetDescription>
        </SheetHeader>
        <FiltersPanel
          facets={facets}
          search={search}
          onChange={(patch) => {
            onChange(patch)
            if (patch.minPrice !== undefined || patch.maxPrice !== undefined) setOpen(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
