import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import type { Cart, CartItem, Quote } from '@/api/schemas'
import { TrashIcon } from '@/components/icons'
import { NftImage } from '@/components/nft-image'
import { Skeleton } from '@/components/ui/skeleton'
import { QuantityStepper } from '@/features/nft/quantity-stepper'
import { useRemoveCartItem, useUpdateCartItem } from './mutations'

type Props = { cart: Cart; quote?: Quote; variant: 'desktop' | 'mobile' }

function lineFor(quote: Quote | undefined, item: CartItem) {
  return quote?.lines.find((l) => l.cartItemId === item.id)
}

function AvailabilityNote({ item, quote }: { item: CartItem; quote?: Quote }) {
  const line = lineFor(quote, item)
  if (!line) return null
  if (line.availability === 'sold_out') {
    return (
      <p role="status" className="text-danger text-xs leading-4">
        Esgotado. Remova para continuar.
      </p>
    )
  }
  if (line.availability === 'reduced') {
    return (
      <p role="status" className="text-danger text-xs leading-4">
        Apenas {line.quantity} {line.quantity === 1 ? 'disponível' : 'disponíveis'}, quantidade
        ajustada na cotação.
      </p>
    )
  }
  if (line.priceChanged) {
    return (
      <p role="status" className="text-brand text-xs leading-4">
        Preço atualizado para {line.unitPrice} ETH.
      </p>
    )
  }
  return null
}

export function CartItems({ cart, quote, variant }: Props) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const busy = (id: string) =>
    (update.isPending && update.variables?.itemId === id) ||
    (remove.isPending && remove.variables?.itemId === id)

  if (variant === 'mobile') {
    return (
      <ul className="flex flex-col gap-5" aria-label="Itens do carrinho">
        {cart.items.map((item) => {
          const line = lineFor(quote, item)
          return (
            <li
              key={item.id}
              className="bg-bg-elevated flex h-[100px] overflow-hidden rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
              data-testid="cart-item"
            >
              <Link to="/nft/$slug" params={{ slug: item.nft.slug }} className="shrink-0">
                <NftImage
                  imageKey={item.nft.imageKey}
                  name={item.nft.name}
                  base={160}
                  sizes="100px"
                  className="size-[100px] rounded-[14px] object-cover"
                  width={100}
                  height={100}
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-2.5">
                <p className="text-fg truncate text-[15px] leading-4 font-bold">{item.nft.name}</p>
                <p className="text-fg-muted text-sm leading-4">Edição: {item.edition.label}</p>
                <p className="text-brand text-lg leading-4 font-bold">
                  {line?.lineTotal ?? item.edition.price} ETH
                </p>
                <AvailabilityNote item={item} quote={quote} />
              </div>
              <div className="flex flex-col items-end justify-center gap-2 pr-4">
                <QuantityStepper
                  value={item.quantity}
                  max={Math.max(1, item.edition.available)}
                  onChange={(quantity) => update.mutate({ itemId: item.id, quantity })}
                  disabled={busy(item.id)}
                  size="sm"
                  label={`Quantidade de ${item.nft.name}`}
                />
                <button
                  type="button"
                  onClick={() => remove.mutate({ itemId: item.id, name: item.nft.name })}
                  disabled={busy(item.id)}
                  aria-label={`Remover ${item.nft.name} do carrinho`}
                  className="text-brand-strong flex size-6 items-center justify-center"
                >
                  <TrashIcon className="size-5" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <table className="w-full border-separate border-spacing-y-3" aria-label="Itens do carrinho">
      <thead>
        <tr className="text-fg text-left text-base leading-4">
          <th scope="col" className="pb-1 font-bold">
            NFTs
          </th>
          <th scope="col" className="pb-1 font-medium">
            Preço
          </th>
          <th scope="col" className="pb-1 font-bold">
            Edições
          </th>
          <th scope="col" className="pb-1 font-medium">
            Total
          </th>
          <th scope="col" className="pb-1">
            <span className="sr-only">Ações</span>
          </th>
        </tr>
        <tr aria-hidden="true">
          <td colSpan={5} className="bg-brand-strong/30 h-px p-0" />
        </tr>
      </thead>
      <tbody>
        {cart.items.map((item) => {
          const line = lineFor(quote, item)
          return (
            <tr key={item.id} className="bg-bg-elevated h-[70px]" data-testid="cart-item">
              <td className="w-[40%] pr-6">
                <div className="flex items-center gap-4">
                  <Link to="/nft/$slug" params={{ slug: item.nft.slug }} className="shrink-0">
                    <NftImage
                      imageKey={item.nft.imageKey}
                      name={item.nft.name}
                      base={160}
                      sizes="70px"
                      className="size-[70px] rounded-md object-cover"
                      width={70}
                      height={70}
                    />
                  </Link>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="text-fg truncate text-base leading-4 font-bold">
                      {item.nft.name}
                    </p>
                    <p className="text-fg-subtle text-sm leading-4">
                      ID do token: #{item.nft.tokenId} · {item.edition.label}
                    </p>
                    <AvailabilityNote item={item} quote={quote} />
                  </div>
                </div>
              </td>
              <td className="text-fg-muted text-base leading-4 font-bold whitespace-nowrap">
                {line?.unitPrice ?? item.edition.price} ETH
              </td>
              <td>
                <QuantityStepper
                  value={item.quantity}
                  max={Math.max(1, item.edition.available)}
                  onChange={(quantity) => update.mutate({ itemId: item.id, quantity })}
                  disabled={busy(item.id)}
                  size="sm"
                  label={`Quantidade de ${item.nft.name}`}
                />
              </td>
              <td className="text-brand text-base leading-4 font-bold whitespace-nowrap">
                {line?.lineTotal ?? '—'} ETH
              </td>
              <td className="pr-6 text-right">
                <button
                  type="button"
                  onClick={() => remove.mutate({ itemId: item.id, name: item.nft.name })}
                  disabled={busy(item.id)}
                  aria-label={`Remover ${item.nft.name} do carrinho`}
                  className={cn(
                    'text-fg-subtle hover:text-danger inline-flex size-6 items-center justify-center',
                    busy(item.id) && 'opacity-50',
                  )}
                >
                  <TrashIcon className="size-6" />
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function CartItemsSkeleton({ variant }: { variant: 'desktop' | 'mobile' }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando carrinho">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton
          key={i}
          className={variant === 'mobile' ? 'h-[100px] rounded-[14px]' : 'h-[70px]'}
        />
      ))}
    </div>
  )
}
