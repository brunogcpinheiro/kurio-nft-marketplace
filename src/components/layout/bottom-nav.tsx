import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { HeartIcon, HomeIcon, ScanIcon, ShopIcon, UserIcon } from '@/components/icons'
import { useCartCount } from '@/features/cart/queries'

const itemClass = 'flex size-11 items-center justify-center rounded-full text-fg-muted'
const activeClass = 'text-brand'

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const count = useCartCount()
  const is = (prefix: string) => (prefix === '/' ? pathname === '/' : pathname.startsWith(prefix))

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative mx-auto h-[94px] max-w-[480px]">
        <div className="bg-bg-elevated absolute inset-x-0 bottom-0 h-[94px] rounded-t-[40px] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]" />
        <Link
          to="/"
          hash="catalogo"
          aria-label="Explorar catálogo"
          className="bg-brand-strong/35 text-fg absolute top-[-31px] left-1/2 flex size-[65px] -translate-x-1/2 items-center justify-center rounded-full backdrop-blur"
        >
          <ScanIcon className="size-7" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 flex h-[94px] items-center justify-between px-6">
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
