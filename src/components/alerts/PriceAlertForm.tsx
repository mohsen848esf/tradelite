import { useState, type FormEvent } from 'react'
import type { PriceAlert } from '@/types/market'
import './PriceAlertForm.css'

type PriceAlertFormProps = {
  symbol: string
  currentPrice?: number | null
  onSubmit: (input: {
    symbol: string
    targetPrice: number
    direction: PriceAlert['direction']
    note?: string
  }) => void
  onRequestNotifications?: () => void
}

export function PriceAlertForm({ symbol, currentPrice, onSubmit, onRequestNotifications }: PriceAlertFormProps) {
  const [targetPrice, setTargetPrice] = useState('')
  const [direction, setDirection] = useState<PriceAlert['direction']>('above')
  const [note, setNote] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const price = Number(targetPrice)

    if (!Number.isFinite(price) || price <= 0) {
      return
    }

    onSubmit({ symbol, targetPrice: price, direction, note: note.trim() || undefined })
    setTargetPrice('')
    setNote('')
  }

  return (
    <form className="price-alert-form" onSubmit={handleSubmit}>
      <label className="price-alert-form__field">
        <div className="price-alert-form__label-row">
          <span>Target price</span>
          {currentPrice !== undefined && currentPrice !== null && (
            <button
              type="button"
              className="price-alert-form__use-current"
              onClick={() => setTargetPrice(currentPrice.toString())}
            >
              Use current ({currentPrice})
            </button>
          )}
        </div>
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

      <label className="price-alert-form__field">
        <span>Description / Note (optional)</span>
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. Resistance level target"
        />
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
