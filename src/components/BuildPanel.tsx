import type { Build, ComponentCategory } from '../types'
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../types'
import { ComponentVisual } from './ComponentVisual'

interface BuildPanelProps {
  build: Build
  onSlotClick: (category: ComponentCategory) => void
  onClear: () => void
}

export function BuildPanel({ build, onSlotClick, onClear }: BuildPanelProps) {
  const hasParts = CATEGORY_ORDER.some((cat) => build[cat])

  return (
    <div className="rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-600/50 flex items-center justify-between">
        <h3 className="font-semibold text-white">Your Build</h3>
        {hasParts && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-accent-rose transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="p-3 space-y-2">
        {CATEGORY_ORDER.map((category) => {
          const part = build[category]
          return (
            <button
              key={category}
              onClick={() => onSlotClick(category)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-700/40 hover:bg-surface-700 border border-transparent hover:border-accent-cyan/20 transition-all text-left group"
            >
              {part ? (
                <ComponentVisual component={part} size="sm" />
              ) : (
                <ComponentVisual category={category} size="sm" className="opacity-40" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{CATEGORY_LABELS[category]}</p>
                {part ? (
                  <>
                    <p className="text-sm font-medium text-white truncate">{part.name}</p>
                    <p className="text-xs text-accent-emerald font-mono">${part.price}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                    Click to select…
                  </p>
                )}
              </div>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-accent-cyan shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
