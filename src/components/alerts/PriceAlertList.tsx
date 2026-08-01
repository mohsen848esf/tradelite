import { useState } from 'react'
import type { PriceAlert } from '@/types/market'
import { formatUsdPrice } from '@/utils/formatPrice'
import './PriceAlertList.css'

type PriceAlertListProps = {
  alerts: PriceAlert[]
  symbol: string
  onRemove: (id: string) => void
  onClearTriggered: () => void
}

export function PriceAlertList({ alerts, symbol, onRemove, onClearTriggered }: PriceAlertListProps) {
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const symbolAlerts = alerts.filter((alert) => alert.symbol === symbol)
  const activeAlerts = symbolAlerts.filter((alert) => !alert.triggered)
  const historyAlerts = symbolAlerts.filter((alert) => alert.triggered)

  const displayedAlerts = tab === 'active' ? activeAlerts : historyAlerts

  return (
    <div className="price-alert-list">
      <div className="price-alert-list__tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button
          type="button"
          className={`price-alert-list__tab-btn${tab === 'active' ? ' price-alert-list__tab-btn--active' : ''}`}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'active' ? '2px solid var(--border-active)' : '2px solid transparent',
            color: tab === 'active' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.25rem 0',
            cursor: 'pointer',
          }}
          onClick={() => setTab('active')}
        >
          Active ({activeAlerts.length})
        </button>
        <button
          type="button"
          className={`price-alert-list__tab-btn${tab === 'history' ? ' price-alert-list__tab-btn--active' : ''}`}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: tab === 'history' ? '2px solid var(--border-active)' : '2px solid transparent',
            color: tab === 'history' ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.25rem 0',
            cursor: 'pointer',
          }}
          onClick={() => setTab('history')}
        >
          History ({historyAlerts.length})
        </button>
      </div>

      {tab === 'history' && historyAlerts.length > 0 && (
        <button type="button" className="price-alert-list__clear" onClick={onClearTriggered}>
          Clear history ({historyAlerts.length})
        </button>
      )}

      {displayedAlerts.length === 0 ? (
        <p className="price-alert-list__empty">
          {tab === 'active' ? `No active alerts for ${symbol}` : `No alert history for ${symbol}`}
        </p>
      ) : (
        <ul className="price-alert-list__items">
          {displayedAlerts.map((alert) => (
            <li
              key={alert.id}
              className={`price-alert-list__item${alert.triggered ? ' price-alert-list__item--triggered' : ''}`}
            >
              <div>
                <span className="price-alert-list__direction">
                  {alert.direction === 'above' ? '↑ Above' : '↓ Below'} •{' '}
                  {new Date(alert.triggeredAt || alert.createdAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="price-alert-list__price">{formatUsdPrice(alert.targetPrice, 8)}</span>
                {alert.note && (
                  <div
                    className="price-alert-list__note"
                    style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}
                  >
                    {alert.note}
                  </div>
                )}
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
      )}
    </div>
  )
}
