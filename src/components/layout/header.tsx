import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { CartIcon, LoginIcon, SearchIcon, UserIcon } from '@/components/icons'
import { OutOfScopeLink } from '@/components/out-of-scope-link'
import { PageContainer } from '@/components/layout/page-container'
import { useSession } from '@/features/auth/use-session'
import { useCartCount } from '@/features/cart/queries'

type Section = 'home' | 'market' | 'none'

function sectionFor(pathname: string): Section {
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/cadastro' ||
    pathname.startsWith('/perfil')
  )
    return 'home'
  if (
    pathname.startsWith('/nft') ||
    pathname.startsWith('/carrinho') ||
    pathname.startsWith('/pagamento') ||
    pathname.startsWith('/pedido')
  )
    return 'market'
  return 'none'
}

const navClass =
  'relative flex h-[45px] items-start pt-0 text-base leading-[21px] whitespace-nowrap'
const activeClass =
  'text-brand font-bold after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-brand-strong'

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const section = sectionFor(pathname)
  const { user, isAuthenticated } = useSession()
  const count = useCartCount()

  return (
    <header className="hidden md:block">
      <PageContainer className="pt-6">
        <div className="border-brand-strong/30 flex h-[45px] items-start justify-between border-b">
          <Link
            to="/"
            className="text-fg flex h-[34px] items-center text-sm font-bold tracking-[1.4px]"
            aria-label="Kurio, página inicial"
          >
            KURIO
          </Link>
          <nav aria-label="Principal" className="flex gap-10">
            <Link to="/" className={cn(navClass, section === 'home' && activeClass)}>
              Início
            </Link>
            <Link
              to="/"
              hash="catalogo"
              className={cn(navClass, section === 'market' && activeClass)}
            >
              Mercado
            </Link>
            <OutOfScopeLink className={navClass}>Criadores</OutOfScopeLink>
            <OutOfScopeLink className={navClass}>Aprenda</OutOfScopeLink>
          </nav>
          <div className="flex h-[35px] items-center gap-7">
            <HeaderSearch />
            <Link
              to="/carrinho"
              className="relative flex size-6 items-center"
              aria-label={`Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
            >
              <CartIcon className="size-6" />
              {count > 0 ? (
                <span
                  aria-hidden="true"
                  className="bg-brand-strong text-bg border-bg absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full border-2 text-[10px] leading-none font-medium"
                >
                  {count > 9 ? '9+' : count}
                </span>
              ) : null}
            </Link>
            {isAuthenticated && user ? (
              <Link
                to="/perfil"
                className="bg-brand-strong text-bg flex h-[35px] items-center gap-1 rounded-md px-2.5 text-base font-medium"
              >
                <UserIcon className="size-5" />
                {user.displayName.split(' ')[0]}
              </Link>
            ) : (
              <Link
                to="/login"
                search={{ redirect: pathname === '/' ? undefined : pathname }}
                data-login-link
                className="bg-brand-strong text-bg flex h-[35px] w-[100px] items-center justify-center gap-1 rounded-md text-base font-medium"
              >
                <LoginIcon className="size-5" />
                Entrar
              </Link>
            )}
          </div>
        </div>
      </PageContainer>
    </header>
  )
}

function HeaderSearch() {
  const navigate = useNavigate()
  const search = useRouterState({ select: (s) => s.location.search as { q?: string } })
  const [open, setOpen] = useState(Boolean(search.q))
  const [value, setValue] = useState(search.q ?? '')
  const [seen, setSeen] = useState(search.q)
  const inputRef = useRef<HTMLInputElement>(null)

  if (search.q !== seen) {
    setSeen(search.q)
    setValue(search.q ?? '')
  }

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function submit(term: string) {
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, q: term.trim() || undefined, page: 1 }),
    })
  }

  return (
    <form
      role="search"
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        submit(value)
      }}
    >
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar NFTs"
        aria-label="Buscar NFTs"
        className={cn(
          'bg-bg-elevated text-fg placeholder:text-fg-subtle h-8 rounded-md px-3 text-sm transition-[width] duration-200',
          open ? 'w-52' : 'w-0 px-0 opacity-0',
        )}
        tabIndex={open ? 0 : -1}
      />
      <button
        type="button"
        aria-label={open ? 'Fechar busca' : 'Abrir busca'}
        aria-expanded={open}
        className="text-fg flex size-5 items-center justify-center"
        onClick={() => {
          if (open && value.trim()) submit(value)
          setOpen((v) => !v)
        }}
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  )
}
