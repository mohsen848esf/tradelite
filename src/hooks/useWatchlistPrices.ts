import { useEffect, useRef, useState } from 'react'

type TickerData = {
  price: number
  changePercent: number
}

export function useWatchlistPrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, TickerData>>({})
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (symbols.length === 0) {
      setPrices({})
      return
    }

    // Initialize with standard fetch or empty
    let cancelled = false
    const fetchInitialPrices = async () => {
      const newPrices: Record<string, TickerData> = {}
      for (const symbol of symbols) {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
          if (res.ok) {
            const data = await res.json() as { lastPrice: string; priceChangePercent: string }
            newPrices[symbol] = {
              price: Number(data.lastPrice),
              changePercent: Number(data.priceChangePercent),
            }
          }
        } catch {
          // ignore
        }
      }
      if (!cancelled) {
        setPrices((prev) => ({ ...prev, ...newPrices }))
      }
    }

    void fetchInitialPrices()

    // Setup combined WebSocket stream
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/')
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`
    
    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as {
          stream: string
          data: {
            s: string // Symbol
            c: string // Current/Close price
            P: string // Price change percent
          }
        }

        if (message.data && message.data.s) {
          const symbol = message.data.s
          const price = Number(message.data.c)
          const changePercent = Number(message.data.P)

          if (!cancelled) {
            setPrices((prev) => ({
              ...prev,
              [symbol]: { price, changePercent },
            }))
          }
        }
      } catch {
        // ignore
      }
    }

    return () => {
      cancelled = true
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [symbols])

  return prices
}
