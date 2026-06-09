import { useCallback, useEffect, useState } from 'react'
import type { PriceAlert } from '@/types/market'

const STORAGE_KEY = 'tradelite-price-alerts'

function loadAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PriceAlert[]) : []
  } catch {
    return []
  }
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

type CreateAlertInput = {
  symbol: string
  targetPrice: number
  direction: PriceAlert['direction']
}

export function usePriceAlerts(currentPrice: number | null, symbol: string) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => loadAlerts())

  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  const addAlert = useCallback((input: CreateAlertInput) => {
    const alert: PriceAlert = {
      id: crypto.randomUUID(),
      symbol: input.symbol,
      targetPrice: input.targetPrice,
      direction: input.direction,
      triggered: false,
      createdAt: Date.now(),
    }

    setAlerts((prev) => [alert, ...prev])
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  const clearTriggered = useCallback(() => {
    setAlerts((prev) => prev.filter((alert) => !alert.triggered))
  }, [])

  useEffect(() => {
    if (currentPrice === null) {
      return
    }

    setAlerts((prev) => {
      let changed = false

      const next = prev.map((alert) => {
        if (alert.triggered || alert.symbol !== symbol) {
          return alert
        }

        const hit =
          alert.direction === 'above'
            ? currentPrice >= alert.targetPrice
            : currentPrice <= alert.targetPrice

        if (!hit) {
          return alert
        }

        changed = true

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Tradelite Price Alert', {
            body: `${alert.symbol} is ${alert.direction} $${alert.targetPrice.toLocaleString()}`,
          })
        }

        return { ...alert, triggered: true }
      })

      return changed ? next : prev
    })
  }, [currentPrice, symbol])

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

  return {
    alerts,
    addAlert,
    removeAlert,
    clearTriggered,
    requestNotificationPermission,
  }
}
