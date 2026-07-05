import { useState, useMemo, useEffect } from 'react'
import type { Build, UseCase } from '../types'
import { analyzeBuild } from '../utils/analyze'
import { getSavedBuilds, deserializeBuild, type SavedBuild } from '../utils/storage'

interface BuildCompareProps {
  currentBuild: Build
  useCase: UseCase
}

interface Option {
  id: string
  name: string
  build: Build
}

const CURRENT_ID = '__current__'

export function BuildCompare({ currentBuild, useCase }: BuildCompareProps) {
  const [saved, setSaved] = useState<SavedBuild[]>([])
  const [leftId, setLeftId] = useState(CURRENT_ID)
  const [rightId, setRightId] = useState('')

  useEffect(() => {
    setSaved(getSavedBuilds())
  }, [])

  const options: Option[] = useMemo(() => {
    const opts: Option[] = []
    if (Object.values(currentBuild).some(Boolean)) {
      opts.push({ id: CURRENT_ID, name: 'Current build', build: currentBuild })
    }
    for (const s of saved) {
      opts.push({ id: s.id, name: s.name, build: deserializeBuild(s.componentIds) })
    }
    return opts
  }, [currentBuild, saved])

  const left = options.find((o) => o.id === leftId)
  const right = options.find((o) => o.id === rightId)

  const la = useMemo(() => (left ? analyzeBuild(left.build, useCase) : null), [left, useCase])
  const ra = useMemo(() => (right ? analyzeBuild(right.build, useCase) : null), [right, useCase])

  if (options.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-12 text-center">
        <p className="text-slate-400">Configure a build or save some builds to compare them here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BuildSelect label="Build A" value={leftId} onChange={setLeftId} options={options} />
        <BuildSelect label="Build B" value={rightId} onChange={setRightId} options={options} />
      </div>

      {la && ra && left && right ? (
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
          <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-2 px-4 sm:px-5 py-3 bg-surface-700/30 text-xs uppercase tracking-wider text-slate-400">
            <span>Metric</span>
            <span className="text-right sm:text-center truncate">{left.name}</span>
            <span className="text-right sm:text-center truncate">{right.name}</span>
          </div>
          <div className="divide-y divide-surface-600/30">
            <Row label="Total cost" a={`$${la.totalCost.toLocaleString()}`} b={`$${ra.totalCost.toLocaleString()}`}
              win={la.totalCost === ra.totalCost ? 0 : la.totalCost < ra.totalCost ? -1 : 1} />
            <Row label="Tier" a={la.performance.tierLabel} b={ra.performance.tierLabel} win={0} />
            <Row label="Gaming score" a={`${la.performance.gamingScore}`} b={`${ra.performance.gamingScore}`}
              win={cmp(la.performance.gamingScore, ra.performance.gamingScore)} />
            <Row label="Productivity" a={`${la.performance.productivityScore}`} b={`${ra.performance.productivityScore}`}
              win={cmp(la.performance.productivityScore, ra.performance.productivityScore)} />
            <Row label="Balance" a={`${la.bottleneck.balanceScore}`} b={`${ra.bottleneck.balanceScore}`}
              win={cmp(la.bottleneck.balanceScore, ra.bottleneck.balanceScore)} />
            <Row label="Bottleneck" a={bottleneckLabel(la)} b={bottleneckLabel(ra)} win={0} />
            <Row label="Est. power draw" a={`${la.power.estimatedDraw}W`} b={`${ra.power.estimatedDraw}W`}
              win={cmp(ra.power.estimatedDraw, la.power.estimatedDraw)} />
            <Row label="Cooling score" a={`${la.thermal.coolingScore}`} b={`${ra.thermal.coolingScore}`}
              win={cmp(la.thermal.coolingScore, ra.thermal.coolingScore)} />
            <Row label="Noise" a={`${la.thermal.noiseLabel} (${la.thermal.noiseDb}dB)`} b={`${ra.thermal.noiseLabel} (${ra.thermal.noiseDb}dB)`}
              win={cmp(ra.thermal.noiseDb, la.thermal.noiseDb)} />
            <Row label="Value (score/$100)" a={value(la)} b={value(ra)}
              win={cmp(valueNum(la), valueNum(ra))} />
            <Row label="Compatibility" a={la.errorCount ? `${la.errorCount} error(s)` : 'OK'} b={ra.errorCount ? `${ra.errorCount} error(s)` : 'OK'}
              win={cmp(ra.errorCount, la.errorCount)} />
          </div>
          <div className="px-4 sm:px-5 py-4 border-t border-surface-600/50 bg-surface-700/20">
            <p className="text-sm font-medium text-slate-300 mb-1">Verdict</p>
            <p className="text-sm text-slate-400">{verdict(left.name, right.name, la, ra, useCase)}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-12 text-center">
          <p className="text-slate-400">Select two builds above to compare them side by side.</p>
        </div>
      )}
    </div>
  )
}

function cmp(a: number, b: number): -1 | 0 | 1 {
  if (a === b) return 0
  return a > b ? -1 : 1 // -1 means "A wins" (higher is better)
}

function valueNum(a: ReturnType<typeof analyzeBuild>): number {
  return a.totalCost > 0 ? (a.performance.gamingScore / a.totalCost) * 100 : 0
}
function value(a: ReturnType<typeof analyzeBuild>): string {
  return valueNum(a).toFixed(2)
}
function bottleneckLabel(a: ReturnType<typeof analyzeBuild>): string {
  const lf = a.bottleneck.limitingFactor
  if (lf === 'balanced') return 'Balanced'
  if (lf === 'cpu') return `CPU (~${a.bottleneck.impactPct}%)`
  if (lf === 'gpu') return `GPU (~${a.bottleneck.impactPct}%)`
  return '—'
}

function verdict(
  aName: string, bName: string,
  a: ReturnType<typeof analyzeBuild>, b: ReturnType<typeof analyzeBuild>,
  useCase: UseCase,
): string {
  const gaming = useCase !== 'productivity'
  const aScore = gaming ? a.performance.gamingScore : a.performance.productivityScore
  const bScore = gaming ? b.performance.gamingScore : b.performance.productivityScore
  const aVal = valueNum(a)
  const bVal = valueNum(b)
  if (aScore === bScore && a.totalCost === b.totalCost) return 'These builds are neck and neck.'
  if (aScore > bScore && a.totalCost <= b.totalCost) return `${aName} wins — more performance for the same or less money.`
  if (bScore > aScore && b.totalCost <= a.totalCost) return `${bName} wins — more performance for the same or less money.`
  if (aVal > bVal * 1.08) return `${aName} offers better value per dollar; ${bName} is faster but pricier.`
  if (bVal > aVal * 1.08) return `${bName} offers better value per dollar; ${aName} is faster but pricier.`
  return `${aScore > bScore ? aName : bName} is faster, but the other is cheaper — pick based on budget.`
}

function BuildSelect({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 min-h-12 rounded-xl bg-surface-800 border border-surface-600/50 text-white text-base sm:text-sm focus:outline-none focus:border-accent-cyan/50"
      >
        <option value="">Select a build…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  )
}

function Row({ label, a, b, win }: { label: string; a: string; b: string; win: -1 | 0 | 1 }) {
  return (
    <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-2 px-4 sm:px-5 py-2.5 text-sm hover:bg-surface-700/20">
      <span className="text-slate-400">{label}</span>
      <span className={`text-right sm:text-center font-mono ${win === -1 ? 'text-accent-emerald' : 'text-slate-300'}`}>{a}</span>
      <span className={`text-right sm:text-center font-mono ${win === 1 ? 'text-accent-emerald' : 'text-slate-300'}`}>{b}</span>
    </div>
  )
}
