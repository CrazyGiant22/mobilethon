import type { Build, ThermalEstimate } from '../types'

function num(v: unknown): number {
  return Number(v) || 0
}

export function estimateThermal(build: Build): ThermalEstimate {
  const cpuTdp = build.cpu?.tdp ?? 0
  const gpuDraw = build.gpu?.powerDraw ?? 0
  const heatLoad = cpuTdp + gpuDraw

  // --- Cooling adequacy (0-100) ---
  let coolingScore = 50
  let verdict = 'Add a CPU cooler and case fans to gauge thermals.'

  if (build.cooler) {
    const rating = num(build.cooler.specs.tdpRating)
    const type = String(build.cooler.specs.type)
    const ratio = cpuTdp > 0 ? rating / cpuTdp : 2
    // Base score from CPU cooling headroom
    coolingScore = Math.max(20, Math.min(100, Math.round(45 + (ratio - 1) * 45)))
    // AIO handles sustained loads a bit better
    if (type === 'aio') coolingScore = Math.min(100, coolingScore + 5)

    // Case airflow contribution
    const fanCount = build.fans ? num(build.fans.specs.count) : 0
    coolingScore = Math.min(100, coolingScore + fanCount * 4)

    // High GPU heat in the same chassis pulls the score down slightly
    if (gpuDraw >= 300) coolingScore = Math.max(20, coolingScore - 8)
    else if (gpuDraw >= 220) coolingScore = Math.max(20, coolingScore - 4)

    if (coolingScore >= 80) verdict = 'Excellent cooling headroom — temps stay low even under sustained load.'
    else if (coolingScore >= 60) verdict = 'Solid cooling for this build; expect comfortable temperatures.'
    else if (coolingScore >= 45) verdict = 'Adequate, but consider a stronger cooler or more case fans for headroom.'
    else verdict = 'Cooling is marginal — upgrade the cooler and add intake/exhaust fans.'
  } else if (build.cpu) {
    coolingScore = 30
    verdict = cpuTdp > 95
      ? 'No cooler selected — this high-TDP CPU needs a capable cooler urgently.'
      : 'No cooler selected — add at least a decent air cooler.'
  }

  // --- Noise estimate (dB) ---
  const fanCount = build.fans ? num(build.fans.specs.count) : 2 // assume stock fans
  const fanRpm = build.fans ? num(build.fans.specs.rpm) : 1400
  const coolerType = build.cooler ? String(build.cooler.specs.type) : 'air'

  let noiseDb = 26
  noiseDb += fanCount * (fanRpm / 1000) * 1.6
  noiseDb += (heatLoad / 100) * 2.2 // more heat = fans ramp higher
  if (coolerType === 'air' && cpuTdp > 125) noiseDb += 3 // air cooler on hot CPU spins up
  if (coolerType === 'aio') noiseDb += 1.5 // pump hum, but quieter fans
  noiseDb = Math.round(noiseDb)

  let noiseLabel: ThermalEstimate['noiseLabel']
  if (noiseDb < 32) noiseLabel = 'Silent'
  else if (noiseDb < 38) noiseLabel = 'Quiet'
  else if (noiseDb < 45) noiseLabel = 'Moderate'
  else noiseLabel = 'Loud'

  return { coolingScore, noiseDb, noiseLabel, verdict }
}
