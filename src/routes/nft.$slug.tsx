import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { cn } from 'cn'
import type { Nft } from '@/api/schemas'
import { networkLabels } from '@/api/schemas'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import {
  ArrowRightIcon,
  ShareLinkedinIcon,
  ShareMailIcon,
  ShareTwitterIcon,
  ShopIcon,
} from '@/components/icons'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'
import { OutOfScopeLink } from '@/components/out-of-scope-link'
import { Price } from '@/components/price'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddToCart } from '@/features/cart/mutations'
import { EditionPicker } from '@/features/nft/edition-picker'
import { FavoriteButton } from '@/features/nft/favorite-button'
import { Gallery } from '@/features/nft/gallery'
import { nftQueries } from '@/features/nft/queries'
import { QuantityStepper } from '@/features/nft/quantity-stepper'
import { Rating } from '@/features/nft/rating'
import { RelatedNfts } from '@/features/nft/related'
import { shortHash } from '@/lib/format'
import { desktopQuery, useMediaQuery } from '@/lib/use-media-query'

export const Route = createFileRoute('/nft/$slug')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(nftQueries.detail(params.slug))
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) throw notFound()
    }
  },
  component: NftPage,
  pendingComponent: NftPageSkeleton,
  notFoundComponent: NftNotFound,
})

function NftNotFound() {
  return (
    <SiteLayout>
      <PageContainer className="py-16">
        <EmptyState
          title="NFT não encontrado"
          description="Este item pode ter sido removido ou o endereço está incorreto."
          action={
            <Button asChild className="mt-2">
              <Link to="/">Voltar ao catálogo</Link>
            </Button>
          }
        />
      </PageContainer>
    </SiteLayout>
  )
}

function NftPageSkeleton() {
  return (
    <SiteLayout>
      <PageContainer className="pt-8" aria-busy="true">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 grid gap-8 md:grid-cols-[573px_1fr]">
          <div className="flex gap-7">
            <div className="hidden flex-col gap-4 md:flex">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="size-[100px] rounded-lg" />
              ))}
            </div>
            <Skeleton className="aspect-square flex-1 rounded-md md:size-[444px] md:flex-none" />
          </div>
          <div className="flex flex-col gap-5">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-20 w-80" />
          </div>
        </div>
      </PageContainer>
    </SiteLayout>
  )
}

function NftPage() {
  const { slug } = Route.useParams()
  const query = useQuery(nftQueries.detail(slug))
  if (query.isPending) return <NftPageSkeleton />
  if (!query.data) {
    return (
      <SiteLayout>
        <PageContainer className="py-16">
          <ErrorState
            title="Não foi possível carregar o NFT"
            error={query.error}
            onRetry={() => void query.refetch()}
            retrying={query.isFetching}
          />
        </PageContainer>
      </SiteLayout>
    )
  }
  return <NftDetail key={query.data.id} nft={query.data} />
}

function NftDetail({ nft }: { nft: Nft }) {
  const firstAvailable =
    nft.editions.find((e) => e.id === 'e50' && e.available > 0) ??
    nft.editions.find((e) => e.available > 0) ??
    nft.editions[0]
  const [editionId, setEditionId] = useState(firstAvailable?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<'details' | 'reviews'>('details')
  const edition = nft.editions.find((e) => e.id === editionId) ?? firstAvailable
  const max = Math.max(1, edition?.available ?? 1)
  const soldOut = !edition || edition.available === 0
  const addToCart = useAddToCart()
  const navigate = useNavigate()
  const desktop = useMediaQuery(desktopQuery)

  function selectEdition(id: string) {
    setEditionId(id)
    const next = nft.editions.find((e) => e.id === id)
    setQuantity((q) => Math.min(q, Math.max(1, next?.available ?? 1)))
  }

  function buy() {
    if (!edition || soldOut) return
    addToCart.mutate(
      { nftId: nft.id, editionId: edition.id, quantity },
      { onSuccess: () => void navigate({ to: '/carrinho' }) },
    )
  }

  const network = networkLabels[nft.network]

  return (
    <SiteLayout bottomNav={false} footer={desktop}>
      <PageContainer className="pt-0 md:pt-8">
        <div className="hidden md:block">
          <nav aria-label="Trilha de navegação" className="text-fg text-[15px] leading-4 font-bold">
            <Link to="/">Início</Link> /{' '}
            <Link to="/" hash="catalogo">
              Mercado
            </Link>
          </nav>
          <div className="mt-3 grid gap-8 lg:grid-cols-[573px_1fr]">
            <Gallery nft={nft} />
            <div className="flex flex-col gap-5">
              <div className="border-brand-strong/30 flex flex-col gap-3 border-b pb-3">
                <h1 className="text-fg text-[28px] leading-[37px] font-bold">{nft.name}</h1>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Price
                    value={edition?.price ?? nft.price}
                    previous={edition?.id === 'e50' ? nft.previousPrice : null}
                    className="text-[22px] leading-4"
                  />
                  <Rating average={nft.rating.average} count={nft.rating.count} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-fg text-[15px] leading-4 font-bold">Sobre este NFT:</h2>
                <p className="text-fg-muted text-sm leading-6">{nft.description}</p>
              </div>
              <EditionPicker
                editions={nft.editions}
                value={edition?.id ?? ''}
                onChange={selectEdition}
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <QuantityStepper
                    value={quantity}
                    max={max}
                    onChange={setQuantity}
                    disabled={soldOut}
                  />
                  {!soldOut && quantity >= max ? (
                    <p className="text-fg-subtle text-xs" role="status">
                      Máximo de {max} {max === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={buy}
                    disabled={soldOut || addToCart.isPending}
                    className="h-10 w-[130px] text-sm font-bold uppercase"
                  >
                    {soldOut ? 'Esgotado' : addToCart.isPending ? 'Adicionando…' : 'Comprar'}
                  </Button>
                  <FavoriteButton nft={nft} />
                </div>
              </div>
              <dl className="text-fg-subtle flex flex-col gap-3 text-[15px] leading-5">
                <div className="flex gap-1">
                  <dt>ID do token:</dt>
                  <dd>#{nft.tokenId}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>Coleção:</dt>
                  <dd>{nft.collection}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>Atributos:</dt>
                  <dd>{nft.attributes.join(', ')}</dd>
                </div>
              </dl>
              <div className="text-fg flex items-center gap-2 text-[15px] leading-4 font-bold">
                Compartilhar este NFT:
                <OutOfScopeLink
                  label="Compartilhar no LinkedIn"
                  aria-label="Compartilhar no LinkedIn"
                >
                  <ShareLinkedinIcon className="size-4" />
                </OutOfScopeLink>
                <OutOfScopeLink
                  label="Compartilhar por e-mail"
                  aria-label="Compartilhar por e-mail"
                >
                  <ShareMailIcon className="size-[18px]" />
                </OutOfScopeLink>
                <OutOfScopeLink
                  label="Compartilhar no Twitter"
                  aria-label="Compartilhar no Twitter"
                >
                  <ShareTwitterIcon className="size-4" />
                </OutOfScopeLink>
              </div>
            </div>
          </div>

          <section className="mt-24" aria-label="Informações do NFT">
            <div
              role="tablist"
              aria-label="Informações"
              className="border-brand-strong/30 flex gap-8 border-b"
            >
              {(
                [
                  ['details', 'Detalhes do NFT'],
                  ['reviews', `Avaliações de colecionadores (${nft.rating.count})`],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  id={`tab-${value}`}
                  aria-selected={tab === value}
                  aria-controls={`panel-${value}`}
                  onClick={() => setTab(value)}
                  className={cn(
                    'relative pb-3 text-base leading-4 font-bold',
                    tab === value
                      ? 'text-brand after:bg-brand-strong after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full'
                      : 'text-fg',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              id="panel-details"
              role="tabpanel"
              aria-labelledby="tab-details"
              hidden={tab !== 'details'}
              className="text-fg-muted mt-4 flex flex-col gap-3 text-sm leading-6"
            >
              <p className="whitespace-pre-line">{nft.longDescription}</p>
              <div>
                <p className="text-fg font-bold">Rede:</p>
                <p>
                  Cunhado na {network} com procedência imutável e metadados armazenados no IPFS.
                </p>
              </div>
              <div>
                <p className="text-fg font-bold">Contrato:</p>
                <p>
                  Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente
                  pelos mercados compatíveis.
                </p>
              </div>
              <div>
                <p className="text-fg font-bold">Direitos autorais:</p>
                <p>{shortHash(nft.contract)} • Contrato inteligente ERC-721 verificado.</p>
              </div>
            </div>
            <div
              id="panel-reviews"
              role="tabpanel"
              aria-labelledby="tab-reviews"
              hidden={tab !== 'reviews'}
              className="text-fg-muted mt-4 text-sm leading-6"
            >
              <p>
                {nft.rating.count} colecionadores avaliaram este NFT com média{' '}
                {nft.rating.average.toFixed(1)} de 5. As avaliações individuais ficam disponíveis
                após a compra.
              </p>
            </div>
          </section>

          <div className="mt-24">
            <RelatedNfts slug={nft.slug} title="Mais desta coleção" />
          </div>
        </div>

        <div className="md:hidden">
          <div className="-mx-4 px-7 pt-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.history.back()}
                aria-label="Voltar"
                className="bg-surface border-surface-strong text-fg-muted flex size-[35px] items-center justify-center rounded-full border"
              >
                <ArrowRightIcon className="size-[18px] rotate-180" />
              </button>
              <FavoriteButton nft={nft} variant="icon" />
            </div>
            <img
              src={`/nfts/${nft.imageKey}-640.webp`}
              srcSet={`/nfts/${nft.imageKey}-640.webp 640w, /nfts/${nft.imageKey}-900.webp 900w`}
              sizes="90vw"
              alt={`Arte do NFT ${nft.name}`}
              className="mt-2 aspect-[361/356] w-full rounded-3xl object-cover"
              fetchPriority="high"
              width={361}
              height={356}
            />
          </div>
          <div className="bg-bg-elevated relative z-10 -mx-4 -mt-[30px] flex flex-col gap-3 rounded-t-[31px] px-6 pt-8 pb-44">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-fg text-xl leading-5 font-bold">{nft.name}</h1>
              <Rating average={nft.rating.average} count={nft.rating.count} compact />
            </div>
            <p className="text-fg-muted text-sm leading-6">{nft.description}</p>
            <EditionPicker
              editions={nft.editions}
              value={edition?.id ?? ''}
              onChange={selectEdition}
            />
            <dl className="text-fg-subtle flex flex-col gap-3 text-[15px] leading-5">
              <div className="flex gap-1">
                <dt>ID do token:</dt>
                <dd>#{nft.tokenId}</dd>
              </div>
              <div className="flex gap-1">
                <dt>Coleção:</dt>
                <dd>{nft.collection}</dd>
              </div>
              <div className="flex gap-1">
                <dt>Atributos:</dt>
                <dd>{nft.attributes.join(', ')}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <RelatedNfts slug={nft.slug} title="Mais desta coleção" />
            </div>
          </div>
          <div className="bg-bg-elevated fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] rounded-t-[40px] px-6 pt-5 pb-9 shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-fg-muted text-[15px] font-medium">Qtd.</span>
                <QuantityStepper
                  value={quantity}
                  max={max}
                  onChange={setQuantity}
                  disabled={soldOut}
                  size="sm"
                />
              </div>
              <Price value={edition?.price ?? nft.price} className="text-xl leading-4" />
            </div>
            {!soldOut && quantity >= max ? (
              <p className="text-fg-subtle mt-2 text-xs" role="status">
                Máximo de {max} {max === 1 ? 'unidade disponível' : 'unidades disponíveis'}
              </p>
            ) : null}
            <div className="mt-5 flex gap-3">
              <Button
                onClick={buy}
                disabled={soldOut || addToCart.isPending}
                className="h-[60px] w-[196px] rounded-full text-base font-bold"
              >
                {soldOut ? 'Esgotado' : 'Comprar NFT'}
              </Button>
              <Link
                to="/carrinho"
                aria-label="Ir para o carrinho"
                className="bg-surface border-surface-strong text-fg-subtle flex size-[60px] items-center justify-center rounded-full border"
              >
                <ShopIcon className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </SiteLayout>
  )
}
