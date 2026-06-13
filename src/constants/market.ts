import type { SymbolPair } from '@/types/market'

export const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws'

export const DEFAULT_SYMBOL = 'BTCUSDT'

export const SYMBOLS: SymbolPair[] = [
  { symbol: 'BTCUSDT', label: 'BTC / USDT' },
  { symbol: 'ETHUSDT', label: 'ETH / USDT' },
  { symbol: 'BNBUSDT', label: 'BNB / USDT' },
  { symbol: 'SOLUSDT', label: 'SOL / USDT' },
  { symbol: 'XRPUSDT', label: 'XRP / USDT' },
  { symbol: 'ADAUSDT', label: 'ADA / USDT' },
  { symbol: 'DOTUSDT', label: 'DOT / USDT' },
]

export const KLINE_INTERVAL = '1m'

export const KLINE_INTERVALS = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
] as const

export type KlineInterval = (typeof KLINE_INTERVALS)[number]['value']

export function getKlineStreamUrl(symbol: string, interval = KLINE_INTERVAL): string {
  const stream = `${symbol.toLowerCase()}@kline_${interval}`
  return `${BINANCE_WS_BASE}/${stream}`
}
