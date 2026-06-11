export function formatPrice(value: number, maximumFractionDigits = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  })
}

export function formatUsdPrice(value: number, maximumFractionDigits = 2): string {
  return `$${formatPrice(value, maximumFractionDigits)}`
}
