import type { BuildAnalysis } from '../types'

interface BuildRadarProps {
  analysis: BuildAnalysis
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function BuildRadar({ analysis }: BuildRadarProps) {
  const { performance, thermal, bottleneck, power, totalCost } = analysis

  const valuePer100 = totalCost > 0 ? (performance.gamingScore / totalCost) * 100 : 0
  const value = clamp(valuePer100 * 6)
  const efficiency = clamp((performance.gamingScore / Math.max(1, power.estimatedDraw)) * 400)

  const axes = [
    { label: 'Gaming', value: clamp(performance.gamingScore) },
    { label: 'Productivity', value: clamp(performance.productivityScore) },
    { label: 'Cooling', value: clamp(thermal.coolingScore) },
    { label: 'Value', value },
    { label: 'Efficiency', value: efficiency },
    { label: 'Balance', value: clamp(bottleneck.balanceScore) },
  ]

  const size = 240
  const cx = size / 2
  const cy = size / 2
  const maxR = 82
  const n = axes.length

  const pointAt = (i: number, r: number) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const
  }

  const dataPoints = axes.map((a, i) => pointAt(i, (a.value / 100) * maxR))
  const dataPath = dataPoints.map((p) => p.join(',')).join(' ')

  return (
    <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-5">
      <h4 className="text-sm font-medium text-slate-300 mb-2">Build Profile</h4>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-56 h-56 shrink-0">
          {/* rings */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon
              key={f}
              points={axes.map((_, i) => pointAt(i, maxR * f).join(',')).join(' ')}
              fill="none"
              stroke="#243044"
              strokeWidth="1"
            />
          ))}
          {/* spokes */}
          {axes.map((_, i) => {
            const [x, y] = pointAt(i, maxR)
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#243044" strokeWidth="1" />
          })}
          {/* data polygon */}
          <polygon points={dataPath} fill="rgba(34,211,238,0.18)" stroke="#22d3ee" strokeWidth="2" />
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#22d3ee" />
          ))}
          {/* labels */}
          {axes.map((a, i) => {
            const [x, y] = pointAt(i, maxR + 16)
            return (
              <text
                key={a.label}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                {a.label}
              </text>
            )
          })}
        </svg>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-sm">
          {axes.map((a) => (
            <div key={a.label} className="flex items-center justify-between gap-2">
              <span className="text-slate-400 text-xs">{a.label}</span>
              <span className="font-mono text-white text-xs">{a.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
