import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import type { Order } from '@/api/schemas'
import { providerLabels } from '@/api/schemas'
import { CloseIcon, DangerIcon, ThankYouIcon } from '@/components/icons'
import { NftImage } from '@/components/nft-image'
import { Button } from '@/components/ui/button'
import { formatDate, shortHash } from '@/lib/format'

export function OrderPending({ order }: { order: Order }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="order-pending"
      className="bg-bg-elevated mx-auto flex max-w-[578px] flex-col items-center gap-6 rounded-lg px-6 py-12 text-center"
    >
      <span
        className="border-brand-strong border-t-brand size-12 animate-spin rounded-full border-4 motion-reduce:animate-none"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-fg text-lg font-bold">Aguardando confirmação na rede</h1>
        <p className="text-fg-muted text-sm leading-6">
          Pedido {shortHash(order.id, 8, 4)} enviado para a{' '}
          {order.wallet.network === 'ethereum'
            ? 'Ethereum'
            : order.wallet.network === 'polygon'
              ? 'Polygon'
              : 'Solana'}
          . Você pode fechar esta página: o pedido continua em andamento e aparece aqui quando
          concluir.
        </p>
      </div>
      <p className="text-fg-subtle text-xs">Transação {shortHash(order.txHash ?? '', 8, 6)}</p>
    </div>
  )
}

export function OrderRejected({ order }: { order: Order }) {
  return (
    <div
      role="alert"
      data-testid="order-rejected"
      className="bg-bg-elevated mx-auto flex max-w-[578px] flex-col items-center gap-6 rounded-lg px-6 py-12 text-center"
    >
      <DangerIcon className="text-danger size-10" />
      <div className="flex flex-col gap-2">
        <h1 className="text-fg text-lg font-bold">Pagamento recusado</h1>
        <p className="text-fg-muted text-sm leading-6">
          {order.rejectionReason ?? 'A rede recusou a transação.'} Seus itens continuam no carrinho.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/carrinho">Voltar ao carrinho</Link>
        </Button>
        <Button asChild>
          <Link to="/pagamento">Tentar novamente</Link>
        </Button>
      </div>
    </div>
  )
}

export function Receipt({
  order,
  onClose,
  className,
}: {
  order: Order
  onClose?: () => void
  className?: string
}) {
  const networkName =
    order.wallet.network === 'ethereum'
      ? 'Ethereum'
      : order.wallet.network === 'polygon'
        ? 'Polygon'
        : 'Solana'
  const explorer =
    order.wallet.network === 'ethereum'
      ? 'Etherscan'
      : order.wallet.network === 'polygon'
        ? 'Polygonscan'
        : 'Solscan'
  return (
    <article
      data-testid="receipt"
      className={cn(
        'bg-bg-elevated relative mx-auto flex w-full max-w-[578px] flex-col overflow-hidden',
        className,
      )}
    >
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="text-brand-strong absolute top-4 right-4 flex size-6 items-center justify-center"
        >
          <CloseIcon className="size-[18px]" />
        </button>
      ) : null}
      <header className="flex flex-col items-center gap-4 px-6 pt-5 pb-5">
        <ThankYouIcon className="text-brand-strong size-20" />
        <h1 className="text-fg text-base leading-4 font-bold">
          Seus NFTs agora estão na sua carteira
        </h1>
      </header>
      <dl className="border-brand-strong grid grid-cols-2 gap-y-3 border-y px-5 py-3 text-sm md:grid-cols-4 md:gap-y-0 md:px-9">
        {[
          ['ID da transação', shortHash(order.txHash ?? '', 6, 4), 'text-brand'],
          ['Data', formatDate(order.settledAt ?? order.createdAt), 'text-fg-muted'],
          ['Total', `${order.total} ETH`, 'text-fg-muted'],
          ['Carteira', providerLabels[order.wallet.provider], 'text-fg'],
        ].map(([label, value, color], index) => (
          <div
            key={label}
            className={cn(
              'flex flex-col gap-1.5 md:px-3',
              index > 0 && 'md:border-brand-strong md:border-l',
            )}
          >
            <dt className={cn('leading-4', index === 0 || index === 3 ? 'font-bold' : '', color)}>
              {label}
            </dt>
            <dd
              className="text-fg-muted font-mono text-sm leading-4"
              data-testid={index === 0 ? 'receipt-tx' : undefined}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <section
        aria-labelledby="detalhes-transacao"
        className="flex flex-col gap-4 px-5 pt-6 pb-10 md:px-11"
      >
        <h2 id="detalhes-transacao" className="text-fg text-base leading-4 font-bold">
          Detalhes da transação
        </h2>
        <div className="border-brand-strong/30 flex items-center justify-between border-b pb-3 text-base leading-4">
          <span className="text-fg font-bold">NFTs</span>
          <span className="text-fg text-right font-medium md:w-[200px]">
            <span className="mr-6 md:mr-10">Edições</span>Subtotal
          </span>
        </div>
        <ul className="flex flex-col gap-4" aria-label="Itens comprados">
          {order.lines.map((line) => (
            <li
              key={line.cartItemId}
              className="flex items-center gap-3"
              data-testid="receipt-line"
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
              <span className="text-fg-muted w-12 shrink-0 text-right text-sm leading-4 md:w-14">
                (x {line.quantity})
              </span>
              <span className="text-brand w-24 shrink-0 text-right text-base leading-4 font-bold md:w-28 md:text-lg">
                {line.lineTotal} ETH
              </span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-3 md:pl-[170px]">
          {order.discount !== '0.00' ? (
            <div className="flex items-center justify-between">
              <dt className="text-fg text-sm">Desconto</dt>
              <dd className="text-fg text-sm">(-) {order.discount} ETH</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <dt className="text-fg text-base leading-4 whitespace-nowrap">Taxa de rede</dt>
            <dd className="text-fg text-base leading-4 whitespace-nowrap">
              {order.networkFee} ETH
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-fg text-base leading-4 font-bold">Total</dt>
            <dd
              className="text-brand text-lg leading-4 font-bold whitespace-nowrap"
              data-testid="receipt-total"
            >
              {order.total} ETH
            </dd>
          </div>
        </dl>
        <p className="border-brand-strong/30 text-fg-muted border-t pt-4 text-center text-sm leading-6">
          Transação confirmada na {networkName}. A propriedade foi transferida para sua carteira
          conectada e registrada na rede.
        </p>
        <div className="flex justify-center pt-2">
          <Button asChild className="h-12 rounded-lg px-4 text-base font-bold">
            <a href={order.explorerUrl ?? '#'} target="_blank" rel="noopener noreferrer">
              Ver no {explorer}
            </a>
          </Button>
        </div>
      </section>
      <div className="bg-brand-strong h-2.5 w-full" aria-hidden="true" />
    </article>
  )
}
