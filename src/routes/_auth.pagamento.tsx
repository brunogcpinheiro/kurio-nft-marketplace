import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { errorMessage } from '@/api/errors'
import { ordersApi } from '@/api/endpoints'
import { collectorSchema, type Collector, type Provider, type Quote } from '@/api/schemas'
import { ArrowRightIcon } from '@/components/icons'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStoredSession } from '@/features/auth/session'
import { useCart, useQuote } from '@/features/cart/queries'
import { CollectorForm } from '@/features/checkout/collector-form'
import { StaleQuoteError, useCreateOrder } from '@/features/checkout/queries'
import { ReviewSummary } from '@/features/checkout/review-summary'
import { StaleQuoteDialog } from '@/features/checkout/stale-quote-dialog'
import { useCheckoutDraft } from '@/features/checkout/use-checkout-draft'
import { useWalletConnection } from '@/features/checkout/wallet-connection'
import { WalletPicker } from '@/features/checkout/wallet-picker'
import { useProfile } from '@/features/profile/queries'
import { RealtimeBanner } from '@/features/realtime/realtime-banner'
import { useWallets } from '@/features/wallets/queries'
import { desktopQuery, useMediaQuery } from '@/lib/use-media-query'

export const Route = createFileRoute('/_auth/pagamento')({
  validateSearch: z.object({ step: z.enum(['collector', 'wallet']).optional().catch(undefined) }),
  component: CheckoutPage,
})

function CheckoutPage() {
  const stored = useStoredSession()
  const userId = stored?.userId ?? ''
  const { draft, patch } = useCheckoutDraft(userId)
  const navigate = useNavigate()
  const { step = 'collector' } = Route.useSearch()
  const desktop = useMediaQuery(desktopQuery)
  const cart = useCart()
  const quote = useQuote(true)
  const wallets = useWallets()
  const profile = useProfile()
  const createOrder = useCreateOrder()
  const [staleQuote, setStaleQuote] = useState<Quote | null>(null)
  const [useOtherWallet, setUseOtherWallet] = useState(false)

  const pending = useQuery({
    queryKey: ['orders', userId, draft.pendingOrderId, 'resume'],
    queryFn: () => ordersApi.get(draft.pendingOrderId!),
    enabled: Boolean(draft.pendingOrderId),
    retry: false,
  })

  useEffect(() => {
    if (!pending.data) return
    if (pending.data.status === 'pending')
      void navigate({ to: '/pedido/$orderId', params: { orderId: pending.data.id }, replace: true })
    else patch({ pendingOrderId: null })
  }, [pending.data, navigate, patch])

  useEffect(() => {
    if (pending.isError) patch({ pendingOrderId: null })
  }, [pending.isError, patch])

  const registered = useMemo(
    () =>
      [wallets.data?.primary, wallets.data?.secondary].filter((w): w is NonNullable<typeof w> =>
        Boolean(w),
      ),
    [wallets.data],
  )
  const selectedWallet = registered.find((w) => w.id === draft.walletId) ?? registered[0] ?? null

  const form = useForm<Collector>({
    resolver: zodResolver(collectorSchema),
    defaultValues: {
      displayName: '',
      username: '',
      network: 'ethereum',
      profileName: '',
      address: '',
      secondaryAddress: '',
      provider: 'metamask',
      referralCode: '',
      email: '',
      ensName: '',
      note: '',
      ...draft.form,
    },
  })

  useEffect(() => {
    if (!profile.data) return
    const current = form.getValues()
    const fill = (field: keyof Collector, value: string) => {
      if (!current[field]) form.setValue(field, value)
    }
    fill('displayName', profile.data.displayName)
    fill('username', profile.data.username)
    fill('email', profile.data.email)
    fill('ensName', profile.data.ensName)
    fill('profileName', profile.data.username)
  }, [profile.data, form])

  useEffect(() => {
    if (!selectedWallet || useOtherWallet) return
    form.setValue('address', selectedWallet.address)
    form.setValue('network', selectedWallet.network)
    form.setValue('provider', selectedWallet.provider)
    if (!form.getValues('referralCode')) form.setValue('referralCode', selectedWallet.referralCode)
    if (selectedWallet.secondaryAddress)
      form.setValue('secondaryAddress', selectedWallet.secondaryAddress)
  }, [selectedWallet, useOtherWallet, form])

  useEffect(() => {
    const subscription = form.watch((values) => patch({ form: values as Partial<Collector> }))
    return () => subscription.unsubscribe()
  }, [form, patch])

  const watchedProvider = useWatch({ control: form.control, name: 'provider' })
  const watchedAddress = useWatch({ control: form.control, name: 'address' })
  const provider = draft.provider ?? (watchedProvider as Provider | null)
  const connection = useWalletConnection(draft.connectedProvider, (value) =>
    patch({ connectedProvider: value }),
  )
  const connected = connection.status === 'connected' && draft.connectedProvider === provider

  useEffect(() => {
    if (
      !cart.isPending &&
      cart.data &&
      cart.data.items.length === 0 &&
      !createOrder.isPending &&
      !createOrder.isSuccess
    ) {
      void navigate({ to: '/carrinho', replace: true })
    }
  }, [cart.isPending, cart.data, navigate, createOrder.isPending, createOrder.isSuccess])

  const blockingLine = quote.data?.lines.find((l) => l.availability !== 'ok')

  async function submit(acceptedQuote?: Quote) {
    const valid = await form.trigger()
    if (!valid) {
      toast.error('Confira os campos destacados')
      if (!desktop) void navigate({ to: '/pagamento', search: { step: 'collector' } })
      return
    }
    if (!provider) {
      toast.error('Escolha o provedor da carteira')
      return
    }
    if (!connected) {
      toast.error('Conecte a carteira para confirmar a compra')
      return
    }
    const current = acceptedQuote ?? quote.data
    if (!current) return
    if (blockingLine && !acceptedQuote) {
      toast.error('Há itens indisponíveis no carrinho. Revise antes de continuar.')
      return
    }
    const values = form.getValues()
    const input = {
      quoteId: current.quoteId,
      provider,
      walletId: useOtherWallet ? null : (selectedWallet?.id ?? null),
      network: values.network,
      collector: {
        ...values,
        secondaryAddress: values.secondaryAddress || undefined,
        note: values.note || undefined,
      },
    }
    createOrder.mutate(
      { input, idempotencyKey: draft.idempotencyKey },
      {
        onSuccess: (order) => {
          patch({ pendingOrderId: order.id })
          void navigate({ to: '/pedido/$orderId', params: { orderId: order.id }, replace: true })
        },
        onError: (error) => {
          if (error instanceof StaleQuoteError) {
            setStaleQuote(error.quote)
            return
          }
          toast.error('Não foi possível enviar o pedido', { description: errorMessage(error) })
        },
      },
    )
  }

  function acceptNewQuote() {
    const accepted = staleQuote
    setStaleQuote(null)
    if (!accepted) return
    patch({ idempotencyKey: crypto.randomUUID() })
    void quote.refetch()
    void submit(accepted)
  }

  const loading = cart.isPending || quote.isPending || wallets.isPending || profile.isPending
  const submitting = createOrder.isPending
  const canSubmit = !loading && !submitting && !!quote.data && quote.data.lines.length > 0

  const walletPicker = (variant: 'desktop' | 'mobile') => (
    <WalletPicker
      variant={variant}
      wallets={registered}
      walletId={selectedWallet?.id ?? null}
      onWallet={(id) => patch({ walletId: id })}
      provider={provider}
      onProvider={(value) => {
        patch({ provider: value })
        form.setValue('provider', value)
        if (draft.connectedProvider && draft.connectedProvider !== value) connection.disconnect()
      }}
      status={
        connected ? 'connected' : connection.status === 'connected' ? 'idle' : connection.status
      }
      onConnect={() => provider && void connection.connect(provider)}
      onDisconnect={connection.disconnect}
      address={selectedWallet && !useOtherWallet ? selectedWallet.address : watchedAddress}
    />
  )

  return (
    <SiteLayout bottomNav={false}>
      <PageContainer className="pt-8 md:pt-8">
        <StaleQuoteDialog
          previous={quote.data ?? null}
          next={staleQuote}
          onReview={() => void navigate({ to: '/carrinho' })}
          onAccept={acceptNewQuote}
          onClose={() => setStaleQuote(null)}
        />

        {desktop ? (
          <div>
            <nav
              aria-label="Trilha de navegação"
              className="text-fg text-[15px] leading-4 font-bold"
            >
              <Link to="/">Início</Link> /{' '}
              <Link to="/" hash="catalogo">
                Mercado
              </Link>{' '}
              / <span aria-current="page">Pagamento</span>
            </nav>
            <RealtimeBanner className="mt-4" />
            <form
              className="mt-6 grid gap-8 lg:grid-cols-[1fr_405px] lg:gap-8"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                void submit()
              }}
              aria-busy={submitting}
            >
              {loading ? (
                <div className="flex flex-col gap-6" aria-label="Carregando checkout">
                  <Skeleton className="h-4 w-56" />
                  <div className="grid gap-6 md:grid-cols-2">
                    {Array.from({ length: 8 }, (_, i) => (
                      <Skeleton key={i} className="h-[69px]" />
                    ))}
                  </div>
                </div>
              ) : (
                <CollectorForm
                  form={form}
                  wallets={registered}
                  useOtherWallet={useOtherWallet}
                  onUseOtherWallet={setUseOtherWallet}
                />
              )}
              <div className="flex flex-col gap-6">
                <ReviewSummary
                  quote={quote.data}
                  refreshing={quote.isFetching && !quote.isPending}
                />
                {walletPicker('desktop')}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-[45px] rounded-lg text-[15px] font-bold"
                  data-testid="checkout-submit"
                >
                  {submitting ? 'Enviando pedido…' : 'Confirmar compra'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() =>
                  step === 'wallet'
                    ? void navigate({ to: '/pagamento', search: { step: 'collector' } })
                    : window.history.back()
                }
                aria-label="Voltar"
                className="bg-surface border-surface-strong text-fg-muted flex size-[35px] shrink-0 items-center justify-center rounded-full border"
              >
                <ArrowRightIcon className="size-5 rotate-180" />
              </button>
              <h1 className="text-fg text-xl leading-4 font-bold">
                {step === 'wallet' ? 'Pagamento com carteira' : 'Dados do colecionador'}
              </h1>
            </div>
            <RealtimeBanner className="mt-4" />
            {step === 'collector' ? (
              <form
                className="mt-6 flex flex-col gap-6 pb-10"
                noValidate
                onSubmit={async (event) => {
                  event.preventDefault()
                  if (await form.trigger())
                    void navigate({ to: '/pagamento', search: { step: 'wallet' } })
                  else toast.error('Confira os campos destacados')
                }}
              >
                {loading ? (
                  <Skeleton className="h-[600px]" />
                ) : (
                  <CollectorForm
                    form={form}
                    wallets={registered}
                    useOtherWallet={useOtherWallet}
                    onUseOtherWallet={setUseOtherWallet}
                  />
                )}
                <ReviewSummary
                  quote={quote.data}
                  refreshing={quote.isFetching && !quote.isPending}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-[60px] rounded-full text-base font-bold"
                >
                  Continuar
                </Button>
              </form>
            ) : (
              <form
                className="mt-6 flex flex-col gap-6 pb-10"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  void submit()
                }}
                aria-busy={submitting}
              >
                {walletPicker('mobile')}
                <div className="flex items-center justify-end gap-7">
                  <span className="text-fg text-base leading-4 font-bold">Total:</span>
                  <span
                    className="text-brand text-lg leading-4 font-bold"
                    data-testid="checkout-total-mobile"
                  >
                    {quote.data ? `${quote.data.total} ETH` : '—'}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-[60px] rounded-full text-[15px] font-bold"
                  data-testid="checkout-submit-mobile"
                >
                  {submitting ? 'Enviando pedido…' : 'Confirmar compra'}
                </Button>
              </form>
            )}
          </div>
        )}
      </PageContainer>
    </SiteLayout>
  )
}
