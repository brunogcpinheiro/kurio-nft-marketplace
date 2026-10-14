import type { ReactNode } from 'react'
import { cn } from 'cn'
import { BottomNav } from './bottom-nav'
import { Footer } from './footer'
import { Header } from './header'

type Props = { children: ReactNode; footer?: boolean; bottomNav?: boolean; header?: boolean }

export function SiteLayout({ children, footer = true, bottomNav = true, header = true }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header ? <Header /> : null}
      <main id="conteudo" className={cn('flex-1', bottomNav && !footer && 'pb-28 md:pb-0')}>
        {children}
      </main>
      {footer ? <Footer /> : null}
      {bottomNav ? <BottomNav /> : null}
    </div>
  )
}
