import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { ArrowRightIcon } from '@/components/icons'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'
import { Button } from '@/components/ui/button'
import { session } from '@/features/auth/session'
import { CartItems, CartItemsSkeleton } from '@/features/cart/cart-items'
import { CartSummary } from '@/features/cart/cart-summary'
import { useCart, useQuote } from '@/features/cart/queries'
import { RelatedNfts } from '@/features/nft/related'
import { RealtimeBanner } from '@/features/realtime/realtime-banner'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

function CartPage() {
  const cart = useCart()
  const hasItems = (cart.data?.items.length ?? 0) > 0
  const quote = useQuote(hasItems)
  const navigate = useNavigate()
  const canCheckout =
    hasItems &&
    !!quote.data &&
    quote.data.lines.every((l) => l.availability !== 'sold_out') &&
    quote.data.lines.length > 0

  function checkout() {
    if (!session.get()) {
      void navigate({ to: '/login', search: { redirect: '/pagamento' } })
      return
    }
    void navigate({ to: '/pagamento' })
  }

  const empty = cart.data && !hasItems
  const firstSlug = cart.data?.items[0]?.nft.slug

  return (
    <SiteLayout bottomNav={!hasItems}>
      <PageContainer className="pt-8 md:pt-8">
        <div className="hidden md:block">
          <nav aria-label="Trilha de navegação" className="text-fg text-[15px] leading-4 font-bold">
            <Link to="/">Início</Link> /{' '}
            <Link to="/" hash="catalogo">
              Mercado
            </Link>{' '}
            / <span aria-current="page">Carrinho</span>
          </nav>
          <RealtimeBanner className="mt-4" />
          <div className="mt-3 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-[86px]">
            <div className="min-w-0 flex-1">
              {cart.isPending ? (
                <CartItemsSkeleton variant="desktop" />
              ) : cart.isError ? (
                <ErrorState
                  title="Não foi possível carregar o carrinho"
                  error={cart.error}
                  onRetry={() => void cart.refetch()}
                  retrying={cart.isFetching}
                />
              ) : empty ? (
                <EmptyState
                  title="Seu carrinho está vazio"
                  description="Explore o catálogo e adicione NFTs para montar sua coleção."
                  action={
                    <Button asChild className="mt-2">
                      <Link to="/" hash="catalogo">
                        Explorar catálogo
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <CartItems cart={cart.data!} quote={quote.data} variant="desktop" />
              )}
            </div>
            {!empty ? (
              <CartSummary
                quote={quote.data}
                couponCode={cart.data?.couponCode ?? null}
                loading={cart.isPending || (hasItems && quote.isPending)}
                refreshing={quote.isFetching && !quote.isPending}
                variant="desktop"
                canCheckout={canCheckout}
                onCheckout={checkout}
              />
            ) : null}
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center gap-14">
            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="Voltar"
              className="bg-surface border-surface-strong text-fg-muted flex size-[35px] shrink-0 items-center justify-center rounded-full border"
            >
              <ArrowRightIcon className="size-5 rotate-180" />
            </button>
            <h1 className="text-fg text-xl leading-4 font-bold">Carrinho de NFTs</h1>
          </div>
          <RealtimeBanner className="mt-4" />
          <div className="mt-6 pb-[380px]">
            {cart.isPending ? (
              <CartItemsSkeleton variant="mobile" />
            ) : cart.isError ? (
              <ErrorState
                title="Não foi possível carregar o carrinho"
                error={cart.error}
                onRetry={() => void cart.refetch()}
                retrying={cart.isFetching}
              />
            ) : empty ? (
              <EmptyState
                title="Seu carrinho está vazio"
                description="Explore o catálogo e adicione NFTs para montar sua coleção."
                action={
                  <Button asChild className="mt-2">
                    <Link to="/" hash="catalogo">
                      Explorar catálogo
                    </Link>
                  </Button>
                }
              />
            ) : (
              <CartItems cart={cart.data!} quote={quote.data} variant="mobile" />
            )}
          </div>
          {!empty ? (
            <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
              <CartSummary
                quote={quote.data}
                couponCode={cart.data?.couponCode ?? null}
                loading={cart.isPending || (hasItems && quote.isPending)}
                refreshing={quote.isFetching && !quote.isPending}
                variant="mobile"
                canCheckout={canCheckout}
                onCheckout={checkout}
              />
            </div>
          ) : null}
        </div>

        {firstSlug ? (
          <div className="mt-24 hidden md:block">
            <RelatedNfts slug={firstSlug} title="Colecionadores também viram" />
          </div>
        ) : null}
      </PageContainer>
    </SiteLayout>
  )
}
