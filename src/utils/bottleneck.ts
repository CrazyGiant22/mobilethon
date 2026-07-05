import type {
  Build,
  BottleneckResult,
  BottleneckSeverity,
  BottleneckFix,
  SecondaryBottleneck,
  UseCase,
  PCComponent,
} from '../types'
import { USE_CASE_LABELS } from '../types'
import { getComponentsByCategory } from '../data/components'

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

const EMPTY_RESULT: BottleneckResult = {
  cpuUtilization: 50,
  gpuUtilization: 50,
  balanceScore: 0,
  verdict: 'Add both a CPU and GPU to analyze gaming balance.',
  limitingFactor: 'unknown',
  severity: 'none',
  impactPct: 0,
  fixes: [],
  prevention: [
    'Match your CPU and GPU tiers — a mid-range CPU pairs best with a mid-range GPU.',
    'Buy resolution-appropriate parts: prioritize the CPU for 1080p high-refresh, the GPU for 4K.',
  ],
  secondary: [],
}

function severityFromImpact(impactPct: number): BottleneckSeverity {
  if (impactPct <= 0) return 'none'
  if (impactPct <= 20) return 'minor'
  if (impactPct <= 40) return 'moderate'
  return 'severe'
}

/** Finds a stronger same-socket/compatible part that would rebalance the build. */
function suggestBalancingPart(
  build: Build,
  category: 'cpu' | 'gpu',
  targetScore: number,
): PCComponent | undefined {
  const candidates = getComponentsByCategory(category).filter((c) => {
    const score = c.performanceScore ?? 0
    if (category === 'cpu') {
      const current = build.cpu?.performanceScore ?? 0
      const socket = build.motherboard?.specs.socket ?? build.cpu?.specs.socket
      const socketOk = !socket || c.specs.socket === socket
      return socketOk && score > current
    }
    const current = build.gpu?.performanceScore ?? 0
    const fitsCase = !build.case || Number(c.specs.length) <= Number(build.case.specs.maxGpuLength)
    return fitsCase && score > current
  })

  if (candidates.length === 0) return undefined

  // Closest to the target score (the part it should match), then cheapest.
  return candidates.sort((a, b) => {
    const da = Math.abs((a.performanceScore ?? 0) - targetScore)
    const db = Math.abs((b.performanceScore ?? 0) - targetScore)
    if (da !== db) return da - db
    return a.price - b.price
  })[0]
}

function detectSecondary(build: Build, useCase: UseCase): SecondaryBottleneck[] {
  const out: SecondaryBottleneck[] = []

  if (build.ram) {
    const type = String(build.ram.specs.type)
    const speed = Number(build.ram.specs.speed)
    const capacity = Number(build.ram.specs.capacity)
    const sweetSpot = type === 'DDR5' ? 6000 : 3200
    if (speed < sweetSpot) {
      out.push({
        id: 'ram-speed',
        component: 'ram',
        severity: 'minor',
        message: `RAM at ${speed}MT/s is below the ${type} sweet spot (${sweetSpot}MT/s), which can cap 1% lows.`,
        fix: `Use ${type}-${sweetSpot} and enable EXPO/XMP in BIOS to run at rated speed.`,
        actionCategory: 'ram',
      })
    }
    if (capacity < 16) {
      out.push({
        id: 'ram-capacity',
        component: 'ram',
        severity: 'moderate',
        message: `${capacity}GB can cause stutter and texture streaming issues in modern games.`,
        fix: 'Move to at least 16GB (32GB for streaming/creation).',
        actionCategory: 'ram',
      })
    }
  }

  if (build.storage && String(build.storage.specs.type) === 'SATA') {
    out.push({
      id: 'storage-sata',
      component: 'storage',
      severity: 'minor',
      message: 'A SATA SSD limits game load times and asset streaming versus NVMe.',
      fix: 'Add an NVMe SSD for the OS and your most-played games.',
      actionCategory: 'storage',
    })
  }

  if (build.gpu) {
    const vram = Number(build.gpu.specs.vram)
    const is4k = useCase === '4k' || (build.monitor && Number(build.monitor.specs.pixels) >= 8_000_000)
    const is1440 = useCase === '1440p' || (build.monitor && Number(build.monitor.specs.pixels) >= 3_600_000)
    if (is4k && vram < 12) {
      out.push({
        id: 'vram-4k',
        component: 'vram',
        severity: 'moderate',
        message: `${vram}GB VRAM is tight for 4K — expect texture pop-in or hitching at ultra settings.`,
        fix: 'Choose a 16GB+ GPU for 4K, or lower texture quality.',
        actionCategory: 'gpu',
      })
    } else if (is1440 && vram < 8) {
      out.push({
        id: 'vram-1440',
        component: 'vram',
        severity: 'minor',
        message: `${vram}GB VRAM can be limiting at 1440p in newer titles.`,
        fix: 'Prefer 8GB+ (12GB for headroom) at 1440p.',
        actionCategory: 'gpu',
      })
    }
  }

  return out
}

export function analyzeBottleneck(build: Build, useCase: UseCase = '1440p'): BottleneckResult {
  const cpuScore = build.cpu?.performanceScore ?? 0
  const gpuScore = build.gpu?.performanceScore ?? 0

  if (!cpuScore || !gpuScore) {
    return { ...EMPTY_RESULT, secondary: detectSecondary(build, useCase) }
  }

  const weight = CPU_WEIGHT[useCase]
  const effectiveRatio = (cpuScore * weight) / gpuScore
  const ctx = USE_CASE_CONTEXT[useCase]
  const label = USE_CASE_LABELS[useCase]

  let cpuUtil: number
  let gpuUtil: number
  let limitingFactor: BottleneckResult['limitingFactor']
  let verdict: string
  let impactPct = 0
  const fixes: BottleneckFix[] = []
  const prevention: string[] = [
    'Match CPU and GPU tiers when buying — pair a mid-range CPU with a mid-range GPU.',
    'Enable your memory profile (EXPO for AMD, XMP for Intel) in BIOS.',
    'Keep GPU drivers and motherboard chipset drivers up to date.',
  ]

  let suggestedUpgrade: PCComponent | undefined
  let suggestedUpgradeCategory: BottleneckResult['suggestedUpgradeCategory']

  if (effectiveRatio >= 0.85 && effectiveRatio <= 1.15) {
    cpuUtil = 92
    gpuUtil = 92
    limitingFactor = 'balanced'
    verdict = `Well balanced ${ctx} — neither part significantly holds the other back. (${label} profile)`
  } else if (effectiveRatio < 0.85) {
    const imbalance = 1 - effectiveRatio
    cpuUtil = Math.min(99, 70 + imbalance * 80)
    gpuUtil = Math.max(40, 95 - imbalance * 60)
    limitingFactor = 'cpu'
    impactPct = Math.round(imbalance * 100)
    verdict = `CPU-limited ${ctx} — your GPU sits idle waiting on the processor. Est. ~${impactPct}% FPS left on the table in CPU-heavy games. (${label} profile)`

    suggestedUpgrade = suggestBalancingPart(build, 'cpu', gpuScore / weight)
    suggestedUpgradeCategory = 'cpu'

    fixes.push(
      { text: 'Raise resolution or graphics settings to shift load onto the GPU — this often removes the bottleneck for free.' },
      { text: 'Enable EXPO/XMP so RAM runs at rated speed — CPU-bound games love memory bandwidth.', actionCategory: 'ram' },
      { text: 'Close background apps, browser tabs, and RGB/overlay software that steal CPU cycles.' },
    )
    if (suggestedUpgrade) {
      fixes.push({
        text: `Upgrade the processor — ${suggestedUpgrade.name} would match your GPU${build.cpu?.specs.socket ? ` on your ${build.cpu.specs.socket} socket` : ''}.`,
        actionCategory: 'cpu',
      })
    } else {
      fixes.push({ text: 'Upgrade to a faster CPU (a 3D V-Cache chip is ideal for gaming).', actionCategory: 'cpu' })
    }
    prevention.push('For 1080p high-refresh gaming, invest more in the CPU relative to the GPU.')
  } else {
    const imbalance = effectiveRatio - 1
    gpuUtil = Math.min(99, 70 + imbalance * 80)
    cpuUtil = Math.max(40, 95 - imbalance * 60)
    limitingFactor = 'gpu'
    impactPct = Math.round(imbalance * 100)
    verdict = `GPU-limited ${ctx} — the graphics card is maxed out first. This is ideal for max visuals, but caps FPS. (${label} profile)`

    suggestedUpgrade = suggestBalancingPart(build, 'gpu', cpuScore * weight)
    suggestedUpgradeCategory = 'gpu'

    fixes.push(
      { text: 'Turn on DLSS / FSR / XeSS upscaling — the single biggest free FPS boost when GPU-limited.' },
      { text: 'Lower the heaviest settings (ray tracing, shadows, volumetrics) or drop resolution a notch.' },
    )
    if (suggestedUpgrade) {
      fixes.push({
        text: `Upgrade the graphics card — ${suggestedUpgrade.name} would better match your CPU.`,
        actionCategory: 'gpu',
      })
    } else {
      fixes.push({ text: 'Upgrade to a higher-tier GPU for more frames or higher settings.', actionCategory: 'gpu' })
    }
    prevention.push('For 4K/ultra, invest more in the GPU — the CPU matters less as resolution rises.')
  }

  const severity = severityFromImpact(impactPct)
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(cpuScore * weight - gpuScore) * 1.1)))

  return {
    cpuUtilization: Math.round(cpuUtil),
    gpuUtilization: Math.round(gpuUtil),
    balanceScore,
    verdict,
    limitingFactor,
    severity,
    impactPct,
    fixes,
    prevention,
    secondary: detectSecondary(build, useCase),
    suggestedUpgradeId: suggestedUpgrade?.id,
    suggestedUpgradeCategory,
  }
}
