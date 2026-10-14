import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { HeartIcon, HomeIcon, ScanIcon, ShopIcon, UserIcon } from '@/components/icons'
import { useStoredSession } from '@/features/auth/session'
import { useCartCount } from '@/features/cart/queries'

const itemClass = 'flex size-11 items-center justify-center rounded-full text-fg-muted'
const activeClass = 'text-brand'

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const count = useCartCount()
  const stored = useStoredSession()
  const navigate = useNavigate()
  const is = (prefix: string) => (prefix === '/' ? pathname === '/' : pathname.startsWith(prefix))

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative mx-auto h-[95px] max-w-[480px]">
        <div
          className="absolute inset-x-0 bottom-0 flex h-[95px] [filter:drop-shadow(0_-10px_15px_rgba(10,6,4,0.45))]"
          aria-hidden="true"
        >
          <div className="bg-bg-elevated flex-1 rounded-tl-[29px]" />
          <svg className="fill-bg-elevated h-[95px] w-[176px] shrink-0" viewBox="119 40 176 95">
            <path d="M282.85 40C269.09 40 256.87 48.2 251.02 60.65C243.26 77.17 226.46 88.62 207 88.62C187.54 88.62 170.74 77.18 162.98 60.65C157.13 48.2 144.9 40 131.15 40H28.93C12.95 40 0 52.95 0 68.93V134.95H414V68.93C414 52.95 401.05 40 385.07 40H282.85Z" />
          </svg>
          <div className="bg-bg-elevated flex-1 rounded-tr-[29px]" />
        </div>
        <Link
          to="/perfil"
          onClick={(event) => {
            if (stored) return
            event.preventDefault()
            void navigate({ to: '/login', search: { redirect: '/perfil' } })
          }}
          aria-label="Minha conta"
          className="bg-brand-strong/85 text-fg absolute top-[-30px] left-1/2 z-10 flex size-[65px] -translate-x-1/2 items-center justify-center rounded-full"
        >
          <ScanIcon className="size-7" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 flex h-[95px] items-center justify-between px-6">
          <Link
            to="/"
            className={cn(itemClass, is('/') && activeClass)}
            aria-label="Início"
            aria-current={is('/') ? 'page' : undefined}
          >
            <HomeIcon className="size-5" />
          </Link>
          <Link
            to="/perfil/favoritos"
            className={cn(itemClass, is('/perfil/favoritos') && activeClass)}
            aria-label="Favoritos"
          >
            <HeartIcon className="size-5" />
          </Link>
          <span className="w-16" aria-hidden="true" />
          <Link
            to="/carrinho"
            onClick={(event) => {
              if (stored) return
              event.preventDefault()
              void navigate({ to: '/login', search: { redirect: '/carrinho' } })
            }}
            className={cn(itemClass, 'relative', is('/carrinho') && activeClass)}
            aria-label={`Carrinho, ${count} itens`}
          >
            <ShopIcon className="size-5" />
            {count > 0 ? (
              <span
                aria-hidden="true"
                className="bg-brand-strong text-bg absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium"
              >
                {count > 9 ? '9+' : count}
              </span>
            ) : null}
          </Link>
          <Link
            to="/perfil"
            className={cn(itemClass, is('/perfil') && !is('/perfil/favoritos') && activeClass)}
            aria-label="Perfil"
          >
            <UserIcon className="size-5" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
