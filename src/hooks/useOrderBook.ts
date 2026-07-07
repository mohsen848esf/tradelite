import { useEffect, useRef, useState, useCallback } from 'react'
import type { ConnectionStatus } from '@/types/market'

export type OrderBookEntry = {
  price: number
  amount: number
  total: number // Cumulative total for depth visual
}

export type UseOrderBookResult = {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  status: ConnectionStatus
  error: string | null
}

const RECONNECT_DELAY_MS = 3000

export function useOrderBook(symbol: string): UseOrderBookResult {
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shouldReconnectRef = useRef(true)

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const disconnect = useCallback(() => {
    clearReconnectTimer()
    const socket = socketRef.current

    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onerror = null
      socket.onclose = null
      socket.close()
      socketRef.current = null
    }
  }, [clearReconnectTimer])

  const connect = useCallback(() => {
    disconnect()
    setStatus('connecting')
    setError(null)

    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onopen = () => {
      if (shouldReconnectRef.current) {
        setStatus('connected')
        setError(null)
      }
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as {
          bids: [string, string][]
          asks: [string, string][]
        }

        // Process bids (descending order)
        let bidTotal = 0
        const processedBids = payload.bids.slice(0, 12).map(([priceStr, amountStr]) => {
          const price = Number(priceStr)
          const amount = Number(amountStr)
          bidTotal += amount
          return { price, amount, total: bidTotal }
        })

        // Process asks (ascending order)
        let askTotal = 0
        const processedAsks = payload.asks.slice(0, 12).map(([priceStr, amountStr]) => {
          const price = Number(priceStr)
          const amount = Number(amountStr)
          askTotal += amount
          return { price, amount, total: askTotal }
        })

        setBids(processedBids)
        setAsks(processedAsks)
      } catch {
        // ignore
      }
    }

    socket.onerror = () => {
      if (shouldReconnectRef.current) {
        setStatus('error')
        setError('Order book stream error')
      }
    }

    socket.onclose = () => {
      socketRef.current = null
      if (shouldReconnectRef.current) {
        setStatus('connecting')
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
      } else {
        setStatus('disconnected')
      }
    }
  }, [disconnect, symbol])

  useEffect(() => {
    shouldReconnectRef.current = true
    connect()

    return () => {
      shouldReconnectRef.current = false
      disconnect()
      setStatus('disconnected')
    }
  }, [connect, disconnect])

  return { bids, asks, status, error }
}
