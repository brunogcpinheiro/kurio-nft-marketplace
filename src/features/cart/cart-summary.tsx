import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import type { Quote } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CouponForm } from './coupon-form'

type Props = {
  quote?: Quote
  couponCode: string | null
  loading: boolean
  refreshing: boolean
  variant: 'desktop' | 'mobile'
  canCheckout: boolean
  checkoutLabel?: string
  onCheckout?: () => void
}

function discountLabel(value: string) {
  return value === '0.00' ? '(-) 00.00' : `(-) ${value} ETH`
}

export function CartSummary({
  quote,
  couponCode,
  loading,
  refreshing,
  variant,
  canCheckout,
  checkoutLabel = 'Conectar e finalizar',
  onCheckout,
}: Props) {
  const mobile = variant === 'mobile'
  const row = 'flex items-center justify-between gap-4'
  const label = 'text-fg text-[15px] leading-5'
  const value = cn('text-fg leading-4', mobile ? 'text-base' : 'text-lg')
  return (
    <section
      aria-labelledby="resumo-title"
      aria-busy={loading || refreshing}
      data-testid="cart-summary"
      className={cn(
        'flex flex-col',
        mobile
          ? 'bg-bg-elevated gap-3 rounded-t-[40px] px-6 pt-6 pb-9'
          : 'w-full gap-6 lg:w-[332px]',
      )}
    >
      <div className={cn('flex flex-col gap-3', mobile && 'sr-only')}>
        <h2 id="resumo-title" className="text-fg text-lg leading-4 font-bold">
          Resumo da carteira
        </h2>
        <span className="bg-brand-strong/30 block h-px w-full" aria-hidden="true" />
      </div>
      <CouponForm couponCode={couponCode} status={quote?.coupon?.status} variant={variant} />
      {loading || !quote ? (
        <div className="flex flex-col gap-3" aria-label="Carregando resumo">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-5 w-full" />
        </div>
      ) : (
        <dl className={cn('flex flex-col gap-3', refreshing && 'opacity-60 transition-opacity')}>
          <div className={row}>
            <dt className={label}>Subtotal</dt>
            <dd className={value} data-testid="summary-subtotal">
              {quote.subtotal} ETH
            </dd>
          </div>
          <div className={row}>
            <dt className={label}>Desconto do lançamento</dt>
            <dd className="text-fg text-[15px] leading-5" data-testid="summary-discount">
              {discountLabel(quote.discount)}
            </dd>
          </div>
          <div className={cn(row, 'items-start')}>
            <dt className={label}>Taxa de rede</dt>
            <dd className={cn(value, 'flex flex-col items-end gap-3')} data-testid="summary-fee">
              <span>{quote.networkFee} ETH</span>
              <span className="text-brand text-xs leading-4">Taxa estimada</span>
            </dd>
          </div>
          <div className={cn(row, 'mt-3')}>
            <dt className="text-fg text-base leading-4 font-bold">Total</dt>
            <dd className="text-brand text-lg leading-4 font-bold" data-testid="summary-total">
              {quote.total} ETH
            </dd>
          </div>
        </dl>
      )}
      <div className={cn('flex flex-col gap-3', mobile ? 'mt-5' : 'mt-2')}>
        {onCheckout ? (
          <Button
            onClick={onCheckout}
            disabled={!canCheckout}
            className={cn(
              'text-[15px] font-bold',
              mobile ? 'h-[60px] rounded-full text-base' : 'h-10 rounded-[3px]',
            )}
          >
            {checkoutLabel}
          </Button>
        ) : (
          <Button
            asChild
            disabled={!canCheckout}
            className={cn(
              'text-[15px] font-bold',
              mobile ? 'h-[60px] rounded-full text-base' : 'h-10 rounded-[3px]',
            )}
          >
            <Link
              to="/pagamento"
              aria-disabled={!canCheckout}
              onClick={(event) => !canCheckout && event.preventDefault()}
            >
              {checkoutLabel}
            </Link>
          </Button>
        )}
        {!mobile ? (
          <Link to="/" hash="catalogo" className="text-brand text-center text-[15px] leading-5">
            Continuar explorando
          </Link>
        ) : null}
      </div>
    </section>
  )
}
