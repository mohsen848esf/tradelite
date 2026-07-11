import { useEffect, useState, useRef } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { SidebarPanel } from '@/components/layout/SidebarPanel'
import { StatusBar } from '@/components/layout/StatusBar'
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm'
import { PriceAlertList } from '@/components/alerts/PriceAlertList'
import { ChartHeader } from '@/components/chart/ChartHeader'
import { CandlestickChart, type CandlestickChartRef } from '@/components/chart/CandlestickChart'
import { IntervalSelector } from '@/components/market/IntervalSelector'
import { StreamErrorBanner } from '@/components/market/StreamErrorBanner'
import { SymbolSelector } from '@/components/market/SymbolSelector'
import { WatchlistPanel } from '@/components/market/WatchlistPanel'
import { OrderBook } from '@/components/market/OrderBook'
import { RecentTrades } from '@/components/market/RecentTrades'
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
  const [showSMA, setShowSMA] = useState(false)
  const [showEMA, setShowEMA] = useState(false)

  // Multi-chart states
  const [layoutMode, setLayoutMode] = usePersistedState<'single' | 'split'>(STORAGE_KEYS.layoutMode, 'single')
  const [symbol2, setSymbol2] = usePersistedState(STORAGE_KEYS.selectedSymbol2, 'ETHUSDT')
  const [interval2, setInterval2] = usePersistedState<KlineInterval>(STORAGE_KEYS.chartInterval2, KLINE_INTERVAL)
  const [activeChartId, setActiveChartId] = useState<1 | 2>(1)

  // Chart refs for CSV exporting
  const chartRef1 = useRef<CandlestickChartRef>(null)
  const chartRef2 = useRef<CandlestickChartRef>(null)

  const { kline, lastPrice, status, error, reconnect } = useKlineStream({ symbol, interval })
  const {
    kline: kline2,
    lastPrice: lastPrice2,
    status: status2,
    error: error2,
    reconnect: reconnect2,
  } = useKlineStream({
    symbol: symbol2,
    interval: interval2,
    enabled: layoutMode === 'split',
  })

  const currentSymbolValue = activeChartId === 1 ? symbol : symbol2
  const currentIntervalValue = activeChartId === 1 ? interval : interval2

  const handleSymbolChange = (newSymbol: string) => {
    if (activeChartId === 1) {
      setSymbol(newSymbol)
    } else {
      setSymbol2(newSymbol)
    }
  }

  const handleIntervalChange = (newInterval: KlineInterval) => {
    if (activeChartId === 1) {
      setInterval(newInterval)
    } else {
      setInterval2(newInterval)
    }
  }

  const {
    alerts,
    addAlert,
    removeAlert,
    clearTriggered,
    requestNotificationPermission,
  } = usePriceAlerts(activeChartId === 1 ? lastPrice : lastPrice2, currentSymbolValue)

  const ticker = useTicker24h(symbol)
  const ticker2 = useTicker24h(symbol2)

  useEffect(() => {
    const activeSymbol = activeChartId === 1 ? symbol : symbol2
    const activePrice = activeChartId === 1 ? lastPrice : lastPrice2
    const label = getSymbolLabel(activeSymbol)
    if (activePrice !== null) {
      document.title = `${label} - ${formatUsdPrice(activePrice)} | Tradelite`
    } else {
      document.title = `${label} | Tradelite`
    }
  }, [symbol, symbol2, lastPrice, lastPrice2, activeChartId])

  const activeAlertsCount = alerts.filter((alert) => alert.symbol === currentSymbolValue).length

  const handleResetSettings = () => {
    setSymbol(DEFAULT_SYMBOL)
    setInterval(KLINE_INTERVAL)
    setSymbol2('ETHUSDT')
    setInterval2(KLINE_INTERVAL)
    setLayoutMode('single')
    setActiveChartId(1)
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
            <SymbolSelector value={currentSymbolValue} onChange={handleSymbolChange} />
          </SidebarPanel>
          <SidebarPanel title="Watchlist">
            <WatchlistPanel activeSymbol={currentSymbolValue} onChangeSymbol={handleSymbolChange} />
          </SidebarPanel>
          <SidebarPanel title="Interval">
            <IntervalSelector value={currentIntervalValue} onChange={handleIntervalChange} />
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
              symbol={currentSymbolValue}
              currentPrice={activeChartId === 1 ? lastPrice : lastPrice2}
              onSubmit={addAlert}
              onRequestNotifications={() => void requestNotificationPermission()}
            />
            <PriceAlertList
              alerts={alerts}
              symbol={currentSymbolValue}
              onRemove={removeAlert}
              onClearTriggered={clearTriggered}
            />
          </SidebarPanel>
        </>
      }
      footer={
        <StatusBar
          symbol={currentSymbolValue}
          status={activeChartId === 1 ? status : status2}
          lastPrice={(activeChartId === 1 ? lastPrice : lastPrice2) ?? undefined}
          priceChangePercent={activeChartId === 1 ? ticker?.priceChangePercent : ticker2?.priceChangePercent}
        />
      }
    >
      <div className="workspace-layout">
        <div className="workspace-layout__main">
          {layoutMode === 'single' ? (
            <div className="chart-panel chart-panel--active">
              <ChartHeader
                symbol={symbol}
                interval={interval}
                highPrice={ticker?.highPrice}
                lowPrice={ticker?.lowPrice}
                showSMA={showSMA}
                showEMA={showEMA}
                onToggleSMA={() => setShowSMA((prev) => !prev)}
                onToggleEMA={() => setShowEMA((prev) => !prev)}
                layoutMode={layoutMode}
                onLayoutModeChange={setLayoutMode}
                onExport={() => chartRef1.current?.exportCsv()}
              />
              <CandlestickChart
                ref={chartRef1}
                symbol={symbol}
                interval={interval}
                kline={kline}
                showSMA={showSMA}
                showEMA={showEMA}
              />
              {error && <StreamErrorBanner message={error} onRetry={reconnect} />}
            </div>
          ) : (
            <div className="charts-grid">
              <div
                className={`chart-panel${activeChartId === 1 ? ' chart-panel--active' : ''}`}
                onClick={() => setActiveChartId(1)}
              >
                <ChartHeader
                  symbol={symbol}
                  interval={interval}
                  highPrice={ticker?.highPrice}
                  lowPrice={ticker?.lowPrice}
                  showSMA={showSMA}
                  showEMA={showEMA}
                  onToggleSMA={() => setShowSMA((prev) => !prev)}
                  onToggleEMA={() => setShowEMA((prev) => !prev)}
                  layoutMode={layoutMode}
                  onLayoutModeChange={setLayoutMode}
                  onExport={() => chartRef1.current?.exportCsv()}
                />
                <CandlestickChart
                  ref={chartRef1}
                  symbol={symbol}
                  interval={interval}
                  kline={kline}
                  showSMA={showSMA}
                  showEMA={showEMA}
                />
                {error && <StreamErrorBanner message={error} onRetry={reconnect} />}
              </div>
              <div
                className={`chart-panel${activeChartId === 2 ? ' chart-panel--active' : ''}`}
                onClick={() => setActiveChartId(2)}
              >
                <ChartHeader
                  symbol={symbol2}
                  interval={interval2}
                  highPrice={ticker2?.highPrice}
                  lowPrice={ticker2?.lowPrice}
                  showSMA={showSMA}
                  showEMA={showEMA}
                  onToggleSMA={() => setShowSMA((prev) => !prev)}
                  onToggleEMA={() => setShowEMA((prev) => !prev)}
                  layoutMode={layoutMode}
                  onLayoutModeChange={setLayoutMode}
                  onExport={() => chartRef2.current?.exportCsv()}
                />
                <CandlestickChart
                  ref={chartRef2}
                  symbol={symbol2}
                  interval={interval2}
                  kline={kline2}
                  showSMA={showSMA}
                  showEMA={showEMA}
                />
                {error2 && <StreamErrorBanner message={error2} onRetry={reconnect2} />}
              </div>
            </div>
          )}
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
              <OrderBook symbol={currentSymbolValue} currentPrice={activeChartId === 1 ? lastPrice : lastPrice2} />
            )}
            {activeTab === 'trades' && (
              <RecentTrades symbol={currentSymbolValue} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default App
