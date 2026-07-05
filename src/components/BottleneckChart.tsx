import { useState } from 'react'
import type { BottleneckResult, BottleneckSeverity, ComponentCategory } from '../types'

interface BottleneckChartProps {
  bottleneck: BottleneckResult
  onFixCategory?: (category: ComponentCategory) => void
}

const SEVERITY_META: Record<BottleneckSeverity, { label: string; badge: string; dot: string }> = {
  none: { label: 'Balanced', badge: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/25', dot: 'bg-accent-emerald' },
  minor: { label: 'Minor bottleneck', badge: 'bg-accent-blue/10 text-accent-blue border-accent-blue/25', dot: 'bg-accent-blue' },
  moderate: { label: 'Moderate bottleneck', badge: 'bg-accent-amber/10 text-accent-amber border-accent-amber/25', dot: 'bg-accent-amber' },
  severe: { label: 'Severe bottleneck', badge: 'bg-accent-rose/10 text-accent-rose border-accent-rose/25', dot: 'bg-accent-rose' },
}

export function BottleneckChart({ bottleneck, onFixCategory }: BottleneckChartProps) {
  const {
    cpuUtilization, gpuUtilization, balanceScore, verdict,
    limitingFactor, severity, impactPct, fixes, prevention, secondary,
  } = bottleneck
  const [showPrevention, setShowPrevention] = useState(false)

  const barColor = (side: 'cpu' | 'gpu') => {
    if (limitingFactor === 'balanced') return 'from-accent-emerald to-accent-cyan'
    if (limitingFactor === side) return 'from-accent-amber to-accent-rose'
    return 'from-accent-cyan to-accent-blue'
  }

  const meta = SEVERITY_META[severity]
  const analyzed = limitingFactor !== 'unknown'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-300">CPU / GPU Bottleneck</h4>
        {analyzed && (
          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${meta.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}{impactPct > 0 ? ` · ~${impactPct}%` : ''}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">CPU load{limitingFactor === 'cpu' ? ' (limiting)' : ''}</span>
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
            <span className="text-slate-400">GPU load{limitingFactor === 'gpu' ? ' (limiting)' : ''}</span>
            <span className="font-mono text-slate-300">{gpuUtilization}%</span>
          </div>
          <div className="h-3 rounded-full bg-surface-600 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barColor('gpu')} transition-all duration-700`}
              style={{ width: `${gpuUtilization}%` }}
            />
          </div>
        </div>
        {analyzed && (
          <div className="flex justify-between text-xs pt-1">
            <span className="text-slate-500">Balance score</span>
            <span className="font-mono text-accent-cyan">{balanceScore}/100</span>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-400 leading-relaxed">{verdict}</p>

      {/* Fixes */}
      {fixes.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">How to fix it</p>
          <ul className="space-y-1.5">
            {fixes.map((fix, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-400">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {fix.actionCategory && onFixCategory ? (
                  <button
                    onClick={() => onFixCategory(fix.actionCategory!)}
                    className="text-left hover:text-accent-cyan transition-colors underline decoration-dotted underline-offset-2"
                  >
                    {fix.text}
                  </button>
                ) : (
                  <span>{fix.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Secondary bottlenecks */}
      {secondary.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Other bottlenecks</p>
          <div className="space-y-2">
            {secondary.map((sb) => (
              <div
                key={sb.id}
                className={`rounded-lg border p-3 text-xs ${
                  sb.severity === 'moderate'
                    ? 'border-accent-amber/25 bg-accent-amber/5'
                    : 'border-surface-600/50 bg-surface-700/30'
                }`}
              >
                <p className="text-slate-300 font-medium capitalize">{sb.component} bottleneck</p>
                <p className="text-slate-400 mt-1">{sb.message}</p>
                {onFixCategory ? (
                  <button
                    onClick={() => onFixCategory(sb.actionCategory)}
                    className="text-accent-cyan mt-1.5 hover:underline"
                  >
                    Fix: {sb.fix}
                  </button>
                ) : (
                  <p className="text-accent-cyan mt-1.5">Fix: {sb.fix}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prevention */}
      {prevention.length > 0 && (
        <div className="pt-1 border-t border-surface-600/40">
          <button
            onClick={() => setShowPrevention((v) => !v)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 uppercase tracking-wider py-2"
            aria-expanded={showPrevention}
          >
            How to prevent bottlenecks
            <svg
              className={`w-4 h-4 transition-transform ${showPrevention ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPrevention && (
            <ul className="space-y-1.5 pb-1">
              {prevention.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-400">
                  <span className="text-accent-violet shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
