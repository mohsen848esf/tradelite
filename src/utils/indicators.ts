export type IndicatorPoint = {
  time: number
  value: number
}

/**
 * Calculates Simple Moving Average (SMA) for a given array of close prices and a period.
 */
export function calculateSMA(
  data: { close: number; time: number }[],
  period: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = []

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    })
  }

  return result
}

/**
 * Calculates Exponential Moving Average (EMA) for a given array of close prices and a period.
 */
export function calculateEMA(
  data: { close: number; time: number }[],
  period: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  if (data.length < period) {
    return result
  }

  const multiplier = 2 / (period + 1)

  // Step 1: Calculate SMA for the first period as the initial EMA value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i].close
  }
  let prevEma = sum / period

  result.push({
    time: data[period - 1].time,
    value: prevEma,
  })

  // Step 2: Calculate EMA for the remaining points
  for (let i = period; i < data.length; i++) {
    const currentEma = (data[i].close - prevEma) * multiplier + prevEma
    result.push({
      time: data[i].time,
      value: currentEma,
    })
    prevEma = currentEma
  }

  return result
}
