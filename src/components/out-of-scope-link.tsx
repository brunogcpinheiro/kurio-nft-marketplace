import type { ComponentProps } from 'react'
import { notifyOutOfScope } from '@/lib/out-of-scope'

type Props = Omit<ComponentProps<'a'>, 'href' | 'onClick'> & { label?: string }

export function OutOfScopeLink({ label, children, ...props }: Props) {
  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault()
        notifyOutOfScope(label ?? (typeof children === 'string' ? children : undefined))
      }}
      {...props}
    >
      {children}
    </a>
  )
}
