import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { session } from '@/features/auth/session'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ location }) => {
    if (!session.get()) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Outlet,
})
