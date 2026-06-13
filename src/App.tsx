import { useEffect } from 'react'
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

  return (
    <AppLayout
      header={
        <Header
          subtitle="Real-time crypto market viewer"
          status={status}
        />
      }
      sidebar={
        <>
          <SidebarPanel title="Markets">
            <SymbolSelector value={symbol} onChange={setSymbol} />
          </SidebarPanel>
          <SidebarPanel title="Interval">
            <IntervalSelector value={interval} onChange={setInterval} />
          </SidebarPanel>
          <SidebarPanel title="Price Alerts">
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
      <ChartHeader
        symbol={symbol}
        interval={interval}
        highPrice={ticker?.highPrice}
        lowPrice={ticker?.lowPrice}
      />
      <CandlestickChart symbol={symbol} interval={interval} kline={kline} />
      {error && <StreamErrorBanner message={error} onRetry={reconnect} />}
    </AppLayout>
  )
}

export default App
