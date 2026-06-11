import { usePersistedState } from '@/hooks/usePersistedState'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { SidebarPanel } from '@/components/layout/SidebarPanel'
import { StatusBar } from '@/components/layout/StatusBar'
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm'
import { PriceAlertList } from '@/components/alerts/PriceAlertList'
import { CandlestickChart } from '@/components/chart/CandlestickChart'
import { SymbolSelector } from '@/components/market/SymbolSelector'
import { DEFAULT_SYMBOL } from '@/constants/market'
import { STORAGE_KEYS } from '@/constants/storage'
import { useKlineStream } from '@/hooks/useKlineStream'
import { usePriceAlerts } from '@/hooks/usePriceAlerts'
import './App.css'

function App() {
  const [symbol, setSymbol] = usePersistedState(STORAGE_KEYS.selectedSymbol, DEFAULT_SYMBOL)
  const { kline, lastPrice, status, error } = useKlineStream({ symbol })
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
      <CandlestickChart symbol={symbol} kline={kline} />
      {error && <p className="stream-error">{error}</p>}
    </AppLayout>
  )
}

export default App
