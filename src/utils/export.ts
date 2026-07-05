import type { Build, BuildAnalysis } from '../types'
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../types'

export function buildToText(build: Build, analysis: BuildAnalysis): string {
  const lines: string[] = []
  lines.push('BuildForge — PC Build Summary')
  lines.push('='.repeat(40))
  lines.push('')

  const rows: [string, string, string][] = []
  for (const cat of CATEGORY_ORDER) {
    const part = build[cat]
    if (part) rows.push([CATEGORY_LABELS[cat], part.name, `$${part.price}`])
  }

  if (rows.length === 0) {
    lines.push('(no components selected yet)')
    return lines.join('\n')
  }

  const labelWidth = Math.max(...rows.map((r) => r[0].length))
  const nameWidth = Math.max(...rows.map((r) => r[1].length))
  for (const [label, name, price] of rows) {
    lines.push(`${label.padEnd(labelWidth)}  ${name.padEnd(nameWidth)}  ${price.padStart(7)}`)
  }

  lines.push('-'.repeat(40))
  lines.push(`${'Total'.padEnd(labelWidth)}  ${''.padEnd(nameWidth)}  ${`$${analysis.totalCost.toLocaleString()}`.padStart(7)}`)
  lines.push('')
  lines.push(`Performance tier : ${analysis.performance.tierLabel}`)
  lines.push(`Gaming score     : ${analysis.performance.gamingScore}/100`)
  lines.push(`Productivity     : ${analysis.performance.productivityScore}/100`)
  lines.push(`Estimated draw   : ${analysis.power.estimatedDraw}W`)
  lines.push(`Recommended PSU  : ${analysis.power.recommendedWattage}W+`)
  if (analysis.errorCount > 0) {
    lines.push(`Compatibility    : ${analysis.errorCount} error(s) — review before buying`)
  } else {
    lines.push('Compatibility    : all checks passed')
  }
  lines.push('')
  lines.push('Generated with BuildForge')
  return lines.join('\n')
}

export function downloadBuild(build: Build, analysis: BuildAnalysis) {
  const text = buildToText(build, analysis)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'buildforge-build.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
