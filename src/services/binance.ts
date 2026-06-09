import { KLINE_INTERVAL } from '@/constants/market'
import type { Kline } from '@/types/market'

const BINANCE_REST_BASE = 'https://api.binance.com/api/v3'

type BinanceKlinePayload = {
  e: string
  k: {
    t: number
    o: string
    h: string
    l: string
    c: string
    v: string
  }
}

type BinanceRestKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
]

function mapRestKline(entry: BinanceRestKline): Kline {
  return {
    time: Math.floor(entry[0] / 1000),
    open: Number(entry[1]),
    high: Number(entry[2]),
    low: Number(entry[3]),
    close: Number(entry[4]),
    volume: Number(entry[5]),
  }
}

export async function fetchHistoricalKlines(
  symbol: string,
  interval = KLINE_INTERVAL,
  limit = 120,
): Promise<Kline[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    limit: String(limit),
  })

  const response = await fetch(`${BINANCE_REST_BASE}/klines?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch klines for ${symbol}`)
  }

  const data = (await response.json()) as BinanceRestKline[]
  return data.map(mapRestKline)
}

export function parseBinanceKlineMessage(data: string): Kline | null {
  try {
    const payload = JSON.parse(data) as BinanceKlinePayload

    if (payload.e !== 'kline') {
      return null
    }

    const { k } = payload

    return {
      time: Math.floor(k.t / 1000),
      open: Number(k.o),
      high: Number(k.h),
      low: Number(k.l),
      close: Number(k.c),
      volume: Number(k.v),
    }
  } catch {
    return null
  }
}
