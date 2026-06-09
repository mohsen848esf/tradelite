import type { ReactNode } from 'react'
import './AppLayout.css'

type AppLayoutProps = {
  header: ReactNode
  sidebar?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AppLayout({ header, sidebar, children, footer }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <div className="app-layout__header">{header}</div>
      <div className="app-layout__body">
        {sidebar && <aside className="app-layout__sidebar">{sidebar}</aside>}
        <section className="app-layout__content">{children}</section>
      </div>
      {footer && <footer className="app-layout__footer">{footer}</footer>}
    </div>
  )
}
