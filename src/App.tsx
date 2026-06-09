import { DEFAULT_SYMBOL } from '@/constants/market'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Tradelite</h1>
        <p>Real-time crypto market viewer</p>
      </header>
      <main className="app-main">
        <p>Loading market data for {DEFAULT_SYMBOL}…</p>
      </main>
    </div>
  )
}

export default App
