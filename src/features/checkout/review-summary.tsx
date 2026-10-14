import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import type { Quote } from '@/api/schemas'
import { NftImage } from '@/components/nft-image'
import { Skeleton } from '@/components/ui/skeleton'

type Props = { quote?: Quote; refreshing?: boolean; className?: string }

export function ReviewSummary({ quote, refreshing, className }: Props) {
  return (
    <section
      aria-labelledby="seus-nfts"
      className={cn('flex flex-col gap-3', className)}
      aria-busy={!quote || refreshing}
    >
      <h2 id="seus-nfts" className="text-fg text-[17px] leading-4 font-bold">
        Seus NFTs
      </h2>
      <div className="flex flex-col gap-3">
        <div className="text-fg flex items-center justify-between text-base leading-4">
          <span className="font-bold">NFTs</span>
          <span className="font-medium">Subtotal</span>
        </div>
        <span className="bg-brand-strong/30 block h-px" aria-hidden="true" />
      </div>
      {quote ? (
        <ul
          className={cn('flex flex-col gap-3', refreshing && 'opacity-60')}
          aria-label="Itens do pedido"
        >
          {quote.lines.map((line) => (
            <li
              key={line.cartItemId}
              className="bg-bg-elevated flex h-[70px] items-center gap-2 pr-4 pl-1"
              data-testid="review-line"
            >
              <NftImage
                imageKey={line.imageKey}
                name={line.name}
                base={160}
                sizes="70px"
                className="size-[70px] rounded-lg object-cover"
                width={70}
                height={70}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="text-fg truncate text-base leading-4 font-bold">{line.name}</p>
                <p className="text-fg-subtle text-sm leading-4">ID do token: #{line.tokenId}</p>
              </div>
              <span className="text-fg-muted text-sm leading-4 whitespace-nowrap">
                (x {line.quantity})
              </span>
              <span className="text-brand text-lg leading-4 font-bold whitespace-nowrap">
                {line.lineTotal} ETH
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[70px]" />
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-col gap-3">
        <Link to="/carrinho" className="text-fg text-center text-sm leading-4 hover:underline">
          Tem um código promocional? Aplique aqui
        </Link>
        {quote ? (
          <dl className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-fg text-[15px] leading-5">Subtotal</dt>
              <dd className="text-fg text-lg leading-4">{quote.subtotal} ETH</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-fg text-[15px] leading-5">Desconto do lançamento</dt>
              <dd className="text-fg text-[15px] leading-5">
                {quote.discount === '0.00' ? '(-) 00.00' : `(-) ${quote.discount} ETH`}
              </dd>
            </div>
            <div className="flex items-start justify-between">
              <dt className="text-fg text-[15px] leading-5">Taxa de rede</dt>
              <dd className="text-fg flex flex-col items-end gap-3 text-lg leading-4">
                <span>{quote.networkFee} ETH</span>
                <span className="text-brand text-xs leading-4">Taxa estimada</span>
              </dd>
            </div>
            <div className="bg-brand-strong/30 h-px" aria-hidden="true" />
            <div className="flex items-center justify-between px-10">
              <dt className="text-fg text-base leading-4 font-bold">Total</dt>
              <dd className="text-brand text-lg leading-4 font-bold" data-testid="checkout-total">
                {quote.total} ETH
              </dd>
            </div>
          </dl>
        ) : (
          <Skeleton className="h-28" />
        )}
      </div>
    </section>
  )
}
