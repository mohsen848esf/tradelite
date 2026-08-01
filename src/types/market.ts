export type SymbolPair = {
  symbol: string
  label: string
}

export type Kline = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type PriceAlert = {
  id: string
  symbol: string
  targetPrice: number
  direction: 'above' | 'below'
  triggered: boolean
  createdAt: number
  note?: string
  triggeredAt?: number
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
