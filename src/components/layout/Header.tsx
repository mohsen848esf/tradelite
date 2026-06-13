import type { ConnectionStatus } from '@/types/market'
import './Header.css'

type HeaderProps = {
  title?: string
  subtitle?: string
  status?: ConnectionStatus
  actions?: React.ReactNode
}

export function Header({ title = 'Tradelite', subtitle, status, actions }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo-wrapper">
          <span className="header__logo" aria-hidden="true">◈</span>
          {status && (
            <span
              className={`header__status-dot header__status-dot--${status}`}
              title={`Connection status: ${status}`}
            />
          )}
        </div>
        <div>
          <h1 className="header__title">{title}</h1>
          {subtitle && <p className="header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="header__actions">{actions}</div>}
    </header>
  )
}
