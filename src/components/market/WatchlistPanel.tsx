import { useWatchlist } from '@/hooks/useWatchlist'
import { useWatchlistPrices } from '@/hooks/useWatchlistPrices'
import { getSymbolLabel } from '@/utils/symbolLabel'
import { formatUsdPrice } from '@/utils/formatPrice'
import './WatchlistPanel.css'

type WatchlistPanelProps = {
  activeSymbol: string
  onChangeSymbol: (symbol: string) => void
}

export function WatchlistPanel({ activeSymbol, onChangeSymbol }: WatchlistPanelProps) {
  const { watchlist, toggleWatchlist } = useWatchlist()
  const prices = useWatchlistPrices(watchlist)

  if (watchlist.length === 0) {
    return (
      <div className="watchlist-panel__empty">
        No symbols in watchlist. Click the star icon next to a symbol to add it.
      </div>
    )
  }

  return (
    <div className="watchlist-panel">
      {watchlist.map((symbol) => {
        const isActive = symbol === activeSymbol
        const ticker = prices[symbol]
        const label = getSymbolLabel(symbol)

        return (
          <div
            key={symbol}
            className={`watchlist-panel__item${isActive ? ' watchlist-panel__item--active' : ''}`}
            onClick={() => onChangeSymbol(symbol)}
          >
            <div className="watchlist-panel__info">
              <span className="watchlist-panel__label">{label}</span>
              <span className="watchlist-panel__symbol">{symbol}</span>
            </div>
            <div className="watchlist-panel__stats">
              {ticker ? (
                <>
                  <span className="watchlist-panel__price">
                    {formatUsdPrice(ticker.price)}
                  </span>
                  <span
                    className={`watchlist-panel__change ${
                      ticker.changePercent >= 0
                        ? 'watchlist-panel__change--up'
                        : 'watchlist-panel__change--down'
                    }`}
                  >
                    {ticker.changePercent >= 0 ? '+' : ''}
                    {ticker.changePercent.toFixed(2)}%
                  </span>
                </>
              ) : (
                <span className="watchlist-panel__loading">Loading…</span>
              )}
            </div>
            <button
              type="button"
              className="watchlist-panel__remove-btn"
              onClick={(e) => {
                e.stopPropagation()
                toggleWatchlist(symbol)
              }}
              title="Remove from Watchlist"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
