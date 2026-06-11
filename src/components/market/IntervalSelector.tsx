import { KLINE_INTERVALS, type KlineInterval } from '@/constants/market'
import './IntervalSelector.css'

type IntervalSelectorProps = {
  value: KlineInterval
  onChange: (interval: KlineInterval) => void
}

export function IntervalSelector({ value, onChange }: IntervalSelectorProps) {
  return (
    <div className="interval-selector" role="group" aria-label="Chart interval">
      {KLINE_INTERVALS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`interval-selector__btn${value === option.value ? ' interval-selector__btn--active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
