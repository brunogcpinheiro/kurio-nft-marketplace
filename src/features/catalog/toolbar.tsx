import { cn } from 'cn'
import type { CatalogQuery, CatalogSort, CatalogTab } from '@/api/schemas'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const tabs: { value: CatalogTab; label: string }[] = [
  { value: 'all', label: 'Todos os NFTs' },
  { value: 'new', label: 'Novos lançamentos' },
  { value: 'trending', label: 'Em alta' },
]

export const sortLabels: Record<CatalogSort, string> = {
  recent: 'Listados recentemente',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  popular: 'Mais populares',
}

type Props = { search: CatalogQuery; onChange: (patch: Partial<CatalogQuery>) => void }

export function CatalogToolbar({ search, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div
        role="group"
        aria-label="Seções do catálogo"
        className="flex gap-4 overflow-x-auto md:gap-5"
      >
        {tabs.map((tab) => {
          const active = search.tab === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ tab: tab.value })}
              className={cn(
                'relative shrink-0 pb-1.5 text-sm leading-4 font-bold whitespace-nowrap md:text-[15px] md:font-medium',
                active
                  ? 'text-brand after:bg-brand-strong after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full'
                  : 'text-fg',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="hidden items-center gap-1 text-[15px] leading-5 md:flex">
        <span id="ordenar-label" className="text-fg">
          Ordenar por:
        </span>
        <Select
          value={search.sort}
          onValueChange={(value) => onChange({ sort: value as CatalogSort })}
        >
          <SelectTrigger
            aria-labelledby="ordenar-label"
            className="text-fg h-auto gap-1 border-0 bg-transparent px-1 py-0 text-[15px] shadow-none focus-visible:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(sortLabels) as CatalogSort[]).map((value) => (
              <SelectItem key={value} value={value}>
                {sortLabels[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
