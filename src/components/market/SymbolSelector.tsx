import { SYMBOLS } from '@/constants/market'
import './SymbolSelector.css'

type SymbolSelectorProps = {
  value: string
  onChange: (symbol: string) => void
}

export function SymbolSelector({ value, onChange }: SymbolSelectorProps) {
  return (
    <div className="symbol-selector" role="listbox" aria-label="Select trading pair">
      {SYMBOLS.map((pair) => {
        const isActive = pair.symbol === value

        return (
          <button
            key={pair.symbol}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`symbol-selector__item${isActive ? ' symbol-selector__item--active' : ''}`}
            onClick={() => onChange(pair.symbol)}
          >
            <span className="symbol-selector__label">{pair.label}</span>
            <span className="symbol-selector__symbol">{pair.symbol}</span>
          </button>
        )
      })}
    </div>
  )
}
