import { useEffect, useRef, useState } from 'react'
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
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const prevPriceRef = useRef<number | undefined>(lastPrice)

  useEffect(() => {
    if (lastPrice === undefined || prevPriceRef.current === undefined) {
      prevPriceRef.current = lastPrice
      return
    }

    if (lastPrice > prevPriceRef.current) {
      setDirection('up')
    } else if (lastPrice < prevPriceRef.current) {
      setDirection('down')
    }

    prevPriceRef.current = lastPrice

    const timer = setTimeout(() => {
      setDirection(null)
    }, 300)

    return () => clearTimeout(timer)
  }, [lastPrice])

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
        <span className={`status-bar__price${direction ? ` status-bar__price--${direction}` : ''}`}>
          {formatUsdPrice(lastPrice)}
        </span>
      )}
    </div>
  )
}
