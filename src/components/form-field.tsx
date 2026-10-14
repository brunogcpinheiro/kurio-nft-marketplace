import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from 'cn'
import { EyeIcon } from 'lucide-react'
import { EyeOffIcon } from '@/components/icons'

type BaseProps = {
  label: string
  error?: string
  hideLabel?: boolean
  required?: boolean
  hint?: string
  className?: string
  inputClassName?: string
  trailing?: ReactNode
}

type TextFieldProps = BaseProps & Omit<ComponentProps<'input'>, 'className' | 'id'>

export function TextField({
  label,
  error,
  hideLabel,
  required,
  hint,
  className,
  inputClassName,
  trailing,
  ...props
}: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className={cn('text-fg text-base leading-5', hideLabel && 'sr-only')}>
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(
            'text-fg placeholder:text-fg-subtle focus-visible:border-brand focus-visible:ring-brand/30 h-10 w-full rounded-[5px] border bg-transparent px-4 text-sm outline-none focus-visible:ring-2',
            error ? 'border-danger' : 'border-surface-strong',
            trailing && 'pr-11',
            inputClassName,
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-fg-subtle text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-danger flex items-center gap-1 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function PasswordField(props: Omit<TextFieldProps, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="text-fg-subtle flex size-6 items-center justify-center"
        >
          {visible ? (
            <EyeIcon className="size-5" strokeWidth={1.5} />
          ) : (
            <EyeOffIcon className="size-[22px]" />
          )}
        </button>
      }
    />
  )
}
