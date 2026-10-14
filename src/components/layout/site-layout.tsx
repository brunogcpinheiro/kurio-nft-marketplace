import type { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'
import { Footer } from './footer'
import { Header } from './header'

type Props = { children: ReactNode; footer?: boolean; bottomNav?: boolean; header?: boolean }

export function SiteLayout({ children, footer = true, bottomNav = true, header = true }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header ? <Header /> : null}
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      {footer ? <Footer /> : null}
      {bottomNav ? <BottomNav /> : null}
    </div>
  )
}
