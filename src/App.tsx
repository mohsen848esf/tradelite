import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { SidebarPanel } from '@/components/layout/SidebarPanel'
import { StatusBar } from '@/components/layout/StatusBar'
import { SymbolSelector } from '@/components/market/SymbolSelector'
import { DEFAULT_SYMBOL } from '@/constants/market'
import './App.css'

function App() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL)

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
            <p className="placeholder-text">No alerts yet</p>
          </SidebarPanel>
        </>
      }
      footer={
        <StatusBar symbol={symbol} status="disconnected" />
      }
    >
      <div className="chart-placeholder">
        <p>Candlestick chart for {symbol} will appear here</p>
      </div>
    </AppLayout>
  )
}

export default App
