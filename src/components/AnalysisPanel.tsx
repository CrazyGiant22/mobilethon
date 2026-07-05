import type { BuildAnalysis, Build } from '../types'
import { BottleneckChart } from './BottleneckChart'

interface AnalysisPanelProps {
  analysis: BuildAnalysis
  build: Build
}

const TIER_COLORS = {
  entry: 'text-slate-400',
  mid: 'text-accent-blue',
  high: 'text-accent-violet',
  enthusiast: 'text-accent-amber',
}

const SEVERITY_STYLES = {
  error: 'border-accent-rose/30 bg-accent-rose/5 text-accent-rose',
  warning: 'border-accent-amber/30 bg-accent-amber/5 text-accent-amber',
  info: 'border-accent-blue/30 bg-accent-blue/5 text-accent-blue',
  success: 'border-accent-emerald/30 bg-accent-emerald/5 text-accent-emerald',
}

const PRIORITY_STYLES = {
  high: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
  medium: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  low: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
}

export function AnalysisPanel({ analysis, build }: AnalysisPanelProps) {
  const { issues, bottleneck, power, performance, recommendations } = analysis
  const hasBuild = build.cpu || build.gpu

  if (!hasBuild) {
    return (
      <div id="analysis" className="rounded-2xl bg-surface-800 border border-surface-600/50 p-12 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-700 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Analysis ready when you are</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Pick a preset or start adding components. BuildForge will check compatibility,
          analyze bottlenecks, and recommend optimizations in real time.
        </p>
      </div>
    )
  }

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  return (
    <div id="analysis" className="space-y-4 animate-fade-in">
      {/* Performance tier */}
      <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Performance tier</p>
            <p className={`text-2xl font-bold mt-1 ${TIER_COLORS[performance.tier]}`}>
              {performance.tierLabel}
            </p>
          </div>
          <div className="flex gap-6">
            <ScoreRing label="Gaming" score={performance.gamingScore} color="cyan" />
            <ScoreRing label="Productivity" score={performance.productivityScore} color="violet" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bottleneck */}
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-5">
          <BottleneckChart bottleneck={bottleneck} />
        </div>

        {/* Power */}
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-5">
          <h4 className="text-sm font-medium text-slate-300 mb-4">Power Estimate</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-sm">Estimated draw</span>
              <span className="text-2xl font-bold font-mono text-white">{power.estimatedDraw}W</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-sm">Recommended PSU</span>
              <span className="text-lg font-mono text-accent-cyan">{power.recommendedWattage}W+</span>
            </div>
            {build.psu && (
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">Your PSU headroom</span>
                <span className={`text-lg font-mono ${power.psuAdequate ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {power.headroom}%
                </span>
              </div>
            )}
            {!power.psuAdequate && build.psu && (
              <p className="text-xs text-accent-rose mt-2">
                PSU is undersized for this build. Upgrade to at least {power.recommendedWattage}W.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compatibility */}
      {issues.length > 0 && (
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-sm font-medium text-slate-300">Compatibility</h4>
            {errors.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-rose/10 text-accent-rose border border-accent-rose/20">
                {errors.length} error{errors.length > 1 ? 's' : ''}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                {warnings.length} warning{warnings.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`px-4 py-3 rounded-xl border text-sm ${SEVERITY_STYLES[issue.severity]}`}
              >
                <p className="font-medium">{issue.title}</p>
                <p className="text-xs mt-1 opacity-80">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-5">
          <h4 className="text-sm font-medium text-slate-300 mb-4">Optimization recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex gap-3 p-4 rounded-xl bg-surface-700/30 border border-surface-600/30">
                <span className={`text-xs px-2 py-1 rounded-md border shrink-0 h-fit ${PRIORITY_STYLES[rec.priority]}`}>
                  {rec.priority}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{rec.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
                  {rec.estimatedGain && (
                    <p className="text-xs text-accent-emerald mt-1.5 font-mono">{rec.estimatedGain}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreRing({ label, score, color }: { label: string; score: number; color: 'cyan' | 'violet' }) {
  const strokeColor = color === 'cyan' ? '#22d3ee' : '#a78bfa'
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#243044" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={strokeColor} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold font-mono text-white">
          {score || '—'}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  )
}
