import type { Build, PerformanceProfile } from '../types'

export function calculatePerformance(build: Build): PerformanceProfile {
  const cpu = build.cpu?.performanceScore ?? 0
  const gpu = build.gpu?.performanceScore ?? 0
  const storage = build.storage?.performanceScore ?? 50
  const ramCapacity = build.ram ? Number(build.ram.specs.capacity) : 0
  const ramBonus = ramCapacity >= 32 ? 5 : ramCapacity >= 16 ? 2 : 0

  const gamingScore = gpu > 0
    ? Math.round(gpu * 0.75 + cpu * 0.2 + ramBonus)
    : 0

  const productivityScore = cpu > 0
    ? Math.round(cpu * 0.55 + gpu * 0.15 + storage * 0.2 + ramBonus * 2)
    : 0

  const avg = (gamingScore + productivityScore) / 2

  let tier: PerformanceProfile['tier']
  let tierLabel: string

  if (avg >= 85) {
    tier = 'enthusiast'
    tierLabel = 'Enthusiast'
  } else if (avg >= 65) {
    tier = 'high'
    tierLabel = 'High-End'
  } else if (avg >= 45) {
    tier = 'mid'
    tierLabel = 'Mid-Range'
  } else {
    tier = 'entry'
    tierLabel = 'Entry-Level'
  }

  return {
    gamingScore: Math.min(100, gamingScore),
    productivityScore: Math.min(100, productivityScore),
    tier,
    tierLabel,
  }
}
