import type { ConnectionStatus } from '@/types/market'
import './StatusBar.css'

type StatusBarProps = {
  symbol: string
  status: ConnectionStatus
  lastPrice?: number
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connecting: 'Connecting…',
  connected: 'Live',
  disconnected: 'Disconnected',
  error: 'Error',
}

export function StatusBar({ symbol, status, lastPrice }: StatusBarProps) {
  return (
    <div className="status-bar">
      <span className="status-bar__symbol">{symbol}</span>
      <span className={`status-bar__badge status-bar__badge--${status}`}>
        {STATUS_LABELS[status]}
      </span>
      {lastPrice !== undefined && (
        <span className="status-bar__price">
          ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )}
    </div>
  )
}
