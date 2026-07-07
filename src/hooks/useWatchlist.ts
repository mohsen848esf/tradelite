import { useCallback } from 'react'
import { usePersistedState } from './usePersistedState'
import { STORAGE_KEYS } from '@/constants/storage'
import { DEFAULT_SYMBOL } from '@/constants/market'

export function useWatchlist() {
  const [watchlist, setWatchlist] = usePersistedState<string[]>(STORAGE_KEYS.watchlist, [
    DEFAULT_SYMBOL,
    'ETHUSDT',
    'SOLUSDT',
  ])

  const toggleWatchlist = useCallback(
    (symbol: string) => {
      setWatchlist((prev) => {
        if (prev.includes(symbol)) {
          return prev.filter((s) => s !== symbol)
        }
        return [...prev, symbol]
      })
    },
    [setWatchlist],
  )

  const isWatched = useCallback(
    (symbol: string) => {
      return watchlist.includes(symbol)
    },
    [watchlist],
  )

  return { watchlist, toggleWatchlist, isWatched }
}
