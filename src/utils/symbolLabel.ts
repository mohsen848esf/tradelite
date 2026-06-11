import { SYMBOLS } from '@/constants/market'

export function getSymbolLabel(symbol: string): string {
  return SYMBOLS.find((pair) => pair.symbol === symbol)?.label ?? symbol
}
