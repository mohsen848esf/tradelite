import { useCallback, useEffect, useRef, useState } from 'react'
import { getKlineStreamUrl, KLINE_INTERVAL } from '@/constants/market'
import { parseBinanceKlineMessage } from '@/services/binance'
import type { ConnectionStatus, Kline } from '@/types/market'

type UseKlineStreamOptions = {
  symbol: string
  interval?: string
  enabled?: boolean
}

type UseKlineStreamResult = {
  kline: Kline | null
  lastPrice: number | null
  status: ConnectionStatus
  error: string | null
  reconnect: () => void
}

const RECONNECT_DELAY_MS = 3000

export function useKlineStream({
  symbol,
  interval = KLINE_INTERVAL,
  enabled = true,
}: UseKlineStreamOptions): UseKlineStreamResult {
  const [kline, setKline] = useState<Kline | null>(null)
  const [lastPrice, setLastPrice] = useState<number | null>(null)
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
    if (!enabled) {
      return
    }

    disconnect()
    setStatus('connecting')
    setError(null)

    const url = getKlineStreamUrl(symbol, interval)
    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onopen = () => {
      setStatus('connected')
      setError(null)
    }

    socket.onmessage = (event) => {
      const parsed = parseBinanceKlineMessage(event.data as string)

      if (!parsed) {
        return
      }

      setKline(parsed)
      setLastPrice(parsed.close)
    }

    socket.onerror = () => {
      setStatus('error')
      setError('WebSocket connection error')
    }

    socket.onclose = () => {
      socketRef.current = null

      if (!shouldReconnectRef.current || !enabled) {
        setStatus('disconnected')
        return
      }

      setStatus('connecting')
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
    }
  }, [disconnect, enabled, interval, symbol])

  const reconnect = useCallback(() => {
    connect()
  }, [connect])

  useEffect(() => {
    shouldReconnectRef.current = true
    connect()

    return () => {
      shouldReconnectRef.current = false
      disconnect()
      setStatus('disconnected')
    }
  }, [connect, disconnect])

  return {
    kline,
    lastPrice,
    status,
    error,
    reconnect,
  }
}
