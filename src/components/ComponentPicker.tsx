import { useState, useMemo } from 'react'
import type { ComponentCategory } from '../types'
import { CATEGORY_LABELS } from '../types'
import { getComponentsByCategory } from '../data/components'
import { ComponentVisual } from './ComponentVisual'

interface ComponentPickerProps {
  category: ComponentCategory
  selectedId?: string
  onSelect: (id: string | null) => void
  onClose: () => void
}

export function ComponentPicker({ category, selectedId, onSelect, onClose }: ComponentPickerProps) {
  const [search, setSearch] = useState('')
  const components = useMemo(() => getComponentsByCategory(category), [category])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return components
    return components.filter(
      (c) => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q),
    )
  }, [components, search])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl bg-surface-800 border border-surface-600/50 shadow-2xl animate-fade-in">
        <div className="px-5 py-4 border-b border-surface-600/50 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-white">Select {CATEGORY_LABELS[category]}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-3 shrink-0">
          <input
            type="text"
            placeholder="Search components…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg bg-surface-700 border border-surface-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 text-sm"
          />
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
          {filtered.map((comp) => (
            <button
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                comp.id === selectedId
                  ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                  : 'hover:bg-surface-700/50 border border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <ComponentVisual component={comp} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{comp.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{comp.brand}</p>
                    </div>
                    <span className="text-sm font-mono text-accent-emerald shrink-0">${comp.price}</span>
                  </div>
                  {comp.performanceScore && (
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
            <p className="text-center text-slate-500 py-8 text-sm">No components match your search.</p>
          )}
        </div>
      </div>
    </div>
  )
}
