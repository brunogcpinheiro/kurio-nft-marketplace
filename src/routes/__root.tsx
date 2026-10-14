import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useRealtime } from '@/features/realtime/use-realtime'

type RouterContext = { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  useRealtime()
  return (
    <TooltipProvider delayDuration={200}>
      <Outlet />
      <Toaster />
    </TooltipProvider>
  )
}
