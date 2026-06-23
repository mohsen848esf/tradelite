import type { Kline } from '@/types/market'

export type RsiPoint = {
  time: number
  value: number
}

/**
  * Calculates Relative Strength Index (RSI) for a array of Kline candles.
  * @param klines Array of Kline candles sorted chronologically
  * @param period Period window (default 14)
  */
export function calculateRSI(klines: Kline[], period = 14): RsiPoint[] {
  if (klines.length <= period) {
    return []
  }

  const results: RsiPoint[] = []
  let gains = 0
  let losses = 0

  // First period average gain & loss
  for (let i = 1; i <= period; i++) {
    const change = klines[i].close - klines[i - 1].close
    if (change >= 0) {
      gains += change
    } else {
      losses += Math.abs(change)
    }
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss
  let rsi = 100 - 100 / (1 + rs)

  results.push({
    time: klines[period].time,
    value: Number(rsi.toFixed(2)),
  })

  // Wilder's Smoothing for subsequent points
  for (let i = period + 1; i < klines.length; i++) {
    const change = klines[i].close - klines[i - 1].close
    const gain = change >= 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    rsi = 100 - 100 / (1 + rs)

    results.push({
      time: klines[i].time,
      value: Number(rsi.toFixed(2)),
    })
  }

  return results
}
