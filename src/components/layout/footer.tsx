import { Link } from '@tanstack/react-router'
import { type ComponentType, useState } from 'react'
import {
  SocialFacebookIcon,
  SocialInstagramIcon,
  SocialLinkedinIcon,
  SocialTwitterIcon,
  SocialYoutubeIcon,
  type IconProps,
} from '@/components/icons'
import { OutOfScopeLink } from '@/components/out-of-scope-link'
import { PageContainer } from '@/components/layout/page-container'
import { notifyOutOfScope } from '@/lib/out-of-scope'

const highlights = [
  {
    letter: 'W',
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    letter: 'C',
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    letter: 'D',
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

const social: { label: string; Icon: ComponentType<IconProps> }[] = [
  { label: 'Facebook', Icon: SocialFacebookIcon },
  { label: 'Instagram', Icon: SocialInstagramIcon },
  { label: 'Twitter', Icon: SocialTwitterIcon },
  { label: 'LinkedIn', Icon: SocialLinkedinIcon },
  { label: 'YouTube', Icon: SocialYoutubeIcon },
]

const collections = [
  { label: 'Arte digital', slug: 'arte-digital' },
  { label: 'Fotografia', slug: 'fotografia' },
  { label: 'Música', slug: 'musica' },
  { label: 'Arte 3D', slug: 'arte-3d' },
  { label: 'Utilidade', slug: 'utilidade' },
]

const linkClass = 'text-fg text-sm leading-[30px] hover:text-brand'

export function Footer() {
  const [email, setEmail] = useState('')
  return (
    <footer className="mt-16 pb-28 md:mt-24 md:pb-0">
      <PageContainer>
        <div className="bg-bg-elevated grid gap-8 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-[264px_264px_264px_1fr] xl:gap-0">
          {highlights.map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col gap-3 xl:px-4 ${index > 0 ? 'xl:border-brand-strong xl:border-l' : ''}`}
            >
              <span
                aria-hidden="true"
                className="bg-brand-strong text-bg flex size-[74px] items-center justify-center rounded-full text-2xl font-bold"
              >
                {item.letter}
              </span>
              <h3 className="text-fg text-[17px] leading-4 font-bold">{item.title}</h3>
              <p className="text-fg-muted max-w-[204px] text-sm leading-[22px]">{item.text}</p>
            </div>
          ))}
          <form
            className="xl:border-brand-strong flex flex-col gap-3 xl:border-l xl:pl-4"
            onSubmit={(event) => {
              event.preventDefault()
              notifyOutOfScope('A newsletter')
            }}
          >
            <label htmlFor="newsletter-email" className="text-fg text-lg leading-4 font-bold">
              Antecipe-se ao próximo lançamento
            </label>
            <div className="bg-surface-strong flex h-10 w-full max-w-[325px] overflow-hidden rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="digite seu e-mail..."
                className="text-fg placeholder:text-fg-subtle min-w-0 flex-1 bg-transparent px-3 text-sm"
              />
              <button type="submit" className="bg-brand-strong text-bg px-4 text-lg font-bold">
                Enviar
              </button>
            </div>
            <p className="text-fg-muted max-w-[325px] text-[13px] leading-[22px]">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </form>
        </div>

        <div className="bg-surface-strong grid gap-3 px-6 py-6 md:px-8 xl:grid-cols-4 xl:gap-[92px]">
          <span className="text-fg text-sm font-bold tracking-[1.4px]">KURIO</span>
          <p className="text-fg text-sm leading-[22px]">
            Feito para colecionadores,
            <br />
            criadores e cultura
          </p>
          <a href="mailto:contato@email.com" className="text-fg text-sm leading-[22px]">
            contato@email.com
          </a>
          <a href="tel:+551140028922" className="text-fg text-sm leading-[22px]">
            +55 11 4002 8922
          </a>
        </div>

        <div className="bg-bg-elevated mt-1.5 grid gap-8 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-[178px_178px_178px_1fr] xl:gap-[124px]">
          <div>
            <h3 className="text-fg text-lg leading-4 font-bold">Meu perfil</h3>
            <ul className="mt-2 flex flex-col">
              <li>
                <Link to="/perfil" className={linkClass}>
                  Meu perfil
                </Link>
              </li>
              <li>
                <OutOfScopeLink className={linkClass}>Minha coleção</OutOfScopeLink>
              </li>
              <li>
                <OutOfScopeLink className={linkClass}>Atividade</OutOfScopeLink>
              </li>
              <li>
                <OutOfScopeLink className={linkClass}>Estúdio do criador</OutOfScopeLink>
              </li>
              <li>
                <Link to="/perfil/favoritos" className={linkClass}>
                  Lista de interesse
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-fg text-lg leading-4 font-bold">Central de ajuda</h3>
            <ul className="mt-2 flex flex-col">
              {[
                'Central de ajuda',
                'Como comprar NFTs',
                'Carteira e segurança',
                'Política do mercado',
                'Denunciar item',
              ].map((label) => (
                <li key={label}>
                  <OutOfScopeLink className={linkClass}>{label}</OutOfScopeLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-fg text-lg leading-4 font-bold">Coleções</h3>
            <ul className="mt-2 flex flex-col">
              {collections.map((item) => (
                <li key={item.slug}>
                  <Link
                    to="/"
                    search={{ category: item.slug }}
                    hash="catalogo"
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-fg text-lg leading-4 font-bold">Redes sociais</h3>
              <ul className="mt-5 flex gap-2.5">
                {social.map(({ label, Icon }) => (
                  <li key={label}>
                    <OutOfScopeLink
                      label={label}
                      aria-label={label}
                      className="border-brand-strong text-brand-strong flex size-[30px] items-center justify-center rounded border"
                    >
                      <Icon className="size-4" />
                    </OutOfScopeLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-fg text-lg leading-4 font-bold">Carteiras compatíveis</h3>
              <p className="bg-surface-strong text-brand mt-3 inline-flex h-[26px] items-center rounded-md border border-[#55321f] px-2.5 text-[9px] font-bold tracking-[0.1px]">
                METAMASK&nbsp;&nbsp;•&nbsp;&nbsp;WALLETCONNECT&nbsp;&nbsp;•&nbsp;&nbsp;COINBASE
              </p>
            </div>
          </div>
        </div>
        <p className="text-fg py-4 text-center text-sm leading-[30px]">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </PageContainer>
    </footer>
  )
}
