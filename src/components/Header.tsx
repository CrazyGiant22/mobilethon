export function Header() {
  return (
    <header className="border-b border-surface-600/50 bg-surface-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center glow-cyan">
            <svg className="w-5 h-5 text-surface-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">BuildForge</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Data-driven PC optimization</p>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#builder" className="hover:text-accent-cyan transition-colors">Builder</a>
          <a href="#analysis" className="hover:text-accent-cyan transition-colors">Analysis</a>
        </nav>
      </div>
    </header>
  )
}
