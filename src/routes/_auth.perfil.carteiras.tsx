import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ErrorState } from '@/components/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/features/profile/queries'
import { useWallets } from '@/features/wallets/queries'
import { WalletForm } from '@/features/wallets/wallet-form'
import { networkLabels, providerLabels, type Wallet, type WalletInput } from '@/api/schemas'

export const Route = createFileRoute('/_auth/perfil/carteiras')({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  component: WalletsPage,
})

function WalletsPage() {
  const wallets = useWallets()
  const profile = useProfile()
  const [editingPrimary, setEditingPrimary] = useState(false)
  const [secondaryOpen, setSecondaryOpen] = useState(false)
  const [sameAsPrimary, setSameAsPrimary] = useState(false)

  if (wallets.isPending || profile.isPending) {
    return (
      <div className="flex flex-col gap-8" aria-busy="true" aria-label="Carregando carteiras">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-6 md:grid-cols-2 md:gap-x-7">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-[65px]" />
          ))}
        </div>
      </div>
    )
  }
  if (!wallets.data) {
    return (
      <ErrorState
        title="Não foi possível carregar as carteiras"
        error={wallets.error}
        onRetry={() => void wallets.refetch()}
        retrying={wallets.isFetching}
      />
    )
  }

  const { primary, secondary } = wallets.data
  const user = profile.data
  const prefill: Partial<WalletInput> | undefined = user
    ? {
        displayName: user.displayName,
        nickname: user.walletNickname,
        profileName: user.username,
        email: user.email,
        ensName: user.ensName,
      }
    : undefined
  const secondaryPrefill: Partial<WalletInput> | undefined =
    sameAsPrimary && primary
      ? { ...primary, nickname: 'Reserva' }
      : prefill
        ? { ...prefill, nickname: 'Reserva' }
        : undefined
  const showPrimaryForm = !primary || editingPrimary

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="carteira-principal" className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h1 id="carteira-principal" className="text-fg text-[17px] leading-4 font-bold">
              Carteira principal
            </h1>
            {primary ? (
              <button
                type="button"
                onClick={() => setEditingPrimary((v) => !v)}
                className="text-brand text-base leading-4 font-medium"
              >
                {editingPrimary ? 'Cancelar' : 'Editar'}
              </button>
            ) : (
              <span className="text-brand text-base leading-4 font-medium">Adicionar</span>
            )}
          </div>
          <p className="text-fg-muted text-sm leading-[15px]">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
          </p>
        </div>
        {primary && !editingPrimary ? <WalletSummary wallet={primary} /> : null}
        {showPrimaryForm ? (
          <WalletForm
            key={primary?.id ?? 'new-primary'}
            slot="primary"
            wallet={primary}
            prefill={prefill}
            onSaved={() => setEditingPrimary(false)}
          />
        ) : null}
      </section>

      <section aria-labelledby="carteira-secundaria" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="carteira-secundaria" className="text-fg text-[17px] leading-4 font-bold">
            Carteira secundária
          </h2>
          <div className="flex items-center gap-6">
            <label className="text-fg flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="secondary-source"
                checked={sameAsPrimary}
                onClick={() => setSameAsPrimary((v) => !v)}
                onChange={() => undefined}
                disabled={!primary}
                className="accent-brand-strong size-4"
              />
              Igual à carteira principal
            </label>
            <button
              type="button"
              onClick={() => setSecondaryOpen((v) => !v)}
              className="text-brand text-base leading-4 font-medium"
            >
              {secondary
                ? secondaryOpen
                  ? 'Cancelar'
                  : 'Editar'
                : secondaryOpen
                  ? 'Cancelar'
                  : 'Adicionar'}
            </button>
          </div>
        </div>
        {secondary && !secondaryOpen ? (
          <WalletSummary wallet={secondary} />
        ) : !secondary && !secondaryOpen ? (
          <p className="text-fg-muted text-sm leading-[15px]">
            Você ainda não adicionou uma carteira secundária.
          </p>
        ) : null}
        {secondaryOpen ? (
          <div className="pt-5">
            <WalletForm
              key={`${secondary?.id ?? 'new-secondary'}-${sameAsPrimary}`}
              slot="secondary"
              wallet={sameAsPrimary ? null : secondary}
              prefill={secondaryPrefill}
              onSaved={() => setSecondaryOpen(false)}
            />
          </div>
        ) : null}
      </section>
    </div>
  )
}

function WalletSummary({ wallet }: { wallet: Wallet }) {
  return (
    <dl
      className="bg-bg-elevated grid gap-x-7 gap-y-3 rounded-md p-5 text-sm md:grid-cols-2"
      data-testid={`wallet-summary-${wallet.slot}`}
    >
      <div>
        <dt className="text-fg-subtle">Apelido</dt>
        <dd className="text-fg">{wallet.nickname}</dd>
      </div>
      <div>
        <dt className="text-fg-subtle">Rede</dt>
        <dd className="text-fg">{networkLabels[wallet.network]}</dd>
      </div>
      <div className="md:col-span-2">
        <dt className="text-fg-subtle">Endereço</dt>
        <dd className="text-fg break-all">{wallet.address}</dd>
      </div>
      <div>
        <dt className="text-fg-subtle">Provedor</dt>
        <dd className="text-fg">{providerLabels[wallet.provider]}</dd>
      </div>
      <div>
        <dt className="text-fg-subtle">ENS</dt>
        <dd className="text-fg">{wallet.ensName}.eth</dd>
      </div>
    </dl>
  )
}
