import type { Build, UseCase } from '../types'

export interface FpsEstimate {
  profile: string
  description: string
  fps: number
  cpuLimited: boolean
}

const RESOLUTION_FACTOR: Record<string, number> = {
  '1920x1080': 1.0,
  '2560x1440': 1.7,
  '3840x2160': 3.6,
}

const USE_CASE_RESOLUTION: Record<UseCase, string> = {
  '1080p': '1920x1080',
  '1440p': '2560x1440',
  '4k': '3840x2160',
  productivity: '2560x1440',
}

interface GameProfile {
  profile: string
  description: string
  base: number
  cpuMultiplier: number
}

const GAME_PROFILES: GameProfile[] = [
  { profile: 'Esports', description: 'CS2, Valorant, LoL (low settings)', base: 480, cpuMultiplier: 5.5 },
  { profile: 'Competitive', description: 'Fortnite, Apex (high settings)', base: 300, cpuMultiplier: 4 },
  { profile: 'AAA', description: 'Cyberpunk, Alan Wake (ultra)', base: 150, cpuMultiplier: 2.4 },
]

/** Returns null when a CPU + GPU aren't both present. */
export function estimateFps(build: Build, useCase: UseCase): FpsEstimate[] | null {
  const gpuScore = build.gpu?.performanceScore ?? 0
  const cpuScore = build.cpu?.performanceScore ?? 0
  if (!gpuScore || !cpuScore) return null

  const resolution = build.monitor
    ? String(build.monitor.specs.resolution)
    : USE_CASE_RESOLUTION[useCase]
  const resFactor = RESOLUTION_FACTOR[resolution] ?? 1.7

  return GAME_PROFILES.map(({ profile, description, base, cpuMultiplier }) => {
    const gpuFps = (base * (gpuScore / 100)) / resFactor
    const cpuCap = cpuScore * cpuMultiplier
    const cpuLimited = cpuCap < gpuFps
    const raw = Math.min(gpuFps, cpuCap)
    const fps = Math.max(15, Math.round(raw / 5) * 5)
    return { profile, description, fps, cpuLimited }
  })
}

export function fpsTargetResolution(build: Build, useCase: UseCase): string {
  return build.monitor ? String(build.monitor.specs.resolution) : USE_CASE_RESOLUTION[useCase]
}
