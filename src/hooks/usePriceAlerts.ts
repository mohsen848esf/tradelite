import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/constants/storage'
import type { PriceAlert } from '@/types/market'
import { formatUsdPrice } from '@/utils/formatPrice'

const STORAGE_KEY = STORAGE_KEYS.priceAlerts

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

function playAlertSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch (e) {
    console.error('Failed to play alert sound:', e)
  }
}

type CreateAlertInput = {
  symbol: string
  targetPrice: number
  direction: PriceAlert['direction']
  note?: string
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
      note: input.note,
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
            body: `${alert.symbol} is ${alert.direction} ${formatUsdPrice(alert.targetPrice)}${alert.note ? ` (${alert.note})` : ''}`,
          })
        }

        playAlertSound()

        return { ...alert, triggered: true, triggeredAt: Date.now() }
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
