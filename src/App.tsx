import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { SidebarPanel } from '@/components/layout/SidebarPanel'
import { StatusBar } from '@/components/layout/StatusBar'
import { DEFAULT_SYMBOL } from '@/constants/market'
import './App.css'

function App() {
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
            <p className="placeholder-text">Symbol selector coming soon</p>
          </SidebarPanel>
          <SidebarPanel title="Price Alerts">
            <p className="placeholder-text">No alerts yet</p>
          </SidebarPanel>
        </>
      }
      footer={
        <StatusBar symbol={DEFAULT_SYMBOL} status="disconnected" />
      }
    >
      <div className="chart-placeholder">
        <p>Candlestick chart will appear here</p>
      </div>
    </AppLayout>
  )
}

export default App
