import './Header.css'

type HeaderProps = {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title = 'Tradelite', subtitle, actions }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden="true">◈</span>
        <div>
          <h1 className="header__title">{title}</h1>
          {subtitle && <p className="header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="header__actions">{actions}</div>}
    </header>
  )
}
