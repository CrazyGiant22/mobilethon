import type { AppView } from '../types'

interface HeaderProps {
  view: AppView
  onViewChange: (view: AppView) => void
}

const NAV_ITEMS: { id: AppView; label: string; href: string }[] = [
  { id: 'builder', label: 'Builder', href: '#builder' },
  { id: 'compare', label: 'Compare', href: '#compare' },
]

export function Header({ view, onViewChange }: HeaderProps) {
  return (
    <header className="border-b border-surface-600/50 bg-surface-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => onViewChange('builder')} className="flex items-center gap-3 group" aria-label="BuildForge home">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center glow-cyan">
            <svg className="w-5 h-5 text-surface-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-lg font-semibold tracking-tight text-white group-hover:text-accent-cyan transition-colors">BuildForge</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Data-driven PC optimization</p>
          </div>
        </button>
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`px-4 py-2 min-h-10 rounded-lg text-sm transition-all ${
                view === item.id
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="#analysis"
            onClick={() => onViewChange('builder')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-all hidden sm:block ${
              view === 'builder' ? 'text-slate-400 hover:text-white' : 'text-slate-500'
            }`}
          >
            Analysis
          </a>
        </nav>
      </div>
    </header>
  )
}
