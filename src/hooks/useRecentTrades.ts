import { useEffect, useRef, useState, useCallback } from 'react'
import type { ConnectionStatus } from '@/types/market'

export type TradeEntry = {
  id: number
  price: number
  amount: number
  time: number
  side: 'buy' | 'sell'
}

export type UseRecentTradesResult = {
  trades: TradeEntry[]
  status: ConnectionStatus
  error: string | null
}

const RECONNECT_DELAY_MS = 3000
const MAX_TRADES_LIMIT = 40

export function useRecentTrades(symbol: string): UseRecentTradesResult {
  const [trades, setTrades] = useState<TradeEntry[]>([])
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

    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
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
          t: number // Trade ID
          p: string // Price
          q: string // Quantity
          T: number // Trade time
          m: boolean // Is the buyer the market maker?
        }

        const newTrade: TradeEntry = {
          id: payload.t,
          price: Number(payload.p),
          amount: Number(payload.q),
          time: payload.T,
          side: payload.m ? 'sell' : 'buy',
        }

        setTrades((prev) => {
          // Avoid duplicate trades
          if (prev.some((t) => t.id === newTrade.id)) {
            return prev
          }
          return [newTrade, ...prev].slice(0, MAX_TRADES_LIMIT)
        })
      } catch {
        // ignore
      }
    }

    socket.onerror = () => {
      if (shouldReconnectRef.current) {
        setStatus('error')
        setError('Recent trades stream error')
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

  return { trades, status, error }
}
