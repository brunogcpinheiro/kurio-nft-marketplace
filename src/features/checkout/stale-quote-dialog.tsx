import type { Quote } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  previous: Quote | null
  next: Quote | null
  onReview: () => void
  onAccept: () => void
  onClose: () => void
}

export function StaleQuoteDialog({ previous, next, onReview, onAccept, onClose }: Props) {
  const open = Boolean(next)
  const changes: string[] = []
  if (previous && next) {
    for (const line of next.lines) {
      const before = previous.lines.find((l) => l.cartItemId === line.cartItemId)
      if (!before) continue
      if (before.unitPrice !== line.unitPrice)
        changes.push(`${line.name}: ${before.unitPrice} ETH → ${line.unitPrice} ETH`)
      if (before.quantity !== line.quantity)
        changes.push(`${line.name}: quantidade ${before.quantity} → ${line.quantity}`)
      if (line.availability === 'sold_out') changes.push(`${line.name}: esgotado`)
    }
    if (previous.total !== next.total)
      changes.push(`Total: ${previous.total} ETH → ${next.total} ETH`)
  }
  const blocked = next?.lines.some((l) => l.availability === 'sold_out') || next?.lines.length === 0
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        className="bg-bg-elevated border-surface-strong sm:max-w-md"
        data-testid="stale-quote-dialog"
      >
        <DialogHeader>
          <DialogTitle>A cotação mudou</DialogTitle>
          <DialogDescription>
            Os valores do seu pedido foram atualizados enquanto você revisava. Confira antes de
            confirmar.
          </DialogDescription>
        </DialogHeader>
        <ul className="text-fg flex flex-col gap-2 text-sm" aria-label="Mudanças na cotação">
          {(changes.length ? changes : (next?.issues ?? [])).map((change) => (
            <li key={change} className="border-brand-strong/40 rounded-md border px-3 py-2">
              {change}
            </li>
          ))}
        </ul>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={onReview}>
            Revisar carrinho
          </Button>
          <Button onClick={onAccept} disabled={blocked}>
            Confirmar com os novos valores
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
