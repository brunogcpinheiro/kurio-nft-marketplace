import { Link } from '@tanstack/react-router'
import type { HomeContent } from '@/api/schemas'
import { ArrowRightIcon } from '@/components/icons'
import { NftImage } from '@/components/nft-image'
import { Skeleton } from '@/components/ui/skeleton'

export function Promos({ promos }: { promos?: HomeContent['promos'] }) {
  if (!promos) {
    return (
      <div className="grid gap-7 md:grid-cols-2" aria-busy="true">
        <Skeleton className="h-[250px] rounded-lg" />
        <Skeleton className="h-[250px] rounded-lg" />
      </div>
    )
  }
  return (
    <section aria-labelledby="promos-title" className="grid gap-7 md:grid-cols-2">
      <h2 id="promos-title" className="sr-only">
        Promoções
      </h2>
      {promos.map((promo) => (
        <article
          key={promo.id}
          className="bg-bg-elevated relative flex min-h-[250px] overflow-hidden rounded-lg"
        >
          <span
            aria-hidden="true"
            className="border-brand-strong absolute top-[142px] -left-[191px] size-64 rounded-full border-2"
          />
          <span
            aria-hidden="true"
            className="border-brand-strong absolute top-[134px] -left-[199px] size-64 rounded-full border"
          />
          <NftImage
            imageKey={promo.imageKey}
            name={promo.title.replace('\n', ' ')}
            base={320}
            sizes="292px"
            className="w-[40%] shrink-0 self-stretch rounded-[18px] object-cover md:w-[292px]"
            width={292}
            height={250}
          />
          <div className="relative flex flex-1 flex-col items-end justify-center px-4 py-7 text-right md:px-[30px]">
            <h3 className="text-fg text-base leading-6 font-bold whitespace-pre-line md:text-lg">
              {promo.title}
            </h3>
            <p className="text-fg-muted mt-2 max-w-[263px] text-xs leading-5 md:text-sm md:leading-6">
              {promo.description}
            </p>
            <Link
              to="/"
              hash="catalogo"
              className="bg-brand-strong text-bg mt-6 flex h-10 w-[140px] items-center justify-center gap-1 rounded-md text-sm font-bold"
            >
              {promo.cta}
              <ArrowRightIcon className="size-[18px]" />
            </Link>
          </div>
        </article>
      ))}
    </section>
  )
}
