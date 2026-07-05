import type { BottleneckResult } from '../types'

interface BottleneckChartProps {
  bottleneck: BottleneckResult
}

export function BottleneckChart({ bottleneck }: BottleneckChartProps) {
  const { cpuUtilization, gpuUtilization, balanceScore, verdict, limitingFactor } = bottleneck

  const barColor = (side: 'cpu' | 'gpu') => {
    if (limitingFactor === 'balanced') return 'from-accent-emerald to-accent-cyan'
    if (limitingFactor === side) return 'from-accent-amber to-accent-rose'
    return 'from-accent-cyan to-accent-blue'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-300">CPU / GPU Balance</h4>
        <span className="text-lg font-bold font-mono text-accent-cyan">{balanceScore}</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">CPU utilization</span>
            <span className="font-mono text-slate-300">{cpuUtilization}%</span>
          </div>
          <div className="h-3 rounded-full bg-surface-600 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barColor('cpu')} transition-all duration-700`}
              style={{ width: `${cpuUtilization}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">GPU utilization</span>
            <span className="font-mono text-slate-300">{gpuUtilization}%</span>
          </div>
          <div className="h-3 rounded-full bg-surface-600 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barColor('gpu')} transition-all duration-700`}
              style={{ width: `${gpuUtilization}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed">{verdict}</p>
    </div>
  )
}
