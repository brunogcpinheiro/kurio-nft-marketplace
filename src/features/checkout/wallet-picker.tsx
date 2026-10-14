import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { networkLabels, providerLabels, type Provider, type Wallet } from '@/api/schemas'
import { WalletIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { shortHash } from '@/lib/format'
import type { ConnectionStatus } from './wallet-connection'

type Props = {
  variant: 'desktop' | 'mobile'
  wallets: Wallet[]
  walletId: string | null
  onWallet: (id: string) => void
  provider: Provider | null
  onProvider: (provider: Provider) => void
  status: ConnectionStatus
  onConnect: () => void
  onDisconnect: () => void
  address?: string
}

const providers: Provider[] = ['walletconnect', 'metamask', 'coinbase']

function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === 'coinbase') return <WalletIcon className="text-brand-strong size-6" />
  return (
    <span className="text-brand text-sm font-bold">{provider === 'walletconnect' ? 'W' : 'M'}</span>
  )
}

function ConnectionControls({
  status,
  provider,
  onConnect,
  onDisconnect,
  address,
  compact,
}: Pick<Props, 'status' | 'provider' | 'onConnect' | 'onDisconnect' | 'address'> & {
  compact?: boolean
}) {
  const label = provider ? providerLabels[provider] : 'a carteira'
  return (
    <div
      className={cn('flex flex-wrap items-center gap-3', compact ? 'text-sm' : 'text-[15px]')}
      aria-live="polite"
      data-testid="wallet-connection"
    >
      {status === 'connected' ? (
        <>
          <span className="text-success">
            {label} conectada{address ? ` · ${shortHash(address)}` : ''}
          </span>
          <button
            type="button"
            onClick={onDisconnect}
            className="text-fg-subtle text-sm underline-offset-4 hover:underline"
          >
            Desconectar
          </button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onConnect}
            disabled={!provider || status === 'connecting'}
            className="border-brand-strong text-brand h-9"
          >
            {status === 'connecting'
              ? 'Conectando…'
              : status === 'refused' || status === 'disconnected'
                ? 'Tentar novamente'
                : 'Conectar carteira'}
          </Button>
          {status === 'refused' ? (
            <span className="text-danger text-sm">Conexão recusada pela carteira.</span>
          ) : null}
          {status === 'disconnected' ? (
            <span className="text-fg-subtle text-sm">Carteira desconectada.</span>
          ) : null}
          {status === 'idle' && !provider ? (
            <span className="text-fg-subtle text-sm">Escolha um provedor para conectar.</span>
          ) : null}
        </>
      )}
    </div>
  )
}

export function WalletPicker(props: Props) {
  const { variant, wallets, walletId, onWallet, provider, onProvider } = props

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-fg text-base leading-4 font-bold">Carteira conectada</h2>
          <Link
            to="/perfil/carteiras"
            search={{ redirect: '/pagamento?step=wallet' }}
            className="text-brand text-sm leading-4 font-bold"
          >
            Trocar carteira
          </Link>
        </div>
        {wallets.length ? (
          <div role="radiogroup" aria-label="Carteira de destino" className="flex flex-col gap-5">
            {wallets.map((wallet) => {
              const selected = wallet.id === walletId
              return (
                <button
                  key={wallet.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onWallet(wallet.id)}
                  className="bg-bg-elevated relative flex h-[93px] w-full items-start gap-5 rounded-[14px] px-5 pt-4 text-left shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'border-brand-strong mt-6 flex size-4 shrink-0 items-center justify-center rounded-full border',
                      selected &&
                        'after:bg-brand-strong after:block after:size-2 after:rounded-full',
                    )}
                  />
                  <span className="flex flex-col gap-1.5">
                    <span className="text-fg text-base leading-4 font-bold">{wallet.nickname}</span>
                    <span className="text-fg-muted text-sm leading-[22px]">
                      {wallet.ensName}.kurio.eth
                      <br />
                      Rede {networkLabels[wallet.network]}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-fg-subtle absolute top-9 right-5 text-xl leading-none"
                  >
                    ⋮
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-fg-muted text-sm">
            Nenhuma carteira cadastrada.{' '}
            <Link
              to="/perfil/carteiras"
              search={{ redirect: '/pagamento?step=wallet' }}
              className="text-brand"
            >
              Cadastrar carteira
            </Link>
          </p>
        )}
        <h2 className="text-fg mt-2 text-base leading-4 font-bold">Carteira e rede</h2>
        <div role="radiogroup" aria-label="Provedor da carteira" className="flex flex-col gap-4">
          {providers.map((item) => {
            const selected = item === provider
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onProvider(item)}
                className="bg-bg-elevated flex h-[65px] w-full items-center gap-3 rounded-[15px] px-3.5 text-left shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
              >
                <span className="bg-surface border-surface-strong flex size-10 shrink-0 items-center justify-center rounded-full border">
                  <ProviderMark provider={item} />
                </span>
                <span className="text-fg flex-1 text-sm leading-4">{providerLabels[item]}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full border',
                    selected
                      ? 'border-brand-strong after:bg-brand-strong after:block after:size-2 after:rounded-full'
                      : 'border-[#55321f]',
                  )}
                />
              </button>
            )
          })}
        </div>
        <ConnectionControls {...props} compact />
      </div>
    )
  }

  return (
    <section aria-labelledby="carteira-rede" className="flex flex-col gap-5">
      <h2 id="carteira-rede" className="text-fg text-[17px] leading-4 font-bold">
        Carteira e rede
      </h2>
      {wallets.length > 1 ? (
        <div role="radiogroup" aria-label="Carteira de destino" className="flex flex-col gap-2">
          {wallets.map((wallet) => {
            const selected = wallet.id === walletId
            return (
              <button
                key={wallet.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onWallet(wallet.id)}
                className={cn(
                  'flex items-center gap-3 rounded-[3px] border px-3 py-2 text-left text-sm',
                  selected ? 'border-brand-strong' : 'border-surface-strong',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'border-brand-strong flex size-4 shrink-0 items-center justify-center rounded-full border',
                    selected && 'after:bg-brand-strong after:block after:size-2 after:rounded-full',
                  )}
                />
                <span className="text-fg">
                  {wallet.nickname}{' '}
                  <span className="text-fg-subtle">
                    · {shortHash(wallet.address)} · {networkLabels[wallet.network]}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
      <div role="radiogroup" aria-label="Provedor da carteira" className="flex flex-col gap-4">
        {providers.map((item) => {
          const selected = item === provider
          return (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onProvider(item)}
              className={cn(
                'flex h-[45px] items-center gap-3 rounded-[3px] border px-3 text-left',
                selected ? 'border-brand-strong' : 'border-surface-strong',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'border-brand-strong flex size-4 shrink-0 items-center justify-center rounded-full border',
                  selected && 'after:bg-brand-strong after:block after:size-2 after:rounded-full',
                )}
              />
              {item === 'walletconnect' ? (
                <span className="bg-surface-strong text-brand inline-flex h-[26px] items-center rounded-md border border-[#55321f] px-2.5 text-[9px] font-bold tracking-[0.1px]">
                  METAMASK&nbsp;&nbsp;•&nbsp;&nbsp;WALLETCONNECT&nbsp;&nbsp;•&nbsp;&nbsp;COINBASE
                </span>
              ) : (
                <span className="text-fg text-base leading-4">{providerLabels[item]}</span>
              )}
            </button>
          )
        })}
      </div>
      <ConnectionControls {...props} />
    </section>
  )
}
