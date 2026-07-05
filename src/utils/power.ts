import type { Build, PowerEstimate } from '../types'

const BASE_SYSTEM_DRAW = 55

export function estimatePower(build: Build): PowerEstimate {
  const cpuTdp = build.cpu?.tdp ?? 0
  const gpuDraw = build.gpu?.powerDraw ?? 0
  const estimatedDraw = BASE_SYSTEM_DRAW + cpuTdp + gpuDraw

  const recommendedWattage = Math.ceil((estimatedDraw * 1.3) / 50) * 50

  const psuWattage = build.psu ? Number(build.psu.specs.wattage) : 0
  const headroom = psuWattage > 0 ? Math.round(((psuWattage - estimatedDraw) / psuWattage) * 100) : 0
  const psuAdequate = psuWattage >= recommendedWattage

  return {
    estimatedDraw,
    recommendedWattage,
    headroom,
    psuAdequate,
  }
}
