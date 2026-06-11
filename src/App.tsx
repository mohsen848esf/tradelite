import { usePersistedState } from '@/hooks/usePersistedState'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { SidebarPanel } from '@/components/layout/SidebarPanel'
import { StatusBar } from '@/components/layout/StatusBar'
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm'
import { PriceAlertList } from '@/components/alerts/PriceAlertList'
import { CandlestickChart } from '@/components/chart/CandlestickChart'
import { IntervalSelector } from '@/components/market/IntervalSelector'
import { StreamErrorBanner } from '@/components/market/StreamErrorBanner'
import { SymbolSelector } from '@/components/market/SymbolSelector'
import { DEFAULT_SYMBOL, KLINE_INTERVAL, type KlineInterval } from '@/constants/market'
import { STORAGE_KEYS } from '@/constants/storage'
import { useKlineStream } from '@/hooks/useKlineStream'
import { usePriceAlerts } from '@/hooks/usePriceAlerts'
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

  return (
    <AppLayout
      header={
        <Header
          subtitle="Real-time crypto market viewer"
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
        <StatusBar symbol={symbol} status={status} lastPrice={lastPrice ?? undefined} />
      }
    >
      <CandlestickChart symbol={symbol} interval={interval} kline={kline} />
      {error && <StreamErrorBanner message={error} onRetry={reconnect} />}
    </AppLayout>
  )
}

export default App
