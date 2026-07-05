import type { Build, BuildAnalysis } from '../types'
import { CATEGORY_ORDER } from '../types'
import { checkCompatibility } from './compatibility'
import { analyzeBottleneck } from './bottleneck'
import { estimatePower } from './power'
import { calculatePerformance } from './performance'
import { generateRecommendations } from './recommendations'

export function analyzeBuild(build: Build): BuildAnalysis {
  const issues = checkCompatibility(build)
  const bottleneck = analyzeBottleneck(build)
  const power = estimatePower(build)
  const performance = calculatePerformance(build)
  const recommendations = generateRecommendations(build, bottleneck, power)

  const totalCost = CATEGORY_ORDER.reduce((sum, cat) => {
    const part = build[cat]
    return sum + (part?.price ?? 0)
  }, 0)

  const requiredSlots = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu'] as const
  const filled = requiredSlots.filter((cat) => build[cat]).length
  const completeness = Math.round((filled / requiredSlots.length) * 100)

  return {
    issues,
    bottleneck,
    power,
    performance,
    recommendations,
    totalCost,
    completeness,
  }
}
