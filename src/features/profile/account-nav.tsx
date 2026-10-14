import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { TagIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import {
  ActivityIcon,
  DangerIcon,
  DownloadIcon,
  HeartIcon,
  LocationIcon,
  LoginIcon,
  UserIcon,
  type IconProps,
} from '@/components/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSessionActions } from '@/features/auth/use-session'
import { SelectField } from '@/components/select-field'

type Item = {
  label: string
  to?: '/perfil' | '/perfil/carteiras' | '/perfil/favoritos'
  Icon: ComponentType<IconProps>
}

const items: Item[] = [
  { label: 'Dados do perfil', to: '/perfil', Icon: UserIcon },
  { label: 'Carteiras', to: '/perfil/carteiras', Icon: LocationIcon },
  { label: 'Atividade', Icon: ActivityIcon },
  { label: 'Lista de interesse', to: '/perfil/favoritos', Icon: HeartIcon },
  { label: 'Ofertas', Icon: (props) => <TagIcon strokeWidth={1.5} {...props} /> },
  { label: 'Arquivos baixados', Icon: DownloadIcon },
  { label: 'Suporte', Icon: DangerIcon },
]

export function AccountNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const { signOut } = useSessionActions()
  const current = items.find((item) => item.to === pathname)?.to ?? '/perfil'

  async function logout() {
    await signOut()
    void navigate({ to: '/' })
  }

  return (
    <>
      <nav
        aria-label="Minha conta"
        className="bg-bg-elevated hidden w-[310px] shrink-0 flex-col self-start py-2 md:flex"
      >
        <p className="text-fg px-2.5 py-2.5 text-lg leading-4 font-bold">Meu perfil</p>
        <ul>
          {items.map(({ label, to, Icon }) => {
            const active = to === pathname
            const content = (
              <>
                <Icon className="size-[18px] shrink-0" />
                <span className="text-[15px] leading-4">{label}</span>
              </>
            )
            return (
              <li key={label}>
                {to ? (
                  <Link
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-[45px] items-center gap-3 border-l-[3px] px-4',
                      active
                        ? 'border-brand-strong text-brand'
                        : 'text-brand-strong hover:text-brand border-transparent',
                    )}
                  >
                    {content}
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="text-brand-strong/60 flex h-[45px] cursor-not-allowed items-center gap-3 border-l-[3px] border-transparent px-4"
                        aria-disabled="true"
                        tabIndex={0}
                      >
                        {content}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Em breve</TooltipContent>
                  </Tooltip>
                )}
              </li>
            )
          })}
        </ul>
        <div className="border-brand-strong/30 mt-0 border-t px-4">
          <button
            type="button"
            onClick={() => void logout()}
            className="text-brand flex h-10 items-center gap-2 text-[15px] font-bold"
          >
            <LoginIcon className="size-[18px]" />
            Sair
          </button>
        </div>
      </nav>

      <div className="flex items-end gap-3 md:hidden">
        <SelectField
          className="flex-1"
          label="Seção da conta"
          hideLabel
          value={current}
          onChange={(value) => void navigate({ to: value as NonNullable<Item['to']> })}
          options={items.filter((i) => i.to).map((i) => ({ value: i.to!, label: i.label }))}
        />
        <button
          type="button"
          onClick={() => void logout()}
          className="text-brand flex h-10 items-center gap-2 text-[15px] font-bold"
        >
          <LoginIcon className="size-[18px]" />
          Sair
        </button>
      </div>
    </>
  )
}
