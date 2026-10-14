import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import type { HomeContent } from '@/api/schemas'
import { ArrowRightIcon } from '@/components/icons'
import { NftImage } from '@/components/nft-image'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/lib/use-media-query'

type Slide = HomeContent['slides'][number]

const intervalMs = 4500
const fallbackSlides: Slide[] = []

function useCarousel(count: number) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(timer)
  }, [count, paused, reducedMotion])

  return {
    index: count ? index % count : 0,
    select: setIndex,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  }
}

function Dots({
  count,
  index,
  onSelect,
  dotClass,
  className,
}: {
  count: number
  index: number
  onSelect: (index: number) => void
  dotClass: string
  className?: string
}) {
  return (
    <div
      className={cn('flex justify-center', className)}
      role="group"
      aria-label="Slides do destaque"
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ir para o slide ${i + 1}`}
          aria-current={index === i}
          onClick={() => onSelect(i)}
          className="flex size-6 items-center justify-center"
        >
          <span
            aria-hidden="true"
            className={cn(
              'border-brand-strong block rounded-full border',
              dotClass,
              index === i && 'bg-brand-strong',
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function Hero({ slides }: { slides?: HomeContent['slides'] }) {
  const items = slides ?? fallbackSlides
  const carousel = useCarousel(items.length)
  const slide = items[carousel.index]
  const next = items[(carousel.index + 1) % Math.max(1, items.length)]

  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription="carrossel"
      aria-busy={!slides}
      className="mt-4 md:mt-8"
      onMouseEnter={carousel.pause}
      onMouseLeave={carousel.resume}
      onFocus={carousel.pause}
      onBlur={carousel.resume}
    >
      <div className="hidden h-[450px] grid-cols-[1fr_450px] gap-[110px] md:grid">
        <div className="flex flex-col justify-between py-[43px]">
          {slide ? (
            <div
              key={carousel.index}
              className="animate-in fade-in flex flex-col gap-8 duration-500"
            >
              <div className="flex flex-col gap-2">
                <p className="text-fg text-sm font-medium tracking-[1.4px]">{slide.eyebrow}</p>
                <h1
                  id="hero-title"
                  className="text-fg text-[43px] leading-[70px] font-bold whitespace-pre-line uppercase"
                >
                  {slide.title}
                </h1>
              </div>
              <p className="text-fg-muted max-w-[557px] text-sm leading-6">{slide.description}</p>
              <Link
                to="/"
                hash="catalogo"
                className="bg-brand-strong text-bg flex h-10 w-[140px] items-center justify-center rounded-md text-base font-bold uppercase"
              >
                {slide.cta}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <h1 id="hero-title" className="sr-only">
                  Kurio
                </h1>
                <Skeleton className="h-[140px] w-full" />
              </div>
              <Skeleton className="h-12 w-[557px] max-w-full" />
              <Skeleton className="h-10 w-[140px]" />
            </div>
          )}
        </div>
        <div className="relative size-[450px]">
          {items.map((item, i) => (
            <NftImage
              key={item.imageKey}
              imageKey={item.imageKey}
              name={`destaque ${i + 1}`}
              base={900}
              priority={i === 0}
              sizes="450px"
              aria-hidden={i !== carousel.index}
              className={cn(
                'absolute inset-0 size-[450px] rounded-3xl object-cover transition-opacity duration-500',
                i === carousel.index ? 'opacity-100' : 'opacity-0',
              )}
              width={450}
              height={450}
            />
          ))}
        </div>
      </div>
      {items.length > 1 ? (
        <Dots
          count={items.length}
          index={carousel.index}
          onSelect={carousel.select}
          dotClass="size-2"
          className="mt-4 hidden md:flex"
        />
      ) : null}

      <div className="bg-surface relative h-[190px] overflow-hidden rounded-[30px] p-4 md:hidden">
        <span
          aria-hidden="true"
          className="absolute -top-8 -left-20 size-[248px] rounded-full bg-[linear-gradient(160deg,rgba(221,154,95,0.43),rgba(210,138,76,0.04))]"
        />
        <span
          aria-hidden="true"
          className="absolute top-[-10px] left-[73px] size-[248px] rounded-full bg-[linear-gradient(160deg,rgba(221,154,95,0.37),rgba(210,138,76,0))]"
        />
        <div className="relative flex h-full gap-2">
          <div className="flex w-[188px] flex-col justify-between">
            {slide ? (
              <div
                key={carousel.index}
                className="animate-in fade-in flex flex-col gap-1.5 duration-500"
              >
                <p className="text-fg text-xs font-medium">{slide.eyebrow}</p>
                <h1 className="text-fg text-lg leading-[29px] font-bold whitespace-pre-line uppercase">
                  {slide.mobileTitle}
                </h1>
                <p className="text-fg-muted text-xs leading-[18px]">{slide.mobileDescription}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            )}
            {slide ? (
              <Link
                to="/"
                hash="catalogo"
                className="text-brand flex items-center gap-2 text-xs font-bold uppercase"
              >
                {slide.cta}
                <ArrowRightIcon className="text-brand-strong size-4" />
              </Link>
            ) : (
              <Skeleton className="h-3 w-20" />
            )}
          </div>
          <div className="relative ml-auto w-[138px]">
            {items.map((item, i) => (
              <NftImage
                key={item.imageKey}
                imageKey={item.imageKey}
                name={`destaque ${i + 1}`}
                base={320}
                priority={i === 0}
                sizes="138px"
                aria-hidden={i !== carousel.index}
                className={cn(
                  'absolute top-0 left-0 size-[138px] rounded-2xl object-cover transition-opacity duration-500',
                  i === carousel.index ? 'opacity-100' : 'opacity-0',
                )}
                width={138}
                height={138}
              />
            ))}
            {next ? (
              <NftImage
                imageKey={next.imageKey}
                name="próximo destaque"
                base={160}
                sizes="58px"
                className="absolute top-[88px] left-[14px] size-[58px] rounded-2xl object-cover"
                width={58}
                height={58}
              />
            ) : null}
          </div>
        </div>
        {items.length > 1 ? (
          <Dots
            count={items.length}
            index={carousel.index}
            onSelect={carousel.select}
            dotClass="size-[7px]"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 gap-0"
          />
        ) : null}
      </div>
    </section>
  )
}
