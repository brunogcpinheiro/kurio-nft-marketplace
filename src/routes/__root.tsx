import { useEffect } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { Link, Outlet, createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { onUnauthenticated } from '@/api/client'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useRealtime } from '@/features/realtime/use-realtime'

type RouterContext = { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error, reset }) => (
    <SiteLayout>
      <PageContainer className="py-16">
        <ErrorState title="Algo deu errado nesta página" error={error} onRetry={reset} />
      </PageContainer>
    </SiteLayout>
  ),
})

const privateKeys = ['session', 'favorites', 'cart', 'quote', 'orders', 'profile', 'wallets']

function RootLayout() {
  const router = useRouter()
  const { queryClient } = Route.useRouteContext()
  useRealtime()

  useEffect(() => {
    onUnauthenticated(() => {
      queryClient.removeQueries({ predicate: (q) => privateKeys.includes(String(q.queryKey[0])) })
      toast.warning('Sua sessão expirou', {
        description: 'Entre novamente para continuar de onde parou.',
      })
      const current = router.state.location
      if (current.pathname === '/login' || current.pathname === '/cadastro') return
      void router.navigate({ to: '/login', search: { redirect: current.href } })
    })
  }, [queryClient, router])

  return (
    <TooltipProvider delayDuration={200}>
      <Outlet />
      <Toaster />
    </TooltipProvider>
  )
}

function NotFoundPage() {
  return (
    <SiteLayout>
      <PageContainer className="py-16">
        <EmptyState
          title="Página não encontrada"
          description="O endereço que você acessou não existe ou foi movido."
          action={
            <Button asChild className="mt-2">
              <Link to="/">Voltar ao início</Link>
            </Button>
          }
        />
      </PageContainer>
    </SiteLayout>
  )
}
