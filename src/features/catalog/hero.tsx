import { Link } from '@tanstack/react-router'
import type { HomeContent } from '@/api/schemas'
import { ArrowRightIcon } from '@/components/icons'
import { NftImage } from '@/components/nft-image'
import { Skeleton } from '@/components/ui/skeleton'

export function Hero({ content }: { content?: HomeContent['hero'] }) {
  if (!content) return <HeroSkeleton />
  return (
    <section aria-labelledby="hero-title" className="mt-4 md:mt-8">
      <div className="hidden h-[450px] grid-cols-[1fr_450px] gap-[110px] pl-10 md:grid">
        <div className="flex flex-col justify-between py-[43px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-fg text-sm font-medium tracking-[1.4px]">{content.eyebrow}</p>
              <h1
                id="hero-title"
                className="text-fg text-[43px] leading-[70px] font-bold whitespace-pre-line uppercase"
              >
                {content.title}
              </h1>
            </div>
            <p className="text-fg-muted max-w-[557px] text-sm leading-6">{content.description}</p>
            <Link
              to="/"
              hash="catalogo"
              className="bg-brand-strong text-bg flex h-10 w-[140px] items-center justify-center rounded-md text-base font-bold uppercase"
            >
              {content.cta}
            </Link>
          </div>
          <div className="flex justify-end gap-2 pr-0" aria-hidden="true">
            <span className="bg-brand-strong size-2 rounded-full" />
            <span className="bg-brand-strong size-2 rounded-full" />
            <span className="bg-brand-strong size-2 rounded-full" />
          </div>
        </div>
        <NftImage
          imageKey={content.imageKey}
          name="destaque Kurio"
          base={900}
          priority
          sizes="450px"
          className="size-[450px] rounded-3xl object-cover"
          width={450}
          height={450}
        />
      </div>

      <div className="bg-surface relative h-[190px] overflow-hidden rounded-xl p-4 md:hidden">
        <span
          aria-hidden="true"
          className="bg-surface-strong/60 absolute -top-8 -left-20 size-[248px] rounded-full"
        />
        <span
          aria-hidden="true"
          className="bg-surface-strong/40 absolute top-[-10px] left-[73px] size-[248px] rounded-full"
        />
        <div className="relative flex h-full gap-2">
          <div className="flex w-[188px] flex-col justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="text-fg text-xs font-medium">{content.eyebrow}</p>
              <h1 className="text-fg text-lg leading-[29px] font-bold whitespace-pre-line uppercase">
                {content.mobileTitle}
              </h1>
              <p className="text-fg-muted text-xs leading-[18px]">{content.mobileDescription}</p>
            </div>
            <Link
              to="/"
              hash="catalogo"
              className="text-brand flex items-center gap-2 text-xs font-bold uppercase"
            >
              {content.cta}
              <ArrowRightIcon className="text-brand-strong size-4" />
            </Link>
          </div>
          <div className="relative ml-auto w-[138px]">
            <NftImage
              imageKey={content.imageKey}
              name="destaque Kurio"
              base={320}
              priority
              sizes="138px"
              className="size-[138px] rounded-2xl object-cover"
              width={138}
              height={138}
            />
            <NftImage
              imageKey="sage"
              name="destaque secundário"
              base={160}
              sizes="58px"
              className="absolute top-[88px] left-[14px] size-[58px] rounded-2xl object-cover"
              width={58}
              height={58}
            />
          </div>
        </div>
        <div
          className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1.5"
          aria-hidden="true"
        >
          <span className="bg-brand-strong size-[7px] rounded-full" />
          <span className="bg-brand-strong size-[7px] rounded-full" />
          <span className="bg-brand-strong size-[7px] rounded-full" />
        </div>
      </div>
    </section>
  )
}

function HeroSkeleton() {
  return (
    <section className="mt-4 md:mt-8" aria-busy="true" aria-label="Carregando destaque">
      <div className="hidden h-[450px] grid-cols-[1fr_450px] gap-[110px] pl-10 md:grid">
        <div className="flex flex-col gap-8 py-[43px]">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-[140px] w-full" />
          <Skeleton className="h-12 w-[557px] max-w-full" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <Skeleton className="size-[450px] rounded-3xl" />
      </div>
      <Skeleton className="h-[190px] rounded-xl md:hidden" />
    </section>
  )
}
