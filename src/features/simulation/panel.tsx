import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCart } from '@/features/cart/queries'
import { useScenario } from './use-scenario'

export function SimulationPanel() {
  const [open, setOpen] = useState(false)
  const { query, select, reset, emit, disconnect } = useScenario(open)
  const cart = useCart()
  const firstItem = cart.data?.items[0]

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '.') {
        event.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function trigger(change: 'price-up' | 'sold-out') {
    if (!firstItem) {
      toast('Adicione um item ao carrinho para disparar este evento')
      return
    }
    emit.mutate(
      { event: 'nft.updated', nftId: firstItem.nftId, editionId: firstItem.editionId, change },
      { onSuccess: () => toast.success('Evento nft.updated enviado') },
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="bg-bg w-[360px] overflow-y-auto sm:max-w-[360px]">
        <SheetHeader>
          <SheetTitle>Simulação de rede</SheetTitle>
          <SheetDescription>
            Escolha um cenário para a API simulada. Também dá para ativar pela URL com{' '}
            <code className="text-brand">?scenario=nome</code> e resetar com{' '}
            <code className="text-brand">?reset=1</code>. Atalho: Ctrl+.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-6">
          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-sm font-bold">Cenário ativo</h3>
            {query.data ? (
              <RadioGroup
                value={query.data.active}
                onValueChange={(name) => select.mutate(name)}
                className="gap-3"
              >
                {query.data.available.map((scenario) => (
                  <div key={scenario.name} className="flex items-start gap-3">
                    <RadioGroupItem
                      value={scenario.name}
                      id={`scenario-${scenario.name}`}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`scenario-${scenario.name}`}
                      className="flex flex-col items-start gap-1 leading-4"
                    >
                      <span className="text-fg">{scenario.title}</span>
                      <span className="text-fg-subtle text-xs leading-4 font-normal">
                        {scenario.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-fg-subtle text-sm">Carregando cenários…</p>
            )}
          </section>
          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-sm font-bold">Disparar evento</h3>
            <p className="text-fg-subtle text-xs">
              {firstItem
                ? `Alvo: ${firstItem.nft.name} (${firstItem.edition.label})`
                : 'Adicione um item ao carrinho para ter um alvo.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => trigger('price-up')}
                disabled={emit.isPending}
              >
                Subir preço 15%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => trigger('sold-out')}
                disabled={emit.isPending}
              >
                Esgotar edição
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  disconnect.mutate(undefined, {
                    onSuccess: () => toast('Conexão em tempo real derrubada'),
                  })
                }
              >
                Derrubar socket
              </Button>
            </div>
          </section>
          <section className="flex flex-col gap-3">
            <h3 className="text-fg text-sm font-bold">Dados</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => reset.mutate()}
              disabled={reset.isPending}
            >
              Resetar dados simulados
            </Button>
            <p className="text-fg-subtle text-xs">
              Restaura o catálogo, usuários, carrinhos e pedidos ao estado inicial e encerra a
              sessão.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
