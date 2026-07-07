import { useRecentTrades } from '@/hooks/useRecentTrades'
import { formatPrice } from '@/utils/formatPrice'
import './RecentTrades.css'

type RecentTradesProps = {
  symbol: string
}

export function RecentTrades({ symbol }: RecentTradesProps) {
  const { trades, status } = useRecentTrades(symbol)

  const isBtcOrEth = symbol.startsWith('BTC') || symbol.startsWith('ETH')
  const amountDecimals = isBtcOrEth ? 4 : 2

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString(undefined, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="recent-trades">
      <div className="recent-trades__header">
        <span className="recent-trades__col-label">Price</span>
        <span className="recent-trades__col-label text-right">Size</span>
        <span className="recent-trades__col-label text-right">Time</span>
      </div>

      <div className="recent-trades__list">
        {status === 'connecting' && trades.length === 0 && (
          <div className="recent-trades__loading">Connecting to Trades…</div>
        )}
        {trades.map((trade) => (
          <div
            key={trade.id}
            className={`recent-trades__row recent-trades__row--${trade.side}`}
          >
            <span className="recent-trades__value recent-trades__value--price">
              {formatPrice(trade.price)}
            </span>
            <span className="recent-trades__value recent-trades__value--amount text-right">
              {trade.amount.toFixed(amountDecimals)}
            </span>
            <span className="recent-trades__value recent-trades__value--time text-right">
              {formatTime(trade.time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
