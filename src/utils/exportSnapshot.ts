import type { IChartApi } from 'lightweight-charts'

export function exportChartSnapshot(chart: IChartApi | null, symbol: string): void {
  if (!chart) return

  const canvas = chart.takeScreenshot()
  const image = canvas.toDataURL('image/png')
  const dateStr = new Date().toISOString().split('T')[0]
  const fileName = `${symbol.toLowerCase()}_chart_${dateStr}.png`

  const link = document.createElement('a')
  link.href = image
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
