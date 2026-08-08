import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import {
  CandlestickSeries,
  LineSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { fetchHistoricalKlines } from '@/services/binance'
import { calculateSMA, calculateEMA } from '@/utils/indicators'
import { calculateRSI } from '@/utils/rsi'
import { calculateMACD } from '@/utils/macd'
import { exportCandlestickDataToCsv } from '@/utils/exportCsv'
import { exportChartSnapshot } from '@/utils/exportSnapshot'
import { TrendlineCanvas, type Trendline } from './TrendlineCanvas'
import type { Kline } from '@/types/market'
import './CandlestickChart.css'

export type CandlestickChartRef = {
  exportCsv: () => void
  exportSnapshot: () => void
}

type CandlestickChartProps = {
  symbol: string
  interval: string
  kline: Kline | null
  showSMA: boolean
  showEMA: boolean
  showRSI?: boolean
  showMACD?: boolean
  drawMode?: boolean
  trendlines?: Trendline[]
  onAddTrendline?: (line: Trendline) => void
  onClearTrendlines?: () => void
  theme: 'dark' | 'light'
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

export const CandlestickChart = forwardRef<CandlestickChartRef, CandlestickChartProps>(
  function CandlestickChart(
    {
      symbol,
      interval,
      kline,
      showSMA,
      showEMA,
      showRSI,
      showMACD,
      drawMode = false,
      trendlines = [],
      onAddTrendline,
      theme,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const macdSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const historyRef = useRef<Kline[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
      exportCsv() {
        exportCandlestickDataToCsv(symbol, interval, historyRef.current)
      },
      exportSnapshot() {
        exportChartSnapshot(chartRef.current, symbol)
      },
    }))

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

      const smaSeries = chart.addSeries(LineSeries, {
        color: '#e3b341',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      })

      const emaSeries = chart.addSeries(LineSeries, {
        color: '#58a6ff',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      })

      const rsiSeries = chart.addSeries(LineSeries, {
        color: '#a371f7',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      })

      const macdSeries = chart.addSeries(LineSeries, {
        color: '#f0883e',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      })

      chartRef.current = chart
      seriesRef.current = series
      smaSeriesRef.current = smaSeries
      emaSeriesRef.current = emaSeries
      rsiSeriesRef.current = rsiSeries
      macdSeriesRef.current = macdSeries

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
        smaSeriesRef.current = null
        emaSeriesRef.current = null
        rsiSeriesRef.current = null
        macdSeriesRef.current = null
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
          const history = await fetchHistoricalKlines(symbol, interval)
          if (cancelled || !seriesRef.current) {
            return
          }

          historyRef.current = history
          seriesRef.current.setData(history.map(toChartCandle))

          // Set initial indicator values
          if (smaSeriesRef.current) {
            const smaData = calculateSMA(history, 14).map((p) => ({
              time: p.time as UTCTimestamp,
              value: p.value,
            }))
            smaSeriesRef.current.setData(smaData)
          }
          if (emaSeriesRef.current) {
            const emaData = calculateEMA(history, 20).map((p) => ({
              time: p.time as UTCTimestamp,
              value: p.value,
            }))
            emaSeriesRef.current.setData(emaData)
          }
          if (rsiSeriesRef.current) {
            const rsiData = calculateRSI(history, 14).map((p) => ({
              time: p.time as UTCTimestamp,
              value: p.value,
            }))
            rsiSeriesRef.current.setData(rsiData)
          }
          if (macdSeriesRef.current) {
            const macdData = calculateMACD(history).map((p) => ({
              time: p.time as UTCTimestamp,
              value: p.macd,
            }))
            macdSeriesRef.current.setData(macdData)
          }

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
    }, [symbol, interval])

    // Apply visibility options when state changes
    useEffect(() => {
      smaSeriesRef.current?.applyOptions({ visible: showSMA })
    }, [showSMA])

    useEffect(() => {
      emaSeriesRef.current?.applyOptions({ visible: showEMA })
    }, [showEMA])

    useEffect(() => {
      rsiSeriesRef.current?.applyOptions({ visible: Boolean(showRSI) })
    }, [showRSI])

    useEffect(() => {
      macdSeriesRef.current?.applyOptions({ visible: Boolean(showMACD) })
    }, [showMACD])

    // Apply theme changes dynamically to the chart
    useEffect(() => {
      const chart = chartRef.current
      if (!chart) return

      const isDark = theme === 'dark'
      chart.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: isDark ? '#161b22' : '#ffffff' },
          textColor: isDark ? '#8b949e' : '#57606a',
        },
        grid: {
          vertLines: { color: isDark ? '#21262d' : '#e0e0e0' },
          horzLines: { color: isDark ? '#21262d' : '#e0e0e0' },
        },
        rightPriceScale: {
          borderColor: isDark ? '#30363d' : '#d0d7de',
        },
        timeScale: {
          borderColor: isDark ? '#30363d' : '#d0d7de',
        },
      })
    }, [theme])

    useEffect(() => {
      const series = seriesRef.current
      const smaSeries = smaSeriesRef.current
      const emaSeries = emaSeriesRef.current

      if (!series || !kline) {
        return
      }

      series.update(toChartCandle(kline))

      // Update history ref
      const history = historyRef.current
      if (history.length > 0) {
        const lastIndex = history.length - 1
        if (history[lastIndex].time === kline.time) {
          history[lastIndex] = kline
        } else {
          history.push(kline)
        }

        // Recompute and update SMA/EMA in real-time
        const smaData = calculateSMA(history, 14)
        if (smaData.length > 0 && smaSeries) {
          const lastPoint = smaData[smaData.length - 1]
          smaSeries.update({
            time: lastPoint.time as UTCTimestamp,
            value: lastPoint.value,
          })
        }
        const emaData = calculateEMA(history, 20)
        if (emaData.length > 0 && emaSeries) {
          const lastPoint = emaData[emaData.length - 1]
          emaSeries.update({
            time: lastPoint.time as UTCTimestamp,
            value: lastPoint.value,
          })
        }
      }
    }, [kline])

    return (
      <div className="candlestick-chart">
        <div ref={containerRef} className="candlestick-chart__canvas" />
        <TrendlineCanvas
          active={drawMode}
          lines={trendlines}
          onAddLine={(line) => onAddTrendline?.(line)}
        />
        {loading && <div className="candlestick-chart__overlay">Loading chart…</div>}
        {error && <div className="candlestick-chart__overlay candlestick-chart__overlay--error">{error}</div>}
      </div>
    )
  }
)
