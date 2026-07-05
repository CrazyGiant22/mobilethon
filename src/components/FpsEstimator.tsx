import { useMemo } from 'react'
import type { Build, UseCase } from '../types'
import { estimateFps, fpsTargetResolution } from '../utils/fps'

interface FpsEstimatorProps {
  build: Build
  useCase: UseCase
}

function fpsColor(fps: number): string {
  if (fps >= 144) return 'text-accent-emerald'
  if (fps >= 90) return 'text-accent-cyan'
  if (fps >= 60) return 'text-accent-amber'
  return 'text-accent-rose'
}

function fpsBarWidth(fps: number): number {
  return Math.min(100, (fps / 240) * 100)
}

export function FpsEstimator({ build, useCase }: FpsEstimatorProps) {
  const estimates = useMemo(() => estimateFps(build, useCase), [build, useCase])
  const resolution = fpsTargetResolution(build, useCase)

  if (!estimates) return null

  return (
    <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-5">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-slate-300">Estimated FPS</h4>
        <span className="text-xs font-mono text-slate-400">{resolution}</span>
      </div>
      <p className="text-xs text-slate-500 mb-4">Rough averages — real performance varies by game and settings.</p>
      <div className="space-y-3">
        {estimates.map((est) => (
          <div key={est.profile}>
            <div className="flex items-baseline justify-between mb-1">
              <div className="min-w-0">
                <span className="text-sm text-white font-medium">{est.profile}</span>
                <span className="text-xs text-slate-500 ml-2 hidden sm:inline">{est.description}</span>
              </div>
              <span className={`text-lg font-bold font-mono shrink-0 ${fpsColor(est.fps)}`}>
                {est.fps}
                <span className="text-xs text-slate-500 ml-1">fps</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-600 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue transition-all duration-500`}
                style={{ width: `${fpsBarWidth(est.fps)}%` }}
              />
            </div>
            {est.cpuLimited && (
              <p className="text-[11px] text-accent-amber mt-1">CPU-limited at this profile</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
