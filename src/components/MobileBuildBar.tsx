import type { BuildAnalysis } from '../types'

interface MobileBuildBarProps {
  analysis: BuildAnalysis
  onScrollToAnalysis: () => void
}

export function MobileBuildBar({ analysis, onScrollToAnalysis }: MobileBuildBarProps) {
  const { totalCost, coreCompleteness, errorCount, warningCount } = analysis

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 xl:hidden border-t border-surface-600/50 bg-surface-900/95 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 min-w-0">
          {totalCost > 0 && (
            <span className="text-sm font-mono font-bold text-accent-emerald shrink-0">
              ${totalCost.toLocaleString()}
            </span>
          )}
          <span className="text-xs text-slate-400 truncate">
            {coreCompleteness}% core · {errorCount > 0 ? (
              <span className="text-accent-rose">{errorCount} error{errorCount > 1 ? 's' : ''}</span>
            ) : warningCount > 0 ? (
              <span className="text-accent-amber">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>
            ) : (
              <span className="text-accent-emerald">All clear</span>
            )}
          </span>
        </div>
        <button
          onClick={onScrollToAnalysis}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25"
        >
          View analysis
        </button>
      </div>
    </div>
  )
}
