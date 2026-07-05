import { useState, useMemo } from 'react'
import type { ComponentCategory, PCComponent } from '../types'
import { CATEGORY_LABELS } from '../types'
import { components, getComponentsByCategory } from '../data/components'
import { ComponentVisual } from './ComponentVisual'

interface ComparePanelProps {
  onUseInBuild: (component: PCComponent) => void
}

const COMPARE_CATEGORIES: ComponentCategory[] = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case']

function formatSpecValue(value: string | number | boolean | string[]): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function isBetterSpec(key: string, a: number, b: number): 'a' | 'b' | 'tie' {
  const lowerIsBetter = ['price', 'tdp', 'powerDraw', 'length', 'height', 'slots'].some((k) => key.toLowerCase().includes(k))
  if (a === b) return 'tie'
  if (lowerIsBetter) return a < b ? 'a' : 'b'
  return a > b ? 'a' : 'b'
}

export function ComparePanel({ onUseInBuild }: ComparePanelProps) {
  const [category, setCategory] = useState<ComponentCategory>('cpu')
  const [leftId, setLeftId] = useState<string>('')
  const [rightId, setRightId] = useState<string>('')

  const categoryComponents = useMemo(() => getComponentsByCategory(category), [category])

  const left = useMemo(() => components.find((c) => c.id === leftId), [leftId])
  const right = useMemo(() => components.find((c) => c.id === rightId), [rightId])

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>()
    if (left) Object.keys(left.specs).forEach((k) => keys.add(k))
    if (right) Object.keys(right.specs).forEach((k) => keys.add(k))
    return Array.from(keys).sort()
  }, [left, right])

  const handleCategoryChange = (cat: ComponentCategory) => {
    setCategory(cat)
    setLeftId('')
    setRightId('')
  }

  return (
    <section id="compare" className="animate-fade-in space-y-6">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">Component Comparison</h3>
        <p className="text-sm sm:text-base text-slate-400 mt-1">Pick two parts side-by-side to see specs, scores, and value differences.</p>
      </div>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
          {COMPARE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`shrink-0 px-4 py-2 min-h-11 rounded-lg text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                  : 'bg-surface-800 text-slate-400 border border-surface-600/50 hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CompareSelector
          label="Component A"
          components={categoryComponents}
          selectedId={leftId}
          onChange={setLeftId}
          accent="cyan"
        />
        <CompareSelector
          label="Component B"
          components={categoryComponents}
          selectedId={rightId}
          onChange={setRightId}
          accent="violet"
        />
      </div>

      {left && right ? (
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
          {/* Header cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-600/50">
            <CompareCard component={left} other={right} side="left" onUse={() => onUseInBuild(left)} />
            <CompareCard component={right} other={left} side="right" onUse={() => onUseInBuild(right)} />
          </div>

          {/* Score comparison */}
          {(left.performanceScore || right.performanceScore) && (
            <div className="px-5 py-4 border-t border-surface-600/50">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Performance Score</h4>
              <div className="grid grid-cols-2 gap-4">
                <ScoreBar label={left.name} score={left.performanceScore ?? 0} color="cyan" />
                <ScoreBar label={right.name} score={right.performanceScore ?? 0} color="violet" />
              </div>
            </div>
          )}

          {/* Spec table */}
          <div className="border-t border-surface-600/50">
            <div className="px-4 sm:px-5 py-3 bg-surface-700/30">
              <h4 className="text-sm font-medium text-slate-300">Specifications</h4>
            </div>
            <div className="divide-y divide-surface-600/30">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] px-4 sm:px-5 py-2 text-xs text-slate-500 uppercase tracking-wider gap-2">
                <span>Spec</span>
                <span className="text-right sm:text-center">A</span>
                <span className="text-right sm:text-center">B</span>
              </div>
              {allSpecKeys.map((key) => {
                const valA = left.specs[key]
                const valB = right.specs[key]
                let winner: 'a' | 'b' | 'tie' | null = null
                if (typeof valA === 'number' && typeof valB === 'number') {
                  winner = isBetterSpec(key, valA, valB)
                }
                return (
                  <div key={key} className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 px-4 sm:px-5 py-2.5 text-sm hover:bg-surface-700/20">
                    <span className="text-slate-400 capitalize break-words">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`text-right sm:text-center font-mono break-words ${winner === 'a' ? 'text-accent-emerald' : 'text-slate-300'}`}>
                      {valA !== undefined ? formatSpecValue(valA) : '—'}
                    </span>
                    <span className={`text-right sm:text-center font-mono break-words ${winner === 'b' ? 'text-accent-emerald' : 'text-slate-300'}`}>
                      {valB !== undefined ? formatSpecValue(valB) : '—'}
                    </span>
                  </div>
                )
              })}
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 px-4 sm:px-5 py-2.5 text-sm bg-surface-700/20">
                <span className="text-slate-400">Price</span>
                <span className={`text-right sm:text-center font-mono font-bold ${left.price < right.price ? 'text-accent-emerald' : 'text-white'}`}>
                  ${left.price}
                </span>
                <span className={`text-right sm:text-center font-mono font-bold ${right.price < left.price ? 'text-accent-emerald' : 'text-white'}`}>
                  ${right.price}
                </span>
              </div>
              {left.performanceScore && right.performanceScore && (
                <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 px-4 sm:px-5 py-2.5 text-sm bg-surface-700/20">
                  <span className="text-slate-400">Value <span className="text-slate-500">(score/$100)</span></span>
                  <span className={`text-right sm:text-center font-mono ${(left.performanceScore / left.price) > (right.performanceScore / right.price) ? 'text-accent-emerald' : 'text-slate-300'}`}>
                    {(left.performanceScore / left.price * 100).toFixed(1)}
                  </span>
                  <span className={`text-right sm:text-center font-mono ${(right.performanceScore / right.price) > (left.performanceScore / left.price) ? 'text-accent-emerald' : 'text-slate-300'}`}>
                    {(right.performanceScore / right.price * 100).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verdict */}
          <div className="px-5 py-4 border-t border-surface-600/50 bg-surface-700/20">
            <CompareVerdict left={left} right={right} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-12 text-center">
          <p className="text-slate-400">Select two {CATEGORY_LABELS[category].toLowerCase()} components above to compare.</p>
        </div>
      )}
    </section>
  )
}

function CompareSelector({
  label,
  components: items,
  selectedId,
  onChange,
  accent,
}: {
  label: string
  components: PCComponent[]
  selectedId: string
  onChange: (id: string) => void
  accent: 'cyan' | 'violet'
}) {
  const borderColor = accent === 'cyan' ? 'focus:border-accent-cyan/50' : 'focus:border-accent-violet/50'
  return (
    <div>
      <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">{label}</label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 min-h-12 rounded-xl bg-surface-800 border border-surface-600/50 text-white text-base sm:text-sm focus:outline-none ${borderColor}`}
      >
        <option value="">Select component…</option>
        {items.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} — ${c.price}
          </option>
        ))}
      </select>
    </div>
  )
}

function CompareCard({
  component,
  other,
  side,
  onUse,
}: {
  component: PCComponent
  other: PCComponent
  side: 'left' | 'right'
  onUse: () => void
}) {
  const priceDiff = component.price - other.price
  const scoreDiff = (component.performanceScore ?? 0) - (other.performanceScore ?? 0)
  const accent = side === 'left' ? 'text-accent-cyan' : 'text-accent-violet'

  return (
    <div className="p-5 flex flex-col items-center sm:items-start">
      <ComponentVisual component={component} size="lg" className="mb-4" />
      <p className={`text-xs uppercase tracking-wider ${accent}`}>{component.brand}</p>
      <h4 className="text-lg font-semibold text-white mt-1">{component.name}</h4>
      <p className="text-2xl font-bold font-mono text-white mt-2">${component.price}</p>
      {component.performanceScore && (
        <p className="text-sm text-slate-400 mt-1">
          Score: <span className="font-mono text-white">{component.performanceScore}</span>
          {scoreDiff !== 0 && (
            <span className={`ml-2 font-mono ${scoreDiff > 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {scoreDiff > 0 ? '+' : ''}{scoreDiff}
            </span>
          )}
        </p>
      )}
      {priceDiff !== 0 && (
        <p className={`text-xs mt-1 font-mono ${priceDiff < 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
          {priceDiff < 0 ? `$${Math.abs(priceDiff)} cheaper` : `$${priceDiff} more expensive`}
        </p>
      )}
      <button
        onClick={onUse}
        className="mt-4 text-sm px-4 py-2.5 min-h-11 rounded-lg bg-surface-700 text-slate-300 border border-surface-600/50 hover:text-white hover:border-accent-cyan/30 active:bg-surface-600 transition-colors w-full sm:w-auto"
      >
        Use in build
      </button>
    </div>
  )
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: 'cyan' | 'violet' }) {
  const gradient = color === 'cyan' ? 'from-accent-cyan to-accent-blue' : 'from-accent-violet to-accent-blue'
  const shortLabel = label.length > 30 ? label.slice(0, 28) + '…' : label
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400 truncate mr-2">{shortLabel}</span>
        <span className="font-mono text-white shrink-0">{score}</span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-600 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function CompareVerdict({ left, right }: { left: PCComponent; right: PCComponent }) {
  const leftScore = left.performanceScore ?? 0
  const rightScore = right.performanceScore ?? 0
  const leftValue = leftScore / left.price
  const rightValue = rightScore / right.price

  let verdict: string
  if (leftScore === rightScore && left.price === right.price) {
    verdict = 'These components are evenly matched on paper.'
  } else if (leftScore > rightScore && left.price <= right.price) {
    verdict = `${left.name} wins on both performance and price — clear upgrade choice.`
  } else if (rightScore > leftScore && right.price <= left.price) {
    verdict = `${right.name} wins on both performance and price — clear upgrade choice.`
  } else if (leftValue > rightValue * 1.1) {
    verdict = `${left.name} offers better value per dollar. Good budget pick.`
  } else if (rightValue > leftValue * 1.1) {
    verdict = `${right.name} offers better value per dollar. Good budget pick.`
  } else if (leftScore > rightScore) {
    verdict = `${left.name} is faster but costs more. Worth it if you need the extra performance.`
  } else if (rightScore > leftScore) {
    verdict = `${right.name} is faster but costs more. Worth it if you need the extra performance.`
  } else {
    verdict = 'Similar performance — choose based on price, brand preference, or compatibility.'
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-300 mb-1">Verdict</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{verdict}</p>
    </div>
  )
}
