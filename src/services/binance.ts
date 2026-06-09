import type { Kline } from '@/types/market'

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
