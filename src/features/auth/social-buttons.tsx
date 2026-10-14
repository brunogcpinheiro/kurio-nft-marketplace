import { FacebookIcon, GoogleIcon } from '@/components/icons'
import { notifyOutOfScope } from '@/lib/out-of-scope'

export function SocialButtons({ compact = false }: { compact?: boolean }) {
  const button =
    'border-surface-strong text-fg-muted flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border text-[13px] font-medium'
  return (
    <div className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
      <div className="text-fg flex items-center gap-3 text-[13px]">
        <span className="bg-surface-strong h-px flex-1" aria-hidden="true" />
        Ou continue com
        <span className="bg-surface-strong h-px flex-1" aria-hidden="true" />
      </div>
      <div className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
        <button
          type="button"
          className={button}
          onClick={() => notifyOutOfScope('O login com Google')}
        >
          <GoogleIcon className="size-5" />
          Continuar com Google
        </button>
        <button
          type="button"
          className={button}
          onClick={() => notifyOutOfScope('O login com Facebook')}
        >
          <FacebookIcon className="size-5" />
          Continuar com Facebook
        </button>
      </div>
    </div>
  )
}
