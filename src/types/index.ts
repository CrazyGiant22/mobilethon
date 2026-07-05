export type AppView = 'builder' | 'compare'

export type UseCase = '1080p' | '1440p' | '4k' | 'productivity'

export const USE_CASE_LABELS: Record<UseCase, string> = {
  '1080p': '1080p Gaming',
  '1440p': '1440p Gaming',
  '4k': '4K Gaming',
  productivity: 'Productivity',
}

export type ComponentCategory =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'cooler'
  | 'case'

export interface PCComponent {
  id: string
  name: string
  category: ComponentCategory
  brand: string
  price: number
  specs: Record<string, string | number | boolean | string[]>
  performanceScore?: number
  powerDraw?: number
  tdp?: number
}

export interface Build {
  cpu?: PCComponent
  gpu?: PCComponent
  motherboard?: PCComponent
  ram?: PCComponent
  storage?: PCComponent
  psu?: PCComponent
  cooler?: PCComponent
  case?: PCComponent
}

export type IssueSeverity = 'error' | 'warning' | 'info' | 'success'

export interface CompatibilityIssue {
  id: string
  severity: IssueSeverity
  title: string
  message: string
  category: ComponentCategory | 'general'
}

export interface BottleneckResult {
  cpuUtilization: number
  gpuUtilization: number
  balanceScore: number
  verdict: string
  limitingFactor: 'cpu' | 'gpu' | 'balanced' | 'unknown'
}

export interface PowerEstimate {
  estimatedDraw: number
  recommendedWattage: number
  headroom: number
  psuAdequate: boolean
}

export interface PerformanceProfile {
  gamingScore: number
  productivityScore: number
  tier: 'entry' | 'mid' | 'high' | 'enthusiast'
  tierLabel: string
}

export interface Recommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  estimatedGain?: string
  actionCategory?: ComponentCategory
}

export interface BuildAnalysis {
  issues: CompatibilityIssue[]
  bottleneck: BottleneckResult
  power: PowerEstimate
  performance: PerformanceProfile
  recommendations: Recommendation[]
  totalCost: number
  completeness: number
  coreCompleteness: number
  errorCount: number
  warningCount: number
}

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  cpu: 'Processor',
  gpu: 'Graphics Card',
  motherboard: 'Motherboard',
  ram: 'Memory',
  storage: 'Storage',
  psu: 'Power Supply',
  cooler: 'CPU Cooler',
  case: 'Case',
}

export const CATEGORY_ORDER: ComponentCategory[] = [
  'cpu',
  'motherboard',
  'ram',
  'gpu',
  'storage',
  'cooler',
  'psu',
  'case',
]
