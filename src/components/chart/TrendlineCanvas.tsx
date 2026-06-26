export type LinePoint = { x: number; y: number }
export type Trendline = { id: string; start: LinePoint; end: LinePoint }

import { useRef, useState, type MouseEvent } from 'react'
import './TrendlineCanvas.css'

type TrendlineCanvasProps = {
  active: boolean
  lines: Trendline[]
  onAddLine: (line: Trendline) => void
}

export function TrendlineCanvas({ active, lines, onAddLine }: TrendlineCanvasProps) {
  const [startPoint, setStartPoint] = useState<LinePoint | null>(null)
  const [currentPoint, setCurrentPoint] = useState<LinePoint | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function getPoint(e: MouseEvent<HTMLDivElement>): LinePoint {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (!active) return
    const p = getPoint(e)
    setStartPoint(p)
    setCurrentPoint(p)
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!active || !startPoint) return
    setCurrentPoint(getPoint(e))
  }

  function handleMouseUp(e: MouseEvent<HTMLDivElement>) {
    if (!active || !startPoint) return
    const end = getPoint(e)
    if (Math.hypot(end.x - startPoint.x, end.y - startPoint.y) > 5) {
      onAddLine({
        id: crypto.randomUUID(),
        start: startPoint,
        end,
      })
    }
    setStartPoint(null)
    setCurrentPoint(null)
  }

  return (
    <div
      ref={containerRef}
      className={`trendline-canvas${active ? ' trendline-canvas--active' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg className="trendline-canvas__svg">
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            stroke="#58a6ff"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        ))}
        {startPoint && currentPoint && (
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={currentPoint.x}
            y2={currentPoint.y}
            stroke="#e3b341"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  )
}
