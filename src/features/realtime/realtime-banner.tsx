import { CloseIcon } from '@/components/icons'
import { realtimeNotices, useRealtimeNotices } from './notices'

export function RealtimeBanner({ className }: { className?: string }) {
  const notices = useRealtimeNotices()
  return (
    <div aria-live="polite" aria-atomic="false" className={className}>
      {notices.map((notice) => (
        <div
          key={notice.id}
          role="status"
          data-testid="realtime-notice"
          className="border-brand-strong/50 bg-bg-elevated text-fg mb-2 flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm"
        >
          <span>
            <span className="text-brand font-bold">Atualização em tempo real:</span>{' '}
            {notice.message}
          </span>
          <button
            type="button"
            onClick={() => realtimeNotices.dismiss(notice.id)}
            aria-label="Fechar aviso"
            className="text-fg-subtle flex size-5 shrink-0 items-center justify-center"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
