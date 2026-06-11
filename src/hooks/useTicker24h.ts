import { useEffect, useState } from 'react'
import { fetchTicker24h, type Ticker24h } from '@/services/binance'

export function useTicker24h(symbol: string) {
  const [ticker, setTicker] = useState<Ticker24h | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchTicker24h(symbol)
        if (!cancelled) {
          setTicker(data)
        }
      } catch {
        if (!cancelled) {
          setTicker(null)
        }
      }
    }

    void load()
    const timer = setInterval(load, 60_000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [symbol])

  return ticker
}
