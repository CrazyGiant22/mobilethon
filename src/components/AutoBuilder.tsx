import { useState } from 'react'
import type { Build, UseCase } from '../types'
import { USE_CASE_LABELS } from '../types'
import { generateBuild } from '../utils/autoBuild'

interface AutoBuilderProps {
  useCase: UseCase
  onUseCaseChange: (uc: UseCase) => void
  onGenerate: (build: Build) => void
  hasExistingBuild: boolean
}

const USE_CASES: UseCase[] = ['1080p', '1440p', '4k', 'productivity']
const PRESET_BUDGETS = [800, 1200, 1800, 2500]

export function AutoBuilder({ useCase, onUseCaseChange, onGenerate, hasExistingBuild }: AutoBuilderProps) {
  const [budget, setBudget] = useState(1200)
  const [includeMonitor, setIncludeMonitor] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [spent, setSpent] = useState<number | null>(null)

  const handleGenerate = () => {
    if (hasExistingBuild && !window.confirm('Generate a new build? This replaces your current parts.')) return
    const result = generateBuild(budget, useCase, { includeMonitor })
    onGenerate(result.build)
    setNotes(result.notes)
    setSpent(result.spent)
  }

  return (
    <div className="tech-card rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-600/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Auto-Build
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25">
            Smart
          </span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Set a budget and target — BuildForge assembles a balanced, compatible build for you.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Budget */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="budget" className="text-xs text-slate-400 uppercase tracking-wider">Budget</label>
            <span className="text-lg font-bold font-mono text-accent-emerald">${budget.toLocaleString()}</span>
          </div>
          <input
            id="budget"
            type="range"
            min={500}
            max={4000}
            step={50}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-cyan-400"
            style={{ accentColor: '#22d3ee' }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESET_BUDGETS.map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  budget === b
                    ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30'
                    : 'bg-surface-700/50 text-slate-400 border-surface-600/40 hover:text-white'
                }`}
              >
                ${b.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Use case */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Target</label>
          <div className="flex flex-wrap gap-2">
            {USE_CASES.map((uc) => (
              <button
                key={uc}
                onClick={() => onUseCaseChange(uc)}
                className={`text-sm px-3 py-2 min-h-10 rounded-lg border transition-colors ${
                  useCase === uc
                    ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30'
                    : 'bg-surface-700/50 text-slate-400 border-surface-600/40 hover:text-white'
                }`}
              >
                {USE_CASE_LABELS[uc]}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={includeMonitor}
            onChange={(e) => setIncludeMonitor(e.target.checked)}
            className="w-4 h-4 rounded border-surface-600"
          />
          Include a matching monitor
        </label>

        <button
          onClick={handleGenerate}
          className="w-full py-3 min-h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-cyan to-accent-blue text-surface-900 hover:opacity-90 active:opacity-80 transition-opacity"
        >
          Generate optimized build
        </button>

        {spent !== null && (
          <div className="rounded-xl border border-surface-600/50 bg-surface-700/30 p-3 text-xs space-y-1.5">
            <p className="text-slate-300">
              Build total: <span className="font-mono text-accent-emerald">${spent.toLocaleString()}</span>
              <span className="text-slate-500"> / ${budget.toLocaleString()} budget</span>
            </p>
            {notes.map((n, i) => (
              <p key={i} className="text-slate-400">{n}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
