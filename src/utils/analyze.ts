import type { Build, BuildAnalysis, UseCase } from '../types'
import { CATEGORY_ORDER } from '../types'
import { checkCompatibility } from './compatibility'
import { analyzeBottleneck } from './bottleneck'
import { estimatePower } from './power'
import { estimateThermal } from './thermal'
import { calculatePerformance } from './performance'
import { generateRecommendations } from './recommendations'

const CORE_SLOTS = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu'] as const
const ALL_SLOTS = [...CORE_SLOTS, 'cooler', 'case'] as const

export function analyzeBuild(build: Build, useCase: UseCase = '1440p'): BuildAnalysis {
  const issues = checkCompatibility(build)
  const bottleneck = analyzeBottleneck(build, useCase)
  const power = estimatePower(build)
  const thermal = estimateThermal(build)
  const performance = calculatePerformance(build)
  const recommendations = generateRecommendations(build, bottleneck, power)

  const totalCost = CATEGORY_ORDER.reduce((sum, cat) => {
    const part = build[cat]
    return sum + (part?.price ?? 0)
  }, 0)

  const coreFilled = CORE_SLOTS.filter((cat) => build[cat]).length
  const allFilled = ALL_SLOTS.filter((cat) => build[cat]).length
  const coreCompleteness = Math.round((coreFilled / CORE_SLOTS.length) * 100)
  const completeness = Math.round((allFilled / ALL_SLOTS.length) * 100)

  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length

  return {
    issues,
    bottleneck,
    power,
    thermal,
    performance,
    recommendations,
    totalCost,
    completeness,
    coreCompleteness,
    errorCount: errors,
    warningCount: warnings,
  }
}
