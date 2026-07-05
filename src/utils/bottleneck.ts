import type { Build, BottleneckResult } from '../types'

export function analyzeBottleneck(build: Build): BottleneckResult {
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

  const ratio = cpuScore / gpuScore

  let cpuUtil: number
  let gpuUtil: number
  let limitingFactor: BottleneckResult['limitingFactor']
  let verdict: string

  if (ratio >= 0.85 && ratio <= 1.15) {
    cpuUtil = 92
    gpuUtil = 92
    limitingFactor = 'balanced'
    verdict = 'Excellent balance — neither component will significantly hold back the other in most games.'
  } else if (ratio < 0.85) {
    const imbalance = 1 - ratio
    cpuUtil = Math.min(99, 70 + imbalance * 80)
    gpuUtil = Math.max(40, 95 - imbalance * 60)
    limitingFactor = 'cpu'
    const pct = Math.round((1 - ratio) * 100)
    verdict = `CPU-limited setup — your processor may cap FPS by ~${pct}% in CPU-heavy titles (open worlds, sims, MMOs).`
  } else {
    const imbalance = ratio - 1
    gpuUtil = Math.min(99, 70 + imbalance * 80)
    cpuUtil = Math.max(40, 95 - imbalance * 60)
    limitingFactor = 'gpu'
    verdict = `GPU-limited setup — graphics card is the bottleneck. Fine for max settings; upgrade GPU for higher FPS.`
  }

  const balanceScore = Math.round(100 - Math.abs(cpuScore - gpuScore) * 1.2)
  const clampedBalance = Math.max(0, Math.min(100, balanceScore))

  return {
    cpuUtilization: Math.round(cpuUtil),
    gpuUtilization: Math.round(gpuUtil),
    balanceScore: clampedBalance,
    verdict,
    limitingFactor,
  }
}
