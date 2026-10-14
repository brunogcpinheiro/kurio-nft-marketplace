import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useStoredSession } from '@/features/auth/session'
import { checkoutDraft } from '@/features/checkout/use-checkout-draft'
import { OrderPending, OrderRejected, Receipt } from '@/features/orders/order-views'
import { useOrder } from '@/features/orders/queries'
import { desktopQuery, useMediaQuery } from '@/lib/use-media-query'

export const Route = createFileRoute('/_auth/pedido/$orderId')({
  component: OrderPage,
})

function OrderPage() {
  const { orderId } = Route.useParams()
  const order = useOrder(orderId)
  const stored = useStoredSession()
  const desktop = useMediaQuery(desktopQuery)
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)
  const status = order.data?.status

  useEffect(() => {
    if (!stored || !status) return
    if (status === 'pending') checkoutDraft.patch(stored.userId, { pendingOrderId: orderId })
    else
      checkoutDraft.patch(stored.userId, {
        pendingOrderId: null,
        idempotencyKey: crypto.randomUUID(),
      })
  }, [status, stored, orderId])

  const forbidden = isAxiosError(order.error) && order.error.response?.status === 403
  const missing = isAxiosError(order.error) && order.error.response?.status === 404

  return (
    <SiteLayout footer={!desktop || status !== 'confirmed'} bottomNav={false}>
      <PageContainer className="py-10 md:py-16">
        {order.isPending ? (
          <div className="mx-auto max-w-[578px]" aria-busy="true" aria-label="Carregando pedido">
            <Skeleton className="h-[320px] rounded-lg" />
          </div>
        ) : forbidden || missing ? (
          <EmptyState
            title={forbidden ? 'Este pedido pertence a outra conta' : 'Pedido não encontrado'}
            description={
              forbidden
                ? 'Entre com a conta que fez a compra para ver o recibo.'
                : 'Confira o endereço ou volte ao catálogo.'
            }
            action={
              <Button asChild className="mt-2">
                <Link to="/">Voltar ao início</Link>
              </Button>
            }
          />
        ) : order.isError || !order.data ? (
          <ErrorState
            title="Não foi possível carregar o pedido"
            error={order.error}
            onRetry={() => void order.refetch()}
            retrying={order.isFetching}
          />
        ) : order.data.status === 'pending' ? (
          <OrderPending order={order.data} />
        ) : order.data.status === 'rejected' ? (
          <OrderRejected order={order.data} />
        ) : desktop ? (
          <>
            <div className="mx-auto flex max-w-[578px] flex-col items-center gap-4 text-center">
              <h1 className="text-fg text-lg font-bold">Compra confirmada</h1>
              <p className="text-fg-muted text-sm">Recibo do pedido {orderId}.</p>
              {dismissed ? (
                <Button variant="outline" onClick={() => setDismissed(false)}>
                  Ver recibo
                </Button>
              ) : null}
            </div>
            <Dialog open={!dismissed} onOpenChange={(open) => !open && setDismissed(true)}>
              <DialogContent
                showCloseButton={false}
                className="bg-bg-elevated max-h-[90vh] gap-0 overflow-y-auto border-0 p-0 sm:max-w-[578px]"
                aria-describedby={undefined}
              >
                <DialogTitle className="sr-only">Recibo do pedido</DialogTitle>
                <DialogDescription className="sr-only">
                  Detalhes da transação confirmada
                </DialogDescription>
                <Receipt order={order.data} onClose={() => setDismissed(true)} />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Receipt
            order={order.data}
            className="rounded-2xl"
            onClose={() => void navigate({ to: '/' })}
          />
        )}
      </PageContainer>
    </SiteLayout>
  )
}
