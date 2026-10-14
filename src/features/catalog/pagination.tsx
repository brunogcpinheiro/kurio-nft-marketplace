import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { ArrowRightIcon } from '@/components/icons'

type Props = { page: number; totalPages: number }

const boxClass = 'flex size-[35px] items-center justify-center rounded text-lg leading-4'

function visiblePages(page: number, total: number) {
  const size = 4
  let start = Math.max(1, Math.min(page - 1, total - size + 1))
  const pages: number[] = []
  for (let i = start; i <= Math.min(total, start + size - 1); i += 1) pages.push(i)
  return pages
}

export function Pagination({ page, totalPages }: Props) {
  if (totalPages <= 1) return null
  const pages = visiblePages(page, totalPages)
  return (
    <nav aria-label="Paginação" className="flex justify-end gap-2">
      {pages.map((n) => (
        <Link
          key={n}
          to="/"
          search={(prev) => ({ ...prev, page: n })}
          hash="catalogo"
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Página ${n}`}
          className={cn(
            boxClass,
            n === page
              ? 'bg-brand-strong text-bg font-bold'
              : 'text-fg border-surface-strong border font-normal',
          )}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link
          to="/"
          search={(prev) => ({ ...prev, page: page + 1 })}
          hash="catalogo"
          aria-label="Próxima página"
          className={cn(boxClass, 'text-fg border-surface-strong border')}
        >
          <ArrowRightIcon className="size-[18px]" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(boxClass, 'text-fg-subtle border-surface-strong border opacity-50')}
        >
          <ArrowRightIcon className="size-[18px]" />
        </span>
      )}
    </nav>
  )
}
