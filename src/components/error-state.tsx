import { DangerIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/api/errors'

type Props = {
  error?: unknown
  title?: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

export function ErrorState({
  error,
  title = 'Não foi possível carregar',
  onRetry,
  retrying,
  className,
}: Props) {
  return (
    <div
      role="alert"
      className={`bg-bg-elevated flex flex-col items-center justify-center gap-3 rounded-lg px-6 py-16 text-center ${className ?? ''}`}
    >
      <DangerIcon className="text-danger size-7" />
      <p className="text-fg text-lg font-bold">{title}</p>
      <p className="text-fg-muted max-w-md text-sm leading-6">{errorMessage(error)}</p>
      {onRetry ? (
        <Button onClick={onRetry} disabled={retrying} className="mt-2">
          {retrying ? 'Tentando novamente…' : 'Tentar novamente'}
        </Button>
      ) : null}
    </div>
  )
}
