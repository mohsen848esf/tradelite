import type { ReactNode } from 'react'
import './SidebarPanel.css'

type SidebarPanelProps = {
  title: string
  suffix?: ReactNode
  children: ReactNode
}

export function SidebarPanel({ title, suffix, children }: SidebarPanelProps) {
  return (
    <section className="sidebar-panel">
      <div className="sidebar-panel__header">
        <h2 className="sidebar-panel__title">{title}</h2>
        {suffix && <div className="sidebar-panel__suffix">{suffix}</div>}
      </div>
      <div className="sidebar-panel__content">{children}</div>
    </section>
  )
}
