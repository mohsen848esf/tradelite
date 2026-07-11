import { getSymbolLabel } from '@/utils/symbolLabel'
import { formatUsdPrice } from '@/utils/formatPrice'
import './ChartHeader.css'

type ChartHeaderProps = {
  symbol: string
  interval: string
  highPrice?: number
  lowPrice?: number
  showSMA: boolean
  showEMA: boolean
  onToggleSMA: () => void
  onToggleEMA: () => void
  layoutMode: 'single' | 'split'
  onLayoutModeChange: (mode: 'single' | 'split') => void
}

export function ChartHeader({
  symbol,
  interval,
  highPrice,
  lowPrice,
  showSMA,
  showEMA,
  onToggleSMA,
  onToggleEMA,
  layoutMode,
  onLayoutModeChange,
}: ChartHeaderProps) {
  const label = getSymbolLabel(symbol)

  return (
    <div className="chart-header">
      <div className="chart-header__info">
        <h2 className="chart-header__title">{label}</h2>
        <span className="chart-header__interval">{interval} candlesticks</span>
        <div className="chart-header__controls">
          <button
            type="button"
            className={`chart-header__indicator-btn${showSMA ? ' chart-header__indicator-btn--sma-active' : ''}`}
            onClick={onToggleSMA}
          >
            SMA (14)
          </button>
          <button
            type="button"
            className={`chart-header__indicator-btn${showEMA ? ' chart-header__indicator-btn--ema-active' : ''}`}
            onClick={onToggleEMA}
          >
            EMA (20)
          </button>
          <span style={{ borderLeft: '1px solid #21262d', margin: '0 0.25rem' }} />
          <button
            type="button"
            className={`chart-header__indicator-btn${layoutMode === 'single' ? ' chart-header__indicator-btn--active' : ''}`}
            onClick={() => onLayoutModeChange('single')}
          >
            Single
          </button>
          <button
            type="button"
            className={`chart-header__indicator-btn${layoutMode === 'split' ? ' chart-header__indicator-btn--active' : ''}`}
            onClick={() => onLayoutModeChange('split')}
          >
            Split
          </button>
        </div>
      </div>
      {(highPrice !== undefined || lowPrice !== undefined) && (
        <div className="chart-header__stats">
          {highPrice !== undefined && (
            <span className="chart-header__stat">
              <span className="chart-header__stat-label">24h High:</span>{' '}
              <span className="chart-header__stat-value chart-header__stat-value--high">
                {formatUsdPrice(highPrice)}
              </span>
            </span>
          )}
          {lowPrice !== undefined && (
            <span className="chart-header__stat">
              <span className="chart-header__stat-label">24h Low:</span>{' '}
              <span className="chart-header__stat-value chart-header__stat-value--low">
                {formatUsdPrice(lowPrice)}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
