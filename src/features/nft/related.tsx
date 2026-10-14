import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from 'cn'
import { Link } from '@tanstack/react-router'
import type { NftSummary } from '@/api/schemas'
import { NftImage } from '@/components/nft-image'
import { Price } from '@/components/price'
import { Skeleton } from '@/components/ui/skeleton'
import { nftQueries } from './queries'

type Props = { slug: string; title: string }

export function RelatedNfts({ slug, title }: Props) {
  const query = useQuery(nftQueries.related(slug))
  const items = query.data?.items ?? []
  const scroller = useRef<HTMLUListElement>(null)
  const [page, setPage] = useState(0)
  const perPage = 5
  const pages = Math.max(1, Math.ceil(items.length / perPage))

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onScroll = () => setPage(Math.round(el.scrollLeft / el.clientWidth))
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [items.length])

  if (!query.isPending && items.length === 0) return null

  return (
    <section aria-labelledby="relacionados" className="flex flex-col gap-8">
      <div className="border-brand-strong/30 flex flex-col gap-3 border-b pb-3">
        <h2 id="relacionados" className="text-brand text-[17px] leading-4 font-bold">
          {title}
        </h2>
      </div>
      <ul
        ref={scroller}
        className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:gap-7 md:px-0 [&::-webkit-scrollbar]:hidden"
        aria-label={title}
      >
        {query.isPending
          ? Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="w-[160px] shrink-0 snap-start md:w-[219px]">
                <Skeleton className="h-[200px] md:h-[255px]" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </li>
            ))
          : items.map((nft) => <RelatedCard key={nft.id} nft={nft} />)}
      </ul>
      {pages > 1 ? (
        <div className="flex justify-center gap-2" role="group" aria-label="Páginas do carrossel">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para o grupo ${i + 1}`}
              aria-current={page === i}
              onClick={() =>
                scroller.current?.scrollTo({
                  left: i * (scroller.current?.clientWidth ?? 0),
                  behavior: 'smooth',
                })
              }
              className={cn(
                'border-brand-strong size-3 rounded-full border',
                page === i && 'bg-brand-strong',
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function RelatedCard({ nft }: { nft: NftSummary }) {
  return (
    <li className="w-[160px] shrink-0 snap-start md:w-[219px]">
      <Link
        to="/nft/$slug"
        params={{ slug: nft.slug }}
        className="flex flex-col gap-3"
        aria-label={`${nft.name}, ${nft.price} ETH`}
      >
        <div className="bg-bg-elevated h-[200px] px-3 py-1 md:h-[255px] md:py-1 md:pr-3 md:pl-5">
          <NftImage
            imageKey={nft.imageKey}
            name={nft.name}
            base={320}
            sizes="(min-width: 768px) 190px, 140px"
            className="size-full rounded-[11px] object-cover"
            width={190}
            height={243}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-fg text-[15px] leading-5">{nft.name}</span>
          <Price
            value={nft.price}
            previous={nft.previousPrice}
            className="text-base leading-4"
            previousClassName="text-sm"
          />
        </div>
      </Link>
    </li>
  )
}
