import { SYMBOLS } from '@/constants/market'
import { useWatchlist } from '@/hooks/useWatchlist'
import './SymbolSelector.css'

type SymbolSelectorProps = {
  value: string
  onChange: (symbol: string) => void
}

export function SymbolSelector({ value, onChange }: SymbolSelectorProps) {
  const { toggleWatchlist, isWatched } = useWatchlist()

  return (
    <div className="symbol-selector" role="listbox" aria-label="Select trading pair">
      {SYMBOLS.map((pair) => {
        const isActive = pair.symbol === value
        const watched = isWatched(pair.symbol)

        return (
          <div
            key={pair.symbol}
            className={`symbol-selector__wrapper${isActive ? ' symbol-selector__wrapper--active' : ''}`}
          >
            <button
              type="button"
              role="option"
              aria-selected={isActive}
              className="symbol-selector__item"
              onClick={() => onChange(pair.symbol)}
              style={{ flex: 1, paddingRight: '0.25rem' }}
            >
              <span className="symbol-selector__label">{pair.label}</span>
              <span className="symbol-selector__symbol">{pair.symbol}</span>
            </button>
            <button
              type="button"
              className={`symbol-selector__star-btn ${watched ? 'symbol-selector__star-btn--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                toggleWatchlist(pair.symbol)
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                color: watched ? '#e3b341' : '#30363d',
                padding: '0 0.75rem',
                transition: 'color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (!watched) e.currentTarget.style.color = '#8b949e'
              }}
              onMouseLeave={(e) => {
                if (!watched) e.currentTarget.style.color = '#30363d'
              }}
            >
              {watched ? '★' : '☆'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
