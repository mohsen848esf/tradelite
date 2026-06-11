export function formatPrice(
  value: number,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 8 } = options

  return value.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })
}

export function formatUsd(value: number): string {
  return `$${formatPrice(value)}`
}
