import type { Build } from '../types'
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../types'
import { ComponentVisual } from './ComponentVisual'
import { useCurrency } from '../currency'

interface BuildVisualizerProps {
  build: Build
}

export function BuildVisualizer({ build }: BuildVisualizerProps) {
  const { format } = useCurrency()
  const parts = CATEGORY_ORDER.map((cat) => ({ category: cat, component: build[cat] })).filter((p) => p.component)

  if (parts.length === 0) return null

  return (
    <div className="tech-card rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-600/50">
        <h3 className="font-semibold text-white">Build Overview</h3>
        <p className="text-xs text-slate-400 mt-0.5">{parts.length} components selected</p>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {parts.map(({ category, component }) => (
          <div
            key={category}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-700/30 border border-surface-600/30 hover:border-accent-cyan/20 transition-colors"
          >
            <ComponentVisual component={component} size="lg" />
            <div className="text-center min-w-0 w-full">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{CATEGORY_LABELS[category]}</p>
              <p className="text-xs font-medium text-white truncate mt-0.5">{component!.name}</p>
              <p className="text-xs text-accent-emerald font-mono mt-0.5">{format(component!.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
