import type { Build, BottleneckResult, UseCase } from '../types'
import { USE_CASE_LABELS } from '../types'

const CPU_WEIGHT: Record<UseCase, number> = {
  '1080p': 0.82,
  '1440p': 1.0,
  '4k': 1.12,
  productivity: 1.35,
}

const USE_CASE_CONTEXT: Record<UseCase, string> = {
  '1080p': 'at 1080p',
  '1440p': 'at 1440p',
  '4k': 'at 4K',
  productivity: 'for productivity workloads',
}

export function analyzeBottleneck(build: Build, useCase: UseCase = '1440p'): BottleneckResult {
  const cpuScore = build.cpu?.performanceScore ?? 0
  const gpuScore = build.gpu?.performanceScore ?? 0

  if (!cpuScore || !gpuScore) {
    return {
      cpuUtilization: 50,
      gpuUtilization: 50,
      balanceScore: 0,
      verdict: 'Add both a CPU and GPU to analyze gaming balance.',
      limitingFactor: 'unknown',
    }
  }

  const weight = CPU_WEIGHT[useCase]
  const effectiveRatio = (cpuScore * weight) / gpuScore
  const ctx = USE_CASE_CONTEXT[useCase]
  const label = USE_CASE_LABELS[useCase]

  let cpuUtil: number
  let gpuUtil: number
  let limitingFactor: BottleneckResult['limitingFactor']
  let verdict: string

  if (effectiveRatio >= 0.85 && effectiveRatio <= 1.15) {
    cpuUtil = 92
    gpuUtil = 92
    limitingFactor = 'balanced'
    verdict = `Well balanced ${ctx} — neither part should hold the other back in most scenarios.`
  } else if (effectiveRatio < 0.85) {
    const imbalance = 1 - effectiveRatio
    cpuUtil = Math.min(99, 70 + imbalance * 80)
    gpuUtil = Math.max(40, 95 - imbalance * 60)
    limitingFactor = 'cpu'
    const pct = Math.round((1 - effectiveRatio) * 100)
    verdict = `CPU-limited ${ctx} — your GPU has headroom. Expect ~${pct}% lower FPS in CPU-heavy titles. (${label} profile)`
  } else {
    const imbalance = effectiveRatio - 1
    gpuUtil = Math.min(99, 70 + imbalance * 80)
    cpuUtil = Math.max(40, 95 - imbalance * 60)
    limitingFactor = 'gpu'
    verdict = `GPU-limited ${ctx} — graphics card is the bottleneck. Upgrade GPU for higher FPS or visual settings. (${label} profile)`
  }

  const balanceScore = Math.round(100 - Math.abs(cpuScore * weight - gpuScore) * 1.1)
  const clampedBalance = Math.max(0, Math.min(100, balanceScore))

  return {
    cpuUtilization: Math.round(cpuUtil),
    gpuUtilization: Math.round(gpuUtil),
    balanceScore: clampedBalance,
    verdict,
    limitingFactor,
  }
}
