import { useState, useMemo, useEffect, useRef } from 'react'
import type { Build, ComponentCategory } from '../types'
import { CATEGORY_LABELS } from '../types'
import { getComponentsByCategory } from '../data/components'
import { getCompatBlockReason, getComponentSpecSummary } from '../utils/buildState'
import { ComponentVisual } from './ComponentVisual'
import { useCurrency } from '../currency'

interface ComponentPickerProps {
  build: Build
  category: ComponentCategory
  selectedId?: string
  onSelect: (id: string | null) => void
  onClose: () => void
}

type SortMode = 'price-asc' | 'price-desc' | 'score-desc'

export function ComponentPicker({ build, category, selectedId, onSelect, onClose }: ComponentPickerProps) {
  const { format } = useCurrency()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortMode>('score-desc')
  const [hideIncompatible, setHideIncompatible] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const components = useMemo(() => getComponentsByCategory(category), [category])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const enriched = useMemo(() => {
    return components.map((comp) => ({
      comp,
      blockReason: getCompatBlockReason(build, comp, category),
      specSummary: getComponentSpecSummary(comp),
    }))
  }, [components, build, category])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = enriched
    if (q) {
      list = list.filter(
        ({ comp }) =>
          comp.name.toLowerCase().includes(q) ||
          comp.brand.toLowerCase().includes(q) ||
          comp.specs.socket?.toString().toLowerCase().includes(q),
      )
    }
    if (hideIncompatible) {
      list = list.filter(({ blockReason }) => !blockReason)
    }
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.comp.price - b.comp.price
      if (sort === 'price-desc') return b.comp.price - a.comp.price
      return (b.comp.performanceScore ?? 0) - (a.comp.performanceScore ?? 0)
    })
  }, [enriched, search, sort, hideIncompatible])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        tabIndex={-1}
        className="relative w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-surface-800 border border-surface-600/50 shadow-2xl animate-fade-in outline-none pb-safe"
      >
        <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0" aria-hidden>
          <span className="w-10 h-1 rounded-full bg-surface-600" />
        </div>
        <div className="px-5 py-3 sm:py-4 border-b border-surface-600/50 flex items-center justify-between shrink-0">
          <h3 id="picker-title" className="font-semibold text-white">Select {CATEGORY_LABELS[category]}</h3>
          <button
            onClick={onClose}
            aria-label="Close picker"
            className="flex items-center justify-center w-9 h-9 -mr-1 rounded-lg text-slate-400 hover:text-white active:bg-surface-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-3 shrink-0 space-y-2">
          <input
            type="text"
            placeholder="Search by name, brand, or socket…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg bg-surface-700 border border-surface-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="text-sm sm:text-xs px-3 py-2 sm:py-1.5 rounded-lg bg-surface-700 border border-surface-600/50 text-slate-300"
            >
              <option value="score-desc">Best performance</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <label className="flex items-center gap-2 text-sm sm:text-xs text-slate-400 cursor-pointer py-2 px-1">
              <input
                type="checkbox"
                checked={hideIncompatible}
                onChange={(e) => setHideIncompatible(e.target.checked)}
                className="w-4 h-4 rounded border-surface-600"
              />
              Compatible only
            </label>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {selectedId && (
            <button
              onClick={() => onSelect(null)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm text-accent-rose hover:bg-surface-700/50 transition-colors"
            >
              Remove selection
            </button>
          )}
          {filtered.map(({ comp, blockReason, specSummary }) => (
            <button
              key={comp.id}
              onClick={() => !blockReason && onSelect(comp.id)}
              disabled={Boolean(blockReason)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                blockReason
                  ? 'opacity-50 cursor-not-allowed border border-transparent'
                  : comp.id === selectedId
                    ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                    : 'hover:bg-surface-700/50 border border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <ComponentVisual component={comp} size="md" className={blockReason ? 'grayscale' : ''} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{comp.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{comp.brand}</p>
                      {specSummary && (
                        <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{specSummary}</p>
                      )}
                    </div>
                    <span className="text-sm font-mono text-accent-emerald shrink-0">{format(comp.price)}</span>
                  </div>
                  {blockReason && (
                    <p className="text-xs text-accent-rose mt-1.5">{blockReason}</p>
                  )}
                  {comp.performanceScore && !blockReason && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-600 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue"
                          style={{ width: `${comp.performanceScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400">{comp.performanceScore}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-8 text-sm">
              {hideIncompatible ? 'No compatible parts match your filters.' : 'No components match your search.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
