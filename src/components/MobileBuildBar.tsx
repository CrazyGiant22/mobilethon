import type { BuildAnalysis } from '../types'

interface MobileBuildBarProps {
  analysis: BuildAnalysis
  onScrollToAnalysis: () => void
}

export function MobileBuildBar({ analysis, onScrollToAnalysis }: MobileBuildBarProps) {
  const { totalCost, coreCompleteness, errorCount, warningCount } = analysis

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 xl:hidden border-t border-surface-600/50 bg-surface-900/95 backdrop-blur-md safe-bottom pt-3 px-4">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40" aria-hidden>
              <circle cx="20" cy="20" r="16" fill="none" stroke="#243044" strokeWidth="4" />
              <circle
                cx="20" cy="20" r="16" fill="none"
                stroke="#22d3ee" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 * (1 - coreCompleteness / 100)}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
              {coreCompleteness}%
            </span>
          </div>
          <div className="min-w-0">
            {totalCost > 0 && (
              <p className="text-sm font-mono font-bold text-accent-emerald leading-tight">
                ${totalCost.toLocaleString()}
              </p>
            )}
            <p className="text-xs leading-tight truncate">
              {errorCount > 0 ? (
                <span className="text-accent-rose">{errorCount} error{errorCount > 1 ? 's' : ''}</span>
              ) : warningCount > 0 ? (
                <span className="text-accent-amber">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>
              ) : (
                <span className="text-accent-emerald">All compatible</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onScrollToAnalysis}
          className="shrink-0 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25 active:bg-accent-cyan/25"
        >
          Analysis
        </button>
      </div>
    </div>
  )
}
