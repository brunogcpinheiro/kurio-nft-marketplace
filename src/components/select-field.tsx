import { useId } from 'react'
import { cn } from 'cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Option = { value: string; label: string }

type Props = {
  label: string
  value: string | undefined
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  error?: string
  required?: boolean
  hideLabel?: boolean
  className?: string
  triggerClassName?: string
  name?: string
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  hideLabel,
  className,
  triggerClassName,
  name,
}: Props) {
  const id = useId()
  const errorId = `${id}-error`
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
      <Select value={value || undefined} onValueChange={onChange} name={name}>
        <SelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={required || undefined}
          className={cn(
            'text-fg data-placeholder:text-fg-subtle focus-visible:border-brand focus-visible:ring-brand/30 [&_svg]:text-fg-muted h-10 w-full rounded-[3px] border bg-transparent px-3 text-sm shadow-none focus-visible:ring-2 data-[size=default]:h-10',
            error ? 'border-danger' : 'border-surface-strong',
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p id={errorId} role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}
