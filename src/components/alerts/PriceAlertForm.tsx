import { useState, type FormEvent } from 'react'
import type { PriceAlert } from '@/types/market'
import './PriceAlertForm.css'

type PriceAlertFormProps = {
  symbol: string
  onSubmit: (input: {
    symbol: string
    targetPrice: number
    direction: PriceAlert['direction']
  }) => void
  onRequestNotifications?: () => void
}

export function PriceAlertForm({ symbol, onSubmit, onRequestNotifications }: PriceAlertFormProps) {
  const [targetPrice, setTargetPrice] = useState('')
  const [direction, setDirection] = useState<PriceAlert['direction']>('above')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const price = Number(targetPrice)

    if (!Number.isFinite(price) || price <= 0) {
      return
    }

    onSubmit({ symbol, targetPrice: price, direction })
    setTargetPrice('')
  }

  return (
    <form className="price-alert-form" onSubmit={handleSubmit}>
      <label className="price-alert-form__field">
        <span>Target price</span>
        <input
          type="number"
          min="0"
          step="any"
          value={targetPrice}
          onChange={(event) => setTargetPrice(event.target.value)}
          placeholder="0.00"
          required
        />
      </label>

      <label className="price-alert-form__field">
        <span>Direction</span>
        <select value={direction} onChange={(event) => setDirection(event.target.value as PriceAlert['direction'])}>
          <option value="above">Price goes above</option>
          <option value="below">Price goes below</option>
        </select>
      </label>

      <button type="submit" className="price-alert-form__submit">
        Add alert for {symbol}
      </button>

      {onRequestNotifications && (
        <button type="button" className="price-alert-form__notify" onClick={onRequestNotifications}>
          Enable browser notifications
        </button>
      )}
    </form>
  )
}
