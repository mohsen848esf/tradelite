import type { Kline } from '@/types/market'
import { calculateEMA } from './indicators'

export type MacdPoint = {
  time: number
  macd: number
  signal: number
  histogram: number
}

/**
 * Calculates Moving Average Convergence Divergence (MACD).
 * Standard parameters: Fast EMA 12, Slow EMA 26, Signal EMA 9.
 */
export function calculateMACD(
  klines: Kline[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdPoint[] {
  if (klines.length < slowPeriod + signalPeriod) {
    return []
  }

  const fastEma = calculateEMA(klines, fastPeriod)
  const slowEma = calculateEMA(klines, slowPeriod)

  // Align fast and slow EMAs by timestamp
  const macdLinePoints: { time: number; value: number }[] = []

  slowEma.forEach((slowPoint) => {
    const fastPoint = fastEma.find((f) => f.time === slowPoint.time)
    if (fastPoint) {
      macdLinePoints.push({
        time: slowPoint.time,
        value: fastPoint.value - slowPoint.value,
      })
    }
  })

  if (macdLinePoints.length < signalPeriod) {
    return []
  }

  // Calculate Signal line (EMA of MACD line points)
  const klinesMockForSignal: Kline[] = macdLinePoints.map((p) => ({
    time: p.time,
    open: p.value,
    high: p.value,
    low: p.value,
    close: p.value,
    volume: 0,
  }))

  const signalLine = calculateEMA(klinesMockForSignal, signalPeriod)

  const results: MacdPoint[] = []

  signalLine.forEach((sigPoint) => {
    const macdPoint = macdLinePoints.find((m) => m.time === sigPoint.time)
    if (macdPoint) {
      const macdVal = Number(macdPoint.value.toFixed(4))
      const signalVal = Number(sigPoint.value.toFixed(4))
      const histVal = Number((macdVal - signalVal).toFixed(4))

      results.push({
        time: sigPoint.time,
        macd: macdVal,
        signal: signalVal,
        histogram: histVal,
      })
    }
  })

  return results
}
