import type { ReactNode } from 'react'

type Props = { title: string; description?: string; action?: ReactNode; className?: string }

export function EmptyState({ title, description, action, className }: Props) {
  return (
    <div
      role="status"
      className={`bg-bg-elevated flex flex-col items-center justify-center gap-3 rounded-lg px-6 py-16 text-center ${className ?? ''}`}
    >
      <p className="text-fg text-lg font-bold">{title}</p>
      {description ? (
        <p className="text-fg-muted max-w-md text-sm leading-6">{description}</p>
      ) : null}
      {action}
    </div>
  )
}
