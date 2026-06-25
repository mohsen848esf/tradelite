import { useEffect, useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { SidebarPanel } from '@/components/layout/SidebarPanel'
import { StatusBar } from '@/components/layout/StatusBar'
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm'
import { PriceAlertList } from '@/components/alerts/PriceAlertList'
import { ChartHeader } from '@/components/chart/ChartHeader'
import { CandlestickChart } from '@/components/chart/CandlestickChart'
import { IntervalSelector } from '@/components/market/IntervalSelector'
import { StreamErrorBanner } from '@/components/market/StreamErrorBanner'
import { SymbolSelector } from '@/components/market/SymbolSelector'
import { WatchlistPanel } from '@/components/market/WatchlistPanel'
import { OrderBook } from '@/components/market/OrderBook'
import { DEFAULT_SYMBOL, KLINE_INTERVAL, type KlineInterval } from '@/constants/market'
import { STORAGE_KEYS } from '@/constants/storage'
import { useKlineStream } from '@/hooks/useKlineStream'
import { useTicker24h } from '@/hooks/useTicker24h'
import { usePriceAlerts } from '@/hooks/usePriceAlerts'
import { getSymbolLabel } from '@/utils/symbolLabel'
import { formatUsdPrice } from '@/utils/formatPrice'
import './App.css'

function App() {
  const [symbol, setSymbol] = usePersistedState(STORAGE_KEYS.selectedSymbol, DEFAULT_SYMBOL)
  const [interval, setInterval] = usePersistedState<KlineInterval>(STORAGE_KEYS.chartInterval, KLINE_INTERVAL)
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook')
  const { kline, lastPrice, status, error, reconnect } = useKlineStream({ symbol, interval })
  const {
    alerts,
    addAlert,
    removeAlert,
    clearTriggered,
    requestNotificationPermission,
  } = usePriceAlerts(lastPrice, symbol)
  const ticker = useTicker24h(symbol)

  useEffect(() => {
    const label = getSymbolLabel(symbol)
    if (lastPrice !== null) {
      document.title = `${label} - ${formatUsdPrice(lastPrice)} | Tradelite`
    } else {
      document.title = `${label} | Tradelite`
    }
  }, [symbol, lastPrice])

  const activeAlertsCount = alerts.filter((alert) => alert.symbol === symbol).length

  const handleResetSettings = () => {
    setSymbol(DEFAULT_SYMBOL)
    setInterval(KLINE_INTERVAL)
  }

  return (
    <AppLayout
      header={
        <Header
          subtitle="Real-time crypto market viewer"
          status={status}
          actions={
            <button
              type="button"
              onClick={handleResetSettings}
              style={{
                background: 'transparent',
                border: '1px solid #30363d',
                borderRadius: '6px',
                color: '#8b949e',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#e6edf3'
                e.currentTarget.style.borderColor = '#8b949e'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8b949e'
                e.currentTarget.style.borderColor = '#30363d'
              }}
            >
              Reset Settings
            </button>
          }
        />
      }
      sidebar={
        <>
          <SidebarPanel title="Markets">
            <SymbolSelector value={symbol} onChange={setSymbol} />
          </SidebarPanel>
          <SidebarPanel title="Watchlist">
            <WatchlistPanel activeSymbol={symbol} onChangeSymbol={setSymbol} />
          </SidebarPanel>
          <SidebarPanel title="Interval">
            <IntervalSelector value={interval} onChange={setInterval} />
          </SidebarPanel>
          <SidebarPanel
            title="Price Alerts"
            suffix={
              activeAlertsCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#21262d',
                    color: '#8b949e',
                    fontSize: '0.6875rem',
                    fontWeight: 'bold',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '999px',
                    lineHeight: 1,
                  }}
                >
                  {activeAlertsCount}
                </span>
              )
            }
          >
            <PriceAlertForm
              symbol={symbol}
              currentPrice={lastPrice}
              onSubmit={addAlert}
              onRequestNotifications={() => void requestNotificationPermission()}
            />
            <PriceAlertList
              alerts={alerts}
              symbol={symbol}
              onRemove={removeAlert}
              onClearTriggered={clearTriggered}
            />
          </SidebarPanel>
        </>
      }
      footer={
        <StatusBar
          symbol={symbol}
          status={status}
          lastPrice={lastPrice ?? undefined}
          priceChangePercent={ticker?.priceChangePercent}
        />
      }
    >
      <div className="workspace-layout">
        <div className="workspace-layout__main">
          <ChartHeader
            symbol={symbol}
            interval={interval}
            highPrice={ticker?.highPrice}
            lowPrice={ticker?.lowPrice}
          />
          <CandlestickChart symbol={symbol} interval={interval} kline={kline} />
          {error && <StreamErrorBanner message={error} onRetry={reconnect} />}
        </div>
        <div className="workspace-layout__side">
          <div className="workspace-layout__tab-header">
            <button
              type="button"
              className={`workspace-layout__tab-btn${activeTab === 'orderbook' ? ' workspace-layout__tab-btn--active' : ''}`}
              onClick={() => setActiveTab('orderbook')}
            >
              Order Book
            </button>
            <button
              type="button"
              className={`workspace-layout__tab-btn${activeTab === 'trades' ? ' workspace-layout__tab-btn--active' : ''}`}
              onClick={() => setActiveTab('trades')}
            >
              Recent Trades
            </button>
          </div>
          <div className="workspace-layout__tab-content">
            {activeTab === 'orderbook' && (
              <OrderBook symbol={symbol} currentPrice={lastPrice} />
            )}
            {activeTab === 'trades' && (
              <div style={{ padding: '1rem', color: '#8b949e', fontStyle: 'italic', fontSize: '0.75rem' }}>
                Recent trades streaming soon…
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default App
