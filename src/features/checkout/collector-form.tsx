import { useId } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { cn } from 'cn'
import { networkLabels, providerLabels, type Collector, type Wallet } from '@/api/schemas'
import { TextField } from '@/components/form-field'
import { SelectField } from '@/components/select-field'

type Props = {
  form: UseFormReturn<Collector>
  wallets: Wallet[]
  useOtherWallet: boolean
  onUseOtherWallet: (value: boolean) => void
}

const inputClass = 'rounded-[3px]'
const networkOptions = Object.entries(networkLabels).map(([value, label]) => ({ value, label }))
const providerOptions = Object.entries(providerLabels).map(([value, label]) => ({ value, label }))

export function CollectorForm({ form, wallets, useOtherWallet, onUseOtherWallet }: Props) {
  const errors = form.formState.errors
  const noteId = useId()
  const addressLocked = wallets.length > 0 && !useOtherWallet

  return (
    <section aria-labelledby="perfil-colecionador" className="flex flex-col gap-3">
      <h2 id="perfil-colecionador" className="text-fg text-[17px] leading-4 font-bold">
        Perfil do colecionador
      </h2>
      <div className="grid gap-3 md:grid-cols-2 md:gap-x-6">
        <TextField
          label="Nome de exibição"
          required
          error={errors.displayName?.message}
          inputClassName={inputClass}
          {...form.register('displayName')}
        />
        <TextField
          label="Nome de usuário"
          required
          autoComplete="username"
          error={errors.username?.message}
          inputClassName={inputClass}
          {...form.register('username')}
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
          readOnly={addressLocked}
          hint={addressLocked ? 'Preenchido com a carteira cadastrada' : undefined}
          error={errors.address?.message}
          inputClassName={cn(inputClass, addressLocked && 'text-fg-muted')}
          {...form.register('address')}
        />
        <TextField
          label="ENS ou carteira secundária"
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
          <label htmlFor="checkout-ens" className="text-fg text-base leading-5">
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
              id="checkout-ens"
              aria-required
              aria-invalid={errors.ensName ? true : undefined}
              aria-describedby={errors.ensName ? 'checkout-ens-error' : undefined}
              className={cn(
                'text-fg focus-visible:border-brand focus-visible:ring-brand/30 h-10 min-w-0 flex-1 rounded-[3px] border bg-transparent px-4 text-sm outline-none focus-visible:ring-2',
                errors.ensName ? 'border-danger' : 'border-surface-strong',
              )}
              {...form.register('ensName')}
            />
          </div>
          {errors.ensName ? (
            <p id="checkout-ens-error" role="alert" className="text-danger text-xs">
              {errors.ensName.message}
            </p>
          ) : null}
        </div>
      </div>

      <label className="text-fg mt-3 flex items-center gap-2 text-[15px] leading-5">
        <input
          type="checkbox"
          checked={useOtherWallet}
          onChange={(event) => onUseOtherWallet(event.target.checked)}
          className="accent-brand-strong border-brand-strong checked:bg-brand-strong size-[15px] appearance-none rounded-full border-2"
          disabled={wallets.length === 0}
        />
        Usar outra carteira?
      </label>

      <div className="mt-3 flex max-w-[350px] flex-col gap-3">
        <label htmlFor={noteId} className="text-fg text-[15px] leading-[15px]">
          Observação do colecionador (opcional)
        </label>
        <textarea
          id={noteId}
          rows={6}
          aria-invalid={errors.note ? true : undefined}
          className={cn(
            'text-fg focus-visible:border-brand focus-visible:ring-brand/30 h-[152px] w-full resize-none rounded-[3px] border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2',
            errors.note ? 'border-danger' : 'border-surface-strong',
          )}
          {...form.register('note')}
        />
        {errors.note ? (
          <p role="alert" className="text-danger text-xs">
            {errors.note.message}
          </p>
        ) : null}
      </div>
    </section>
  )
}
