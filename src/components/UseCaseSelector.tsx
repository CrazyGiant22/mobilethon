import type { UseCase } from '../types'
import { USE_CASE_LABELS } from '../types'

interface UseCaseSelectorProps {
  value: UseCase
  onChange: (useCase: UseCase) => void
}

const USE_CASES: UseCase[] = ['1080p', '1440p', '4k', 'productivity']

export function UseCaseSelector({ value, onChange }: UseCaseSelectorProps) {
  return (
    <div className="rounded-2xl bg-surface-800 border border-surface-600/50 p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Target use case</p>
      <div className="flex flex-wrap gap-2">
        {USE_CASES.map((uc) => (
          <button
            key={uc}
            onClick={() => onChange(uc)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              value === uc
                ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                : 'bg-surface-700/50 text-slate-400 border border-surface-600/40 hover:text-white'
            }`}
          >
            {USE_CASE_LABELS[uc]}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Bottleneck analysis adjusts based on your target resolution and workload.
      </p>
    </div>
  )
}
