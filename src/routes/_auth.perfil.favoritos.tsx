import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/perfil/favoritos')({
  component: () => <h1 className="text-2xl font-bold">Lista de interesse</h1>,
})
