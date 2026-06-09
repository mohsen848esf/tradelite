import { useEffect, useRef, useState } from 'react'
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { fetchHistoricalKlines } from '@/services/binance'
import type { Kline } from '@/types/market'
import './CandlestickChart.css'

type CandlestickChartProps = {
  symbol: string
  kline: Kline | null
}

function toChartCandle(kline: Kline) {
  return {
    time: kline.time as UTCTimestamp,
    open: kline.open,
    high: kline.high,
    low: kline.low,
    close: kline.close,
  }
}

export function CandlestickChart({ symbol, kline }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#161b22' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: '#21262d' },
        horzLines: { color: '#21262d' },
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: 420,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950',
      downColor: '#f85149',
      borderVisible: false,
      wickUpColor: '#3fb950',
      wickDownColor: '#f85149',
    })

    chartRef.current = chart
    seriesRef.current = series

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (!entry) {
        return
      }

      chart.applyOptions({ width: entry.contentRect.width })
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    const activeSeries = seriesRef.current

    if (!activeSeries) {
      return
    }

    let cancelled = false

    async function loadHistory() {
      setLoading(true)
      setError(null)

      try {
        const history = await fetchHistoricalKlines(symbol)
        if (cancelled || !seriesRef.current) {
          return
        }

        seriesRef.current.setData(history.map(toChartCandle))
        chartRef.current?.timeScale().fitContent()
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load chart data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      cancelled = true
    }
  }, [symbol])

  useEffect(() => {
    const series = seriesRef.current

    if (!series || !kline) {
      return
    }

    series.update(toChartCandle(kline))
  }, [kline])

  return (
    <div className="candlestick-chart">
      <div ref={containerRef} className="candlestick-chart__canvas" />
      {loading && <div className="candlestick-chart__overlay">Loading chart…</div>}
      {error && <div className="candlestick-chart__overlay candlestick-chart__overlay--error">{error}</div>}
    </div>
  )
}
