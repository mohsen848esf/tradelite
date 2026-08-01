import type { KlineInterval } from '@/constants/market'
import './TimeframePresets.css'

const PRESETS: { label: string; value: KlineInterval }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
]

type TimeframePresetsProps = {
  currentInterval: KlineInterval
  onSelectInterval: (interval: KlineInterval) => void
}

export function TimeframePresets({ currentInterval, onSelectInterval }: TimeframePresetsProps) {
  return (
    <div className="timeframe-presets">
      <span className="timeframe-presets__label">Timeframe:</span>
      <div className="timeframe-presets__list">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`timeframe-presets__btn${currentInterval === preset.value ? ' timeframe-presets__btn--active' : ''}`}
            onClick={() => onSelectInterval(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
