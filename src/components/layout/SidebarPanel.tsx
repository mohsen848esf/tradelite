import type { ReactNode } from 'react'
import './SidebarPanel.css'

type SidebarPanelProps = {
  title: string
  children: ReactNode
}

export function SidebarPanel({ title, children }: SidebarPanelProps) {
  return (
    <section className="sidebar-panel">
      <h2 className="sidebar-panel__title">{title}</h2>
      <div className="sidebar-panel__content">{children}</div>
    </section>
  )
}
