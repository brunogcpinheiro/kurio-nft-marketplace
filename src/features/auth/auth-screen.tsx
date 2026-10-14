import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from 'cn'
import { catalogDefaults } from '@/api/schemas'
import { CloseIcon } from '@/components/icons'
import { HomeContent } from '@/features/catalog/home-content'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { desktopQuery, useMediaQuery } from '@/lib/use-media-query'
import { useSession } from './use-session'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { safeRedirect } from './redirect'
import { SocialButtons } from './social-buttons'

type Props = { mode: 'login' | 'register'; redirect?: string }

const copy = {
  login: {
    description: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
    mobileTitle: 'Entrar',
    switchText: 'Novo na Kurio?',
    switchLabel: 'Crie uma conta',
  },
  register: {
    description: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
    mobileTitle: 'Criar perfil de colecionador',
    switchText: 'Já tem uma conta?',
    switchLabel: 'Entre',
  },
}

export function AuthScreen({ mode, redirect }: Props) {
  const navigate = useNavigate()
  const { isAuthenticated } = useSession()
  const desktop = useMediaQuery(desktopQuery)
  const other = mode === 'login' ? '/cadastro' : '/login'
  const text = copy[mode]

  useEffect(() => {
    if (isAuthenticated) void navigate({ to: safeRedirect(redirect), replace: true })
  }, [isAuthenticated, navigate, redirect])

  function close() {
    void navigate({ to: '/' }).then(() =>
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[data-login-link]')?.focus(),
      ),
    )
  }

  const tabs = (
    <div className="flex items-center justify-center gap-2 text-xl leading-4 font-medium">
      <Link
        to="/login"
        search={{ redirect }}
        className={mode === 'login' ? 'text-brand' : 'text-fg'}
        aria-current={mode === 'login' ? 'page' : undefined}
      >
        Entrar
      </Link>
      <span className="bg-danger h-5 w-px" aria-hidden="true" />
      <Link
        to="/cadastro"
        search={{ redirect }}
        className={mode === 'register' ? 'text-brand' : 'text-fg'}
        aria-current={mode === 'register' ? 'page' : undefined}
      >
        Criar conta
      </Link>
    </div>
  )

  const form =
    mode === 'login' ? (
      <LoginForm redirect={redirect} layout="dialog" />
    ) : (
      <RegisterForm redirect={redirect} layout="dialog" />
    )
  const pageForm =
    mode === 'login' ? (
      <LoginForm redirect={redirect} layout="page" />
    ) : (
      <RegisterForm redirect={redirect} layout="page" />
    )

  if (desktop) {
    return (
      <>
        <HomeContent
          search={{ ...catalogDefaults }}
          update={() => undefined}
          reset={() => undefined}
        />
        <Dialog open onOpenChange={(open) => !open && close()}>
          <DialogContent
            showCloseButton={false}
            className={cn(
              'bg-bg-elevated gap-0 overflow-hidden border-0 p-0 sm:max-w-[500px]',
              mode === 'login' ? 'rounded-none' : 'rounded-lg',
            )}
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              ;(event.currentTarget as HTMLElement).querySelector('input')?.focus()
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="text-brand-strong absolute top-3 right-3 flex size-6 items-center justify-center"
            >
              <CloseIcon className="size-[18px]" />
            </button>
            <div className="flex flex-col gap-10 px-12 pt-12">
              <DialogTitle asChild>
                <h1 className="sr-only">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
              </DialogTitle>
              {tabs}
              <DialogDescription className="text-fg text-center text-[13px] leading-4">
                {text.description}
              </DialogDescription>
            </div>
            <div className="px-20 pt-6">{form}</div>
            <div className="px-20 pt-6 pb-24">
              <SocialButtons compact={mode === 'login'} />
            </div>
            <div className="bg-brand-strong h-2.5 w-full" aria-hidden="true" />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col px-7 pt-20 pb-6">
      <h1 className="text-fg py-[47px] text-center text-[32px] leading-[42px] font-bold tracking-[3.2px]">
        KURIO
      </h1>
      <h2
        className={cn(
          'text-fg mt-10 text-center leading-4 font-bold',
          mode === 'login' ? 'text-xl' : 'text-lg',
        )}
      >
        {text.mobileTitle}
      </h2>
      <div className="mt-10">{pageForm}</div>
      <div className="mt-10">
        <SocialButtons />
      </div>
      <p className="text-fg-muted mt-10 text-center text-[15px] leading-5">
        {text.switchText}{' '}
        <Link to={other} search={{ redirect }} className="text-brand">
          {text.switchLabel}
        </Link>
      </p>
    </div>
  )
}
