import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { applyFieldErrors, errorMessage } from '@/api/errors'
import {
  networkLabels,
  providerLabels,
  walletInputSchema,
  type Wallet,
  type WalletInput,
  type WalletSlot,
} from '@/api/schemas'
import { TextField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'
import { Button } from '@/components/ui/button'
import { useSaveWallet } from './queries'

type Props = {
  slot: WalletSlot
  wallet: Wallet | null
  prefill?: Partial<WalletInput>
  onSaved?: (wallet: Wallet) => void
  submitLabel?: string
}

const empty: WalletInput = {
  displayName: '',
  nickname: '',
  network: 'ethereum',
  profileName: '',
  address: '',
  secondaryAddress: null,
  provider: 'metamask',
  referralCode: '',
  email: '',
  ensName: '',
}

const inputClass = 'rounded-[3px]'
const networkOptions = Object.entries(networkLabels).map(([value, label]) => ({ value, label }))
const providerOptions = Object.entries(providerLabels).map(([value, label]) => ({ value, label }))

export function WalletForm({
  slot,
  wallet,
  prefill,
  onSaved,
  submitLabel = 'Salvar carteira',
}: Props) {
  const save = useSaveWallet()
  const form = useForm<WalletInput>({
    resolver: zodResolver(walletInputSchema),
    defaultValues: { ...empty, ...(wallet ?? prefill ?? {}) },
  })
  const errors = form.formState.errors

  function submit(values: WalletInput) {
    save.mutate(
      { slot, input: { ...values, secondaryAddress: values.secondaryAddress || null } },
      {
        onSuccess: (saved) => {
          toast.success(
            slot === 'primary' ? 'Carteira principal salva' : 'Carteira secundária salva',
          )
          onSaved?.(saved)
        },
        onError: (error) => {
          if (
            !applyFieldErrors(error, form.setError, [
              'address',
              'secondaryAddress',
              'email',
              'ensName',
              'nickname',
            ])
          ) {
            toast.error('Não foi possível salvar a carteira', { description: errorMessage(error) })
          }
        },
      },
    )
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="flex flex-col gap-8"
      aria-busy={save.isPending}
      data-testid={`wallet-form-${slot}`}
    >
      <div className="grid gap-6 md:grid-cols-2 md:gap-x-7">
        <TextField
          label="Nome de exibição"
          required
          error={errors.displayName?.message}
          inputClassName={inputClass}
          {...form.register('displayName')}
        />
        <TextField
          label="Apelido da carteira"
          required
          error={errors.nickname?.message}
          inputClassName={inputClass}
          {...form.register('nickname')}
        />
        <Controller
          control={form.control}
          name="network"
          render={({ field }) => (
            <SelectField
              label="Rede"
              required
              value={field.value}
              onChange={field.onChange}
              options={networkOptions}
              placeholder="Selecione uma rede"
              error={errors.network?.message}
            />
          )}
        />
        <TextField
          label="Nome do perfil"
          required
          error={errors.profileName?.message}
          inputClassName={inputClass}
          {...form.register('profileName')}
        />
        <TextField
          label="Endereço da carteira"
          required
          placeholder="Endereço 0x da carteira"
          autoComplete="off"
          spellCheck={false}
          error={errors.address?.message}
          inputClassName={inputClass}
          {...form.register('address')}
        />
        <TextField
          label="Endereço secundário"
          hideLabel
          className="md:pt-7"
          placeholder="ENS ou carteira secundária (opcional)"
          autoComplete="off"
          spellCheck={false}
          error={errors.secondaryAddress?.message}
          inputClassName={inputClass}
          {...form.register('secondaryAddress')}
        />
        <Controller
          control={form.control}
          name="provider"
          render={({ field }) => (
            <SelectField
              label="Tipo de carteira"
              required
              value={field.value}
              onChange={field.onChange}
              options={providerOptions}
              placeholder="Selecione uma carteira"
              error={errors.provider?.message}
            />
          )}
        />
        <TextField
          label="Código de indicação"
          required
          error={errors.referralCode?.message}
          inputClassName={inputClass}
          {...form.register('referralCode')}
        />
        <TextField
          label="E-mail"
          required
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          inputClassName={inputClass}
          {...form.register('email')}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor={`ens-${slot}`} className="text-fg text-base leading-5">
            Nome ENS{' '}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </label>
          <div className="flex gap-2.5">
            <span
              className="border-surface-strong text-fg flex h-10 w-[78px] items-center rounded-[3px] border px-2.5 text-[15px]"
              aria-hidden="true"
            >
              .eth
            </span>
            <input
              id={`ens-${slot}`}
              aria-invalid={errors.ensName ? true : undefined}
              aria-describedby={errors.ensName ? `ens-${slot}-error` : undefined}
              aria-required
              className={`text-fg focus-visible:border-brand focus-visible:ring-brand/30 h-10 min-w-0 flex-1 rounded-[3px] border bg-transparent px-4 text-sm outline-none focus-visible:ring-2 ${errors.ensName ? 'border-danger' : 'border-surface-strong'}`}
              {...form.register('ensName')}
            />
          </div>
          {errors.ensName ? (
            <p id={`ens-${slot}-error`} role="alert" className="text-danger text-xs">
              {errors.ensName.message}
            </p>
          ) : null}
        </div>
      </div>
      <Button
        type="submit"
        disabled={save.isPending}
        className="h-10 w-[131px] rounded-[3px] text-sm font-bold"
      >
        {save.isPending ? 'Salvando…' : submitLabel}
      </Button>
    </form>
  )
}
