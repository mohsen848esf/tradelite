import { useOrderBook } from '@/hooks/useOrderBook'
import { formatPrice } from '@/utils/formatPrice'
import './OrderBook.css'

type OrderBookProps = {
  symbol: string
  currentPrice: number | null
}

export function OrderBook({ symbol, currentPrice }: OrderBookProps) {
  const { bids, asks, status } = useOrderBook(symbol)

  // Find max total for visual depth scaling
  const maxBidTotal = bids.length > 0 ? bids[bids.length - 1].total : 1
  const maxAskTotal = asks.length > 0 ? asks[asks.length - 1].total : 1
  const maxTotal = Math.max(maxBidTotal, maxAskTotal)

  // Reverse asks to show highest price at top, lowest ask (best ask) at bottom
  const reversedAsks = [...asks].reverse()

  const bestBid = bids.length > 0 ? bids[0].price : null
  const bestAsk = asks.length > 0 ? asks[0].price : null
  const spread = bestAsk && bestBid ? bestAsk - bestBid : null
  const spreadPercent = spread && bestAsk ? (spread / bestAsk) * 100 : null

  const isBtcOrEth = symbol.startsWith('BTC') || symbol.startsWith('ETH')
  const amountDecimals = isBtcOrEth ? 4 : 2

  return (
    <div className="order-book">
      <div className="order-book__header">
        <span className="order-book__col-label">Price</span>
        <span className="order-book__col-label text-right">Size</span>
        <span className="order-book__col-label text-right">Total</span>
      </div>

      <div className="order-book__list order-book__list--asks">
        {status === 'connecting' && bids.length === 0 && (
          <div className="order-book__loading">Connecting to Order Book…</div>
        )}
        {reversedAsks.map((ask) => {
          const depthPercent = Math.min((ask.total / maxTotal) * 100, 100)
          return (
            <div key={ask.price} className="order-book__row order-book__row--ask">
              <div
                className="order-book__depth-bar"
                style={{
                  width: `${depthPercent}%`,
                  background: 'rgba(248, 81, 73, 0.08)',
                }}
              />
              <span className="order-book__value order-book__value--price">
                {formatPrice(ask.price)}
              </span>
              <span className="order-book__value order-book__value--amount text-right">
                {ask.amount.toFixed(amountDecimals)}
              </span>
              <span className="order-book__value order-book__value--total text-right">
                {ask.total.toFixed(amountDecimals)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="order-book__spread-container">
        <div className="order-book__last-price">
          {currentPrice ? formatPrice(currentPrice) : '…'}
        </div>
        {spread !== null && spreadPercent !== null && (
          <div className="order-book__spread">
            <span>Spread:</span>
            <span className="order-book__spread-val">
              {spread.toFixed(symbol.endsWith('USDT') ? 2 : 5)} ({spreadPercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      <div className="order-book__list order-book__list--bids">
        {bids.map((bid) => {
          const depthPercent = Math.min((bid.total / maxTotal) * 100, 100)
          return (
            <div key={bid.price} className="order-book__row order-book__row--bid">
              <div
                className="order-book__depth-bar"
                style={{
                  width: `${depthPercent}%`,
                  background: 'rgba(63, 185, 80, 0.08)',
                }}
              />
              <span className="order-book__value order-book__value--price">
                {formatPrice(bid.price)}
              </span>
              <span className="order-book__value order-book__value--amount text-right">
                {bid.amount.toFixed(amountDecimals)}
              </span>
              <span className="order-book__value order-book__value--total text-right">
                {bid.total.toFixed(amountDecimals)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
