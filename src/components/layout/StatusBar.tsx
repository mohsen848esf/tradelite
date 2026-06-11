import type { ConnectionStatus } from '@/types/market'
import { formatUsdPrice } from '@/utils/formatPrice'
import './StatusBar.css'

type StatusBarProps = {
  symbol: string
  status: ConnectionStatus
  lastPrice?: number
  priceChangePercent?: number
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connecting: 'Connecting…',
  connected: 'Live',
  disconnected: 'Disconnected',
  error: 'Error',
}

export function StatusBar({ symbol, status, lastPrice, priceChangePercent }: StatusBarProps) {
  return (
    <div className="status-bar">
      <span className="status-bar__symbol">{symbol}</span>
      <span className={`status-bar__badge status-bar__badge--${status}`}>
        {STATUS_LABELS[status]}
      </span>
      {priceChangePercent !== undefined && (
        <span
          className={`status-bar__change${priceChangePercent >= 0 ? ' status-bar__change--up' : ' status-bar__change--down'}`}
        >
          {priceChangePercent >= 0 ? '+' : ''}
          {priceChangePercent.toFixed(2)}%
        </span>
      )}
      {lastPrice !== undefined && (
        <span className="status-bar__price">
          {formatUsdPrice(lastPrice)}
        </span>
      )}
    </div>
  )
}
