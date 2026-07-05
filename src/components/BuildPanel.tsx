import type { Build, ComponentCategory } from '../types'
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../types'
import { ComponentVisual } from './ComponentVisual'
import { buyUrl } from '../utils/retailers'

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
            className="text-sm px-3 py-1.5 -mr-1 rounded-lg text-slate-400 hover:text-accent-rose active:bg-surface-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="p-3 space-y-2">
        {CATEGORY_ORDER.map((category) => {
          const part = build[category]
          return (
            <div
              key={category}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-700/40 hover:bg-surface-700 border border-transparent hover:border-accent-cyan/20 transition-all group"
            >
              <button
                onClick={() => onSlotClick(category)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
                aria-label={`Select ${CATEGORY_LABELS[category]}`}
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
                      <p className="text-xs text-accent-emerald font-mono">~${part.price}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                      Click to select…
                    </p>
                  )}
                </div>
              </button>
              {part ? (
                <a
                  href={buyUrl(part)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={`Find ${part.name} at a retailer`}
                  className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-surface-600/50 text-slate-300 hover:text-accent-cyan hover:bg-surface-600 transition-colors"
                >
                  Buy
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <svg className="w-4 h-4 text-slate-500 group-hover:text-accent-cyan shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
      {hasParts && (
        <p className="px-5 pb-4 -mt-1 text-[11px] text-slate-500">
          Prices are MSRP estimates. Tap “Buy” to check live retailer pricing.
        </p>
      )}
    </div>
  )
}
