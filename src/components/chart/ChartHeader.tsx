import { getSymbolLabel } from '@/utils/symbolLabel'
import './ChartHeader.css'

type ChartHeaderProps = {
  symbol: string
  interval: string
}

export function ChartHeader({ symbol, interval }: ChartHeaderProps) {
  const label = SYMBOLS.find((pair) => pair.symbol === symbol)?.label ?? symbol

  return (
    <div className="chart-header">
      <h2 className="chart-header__title">{label}</h2>
      <span className="chart-header__interval">{interval} candlesticks</span>
    </div>
  )
}
