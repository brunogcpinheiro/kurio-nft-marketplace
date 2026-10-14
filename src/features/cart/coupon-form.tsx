import { useId, useState } from 'react'
import { cn } from 'cn'
import { applyFieldErrors, errorMessage, getApiError } from '@/api/errors'
import { CloseIcon } from '@/components/icons'
import { useApplyCoupon, useRemoveCoupon } from './mutations'

type Props = {
  couponCode: string | null
  status?: 'applied' | 'invalid' | 'expired' | null
  variant: 'desktop' | 'mobile'
}

export function CouponForm({ couponCode, status, variant }: Props) {
  const id = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const apply = useApplyCoupon()
  const remove = useRemoveCoupon()
  const pending = apply.isPending || remove.isPending

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Digite um código')
      return
    }
    setError(null)
    apply.mutate(trimmed, {
      onSuccess: () => setCode(''),
      onError: (err) => {
        let message: string | null = null
        applyFieldErrors(
          err,
          (_field, options) => {
            message = options?.message ?? null
          },
          ['code'],
        )
        setError(message ?? getApiError(err)?.message ?? errorMessage(err))
      },
    })
  }

  if (couponCode) {
    const expired = status === 'expired' || status === 'invalid'
    return (
      <div className="flex flex-col gap-2">
        {variant === 'desktop' ? (
          <p className="text-fg text-sm font-bold">Código promocional</p>
        ) : null}
        <div
          className={cn(
            'flex items-center justify-between gap-3 border px-3 text-sm',
            variant === 'desktop' ? 'h-10 rounded-[3px]' : 'h-[50px] rounded-full px-4',
            expired ? 'border-danger text-danger' : 'border-brand-strong text-fg',
          )}
          role="status"
        >
          <span>
            Cupom <strong>{couponCode}</strong>
            {expired ? ` ${status === 'expired' ? 'expirou' : 'é inválido'}` : ' aplicado'}
          </span>
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={pending}
            aria-label={`Remover cupom ${couponCode}`}
            className="text-fg-subtle flex size-6 items-center justify-center"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2" aria-busy={pending}>
      <label
        htmlFor={id}
        className={cn('text-fg text-sm font-bold', variant === 'mobile' && 'sr-only')}
      >
        Código promocional
      </label>
      <div
        className={cn(
          'flex overflow-hidden border',
          variant === 'desktop'
            ? 'h-10 rounded-[3px]'
            : 'h-[50px] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)]',
          error
            ? 'border-danger'
            : variant === 'desktop'
              ? 'border-brand-strong'
              : 'border-surface-strong',
        )}
      >
        <input
          id={id}
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Digite o código promocional..."
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'text-fg placeholder:text-fg-subtle min-w-0 flex-1 bg-transparent outline-none',
            variant === 'desktop' ? 'px-2 text-xs' : 'px-4 text-[13px]',
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            'shrink-0 text-[15px] font-bold disabled:opacity-60',
            variant === 'desktop' ? 'bg-brand-strong text-bg w-[102px]' : 'text-fg w-[97px]',
          )}
        >
          {apply.isPending ? '…' : 'Aplicar'}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </form>
  )
}
