import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/perfil/')({
  component: () => <h1 className="text-2xl font-bold">Perfil do colecionador</h1>,
})
