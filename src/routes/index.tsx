import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="text-4xl font-bold tracking-wide uppercase">
        Seja dono do futuro da arte digital
      </h1>
      <p className="text-fg-muted mt-4 text-[15px] leading-10">
        Descubra NFTs selecionados de criadores emergentes e consagrados.
      </p>
    </main>
  )
}
