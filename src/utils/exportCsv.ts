import type { Kline } from '@/types/market'
import { calculateSMA, calculateEMA } from './indicators'

export function exportCandlestickDataToCsv(symbol: string, interval: string, history: Kline[]) {
  if (history.length === 0) return

  const sma = calculateSMA(history, 14)
  const ema = calculateEMA(history, 20)

  const csvRows = [
    ['Time (UTC)', 'Open', 'High', 'Low', 'Close', 'SMA (14)', 'EMA (20)'].join(','),
  ]

  history.forEach((kline) => {
    const smaPoint = sma.find((p) => p.time === kline.time)
    const emaPoint = ema.find((p) => p.time === kline.time)
    const dateStr = new Date(kline.time).toISOString()

    csvRows.push(
      [
        dateStr,
        kline.open,
        kline.high,
        kline.low,
        kline.close,
        smaPoint ? smaPoint.value.toFixed(2) : '',
        emaPoint ? emaPoint.value.toFixed(2) : '',
      ].join(',')
    )
  })

  // Encode values safely to prevent parsing issues with special characters in CSV
  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
  const link = document.createElement('a')
  link.setAttribute('href', csvContent)
  link.setAttribute('download', `${symbol}_${interval}_chart_data.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
