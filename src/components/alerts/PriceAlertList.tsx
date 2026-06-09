import type { PriceAlert } from '@/types/market'
import './PriceAlertList.css'

type PriceAlertListProps = {
  alerts: PriceAlert[]
  symbol: string
  onRemove: (id: string) => void
  onClearTriggered: () => void
}

export function PriceAlertList({ alerts, symbol, onRemove, onClearTriggered }: PriceAlertListProps) {
  const symbolAlerts = alerts.filter((alert) => alert.symbol === symbol)
  const triggeredCount = symbolAlerts.filter((alert) => alert.triggered).length

  if (symbolAlerts.length === 0) {
    return <p className="price-alert-list__empty">No alerts for {symbol}</p>
  }

  return (
    <div className="price-alert-list">
      {triggeredCount > 0 && (
        <button type="button" className="price-alert-list__clear" onClick={onClearTriggered}>
          Clear triggered ({triggeredCount})
        </button>
      )}

      <ul className="price-alert-list__items">
        {symbolAlerts.map((alert) => (
          <li
            key={alert.id}
            className={`price-alert-list__item${alert.triggered ? ' price-alert-list__item--triggered' : ''}`}
          >
            <div>
              <span className="price-alert-list__direction">
                {alert.direction === 'above' ? '↑ Above' : '↓ Below'}
              </span>
              <span className="price-alert-list__price">
                ${alert.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </span>
            </div>
            <button
              type="button"
              className="price-alert-list__remove"
              onClick={() => onRemove(alert.id)}
              aria-label="Remove alert"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
