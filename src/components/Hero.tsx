interface HeroProps {
  completeness: number
  coreCompleteness: number
  totalCost: number
  errorCount: number
}

export function Hero({ completeness, coreCompleteness, totalCost, errorCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-surface-600/30">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/25 bg-accent-cyan/5 px-3 py-1 text-xs font-mono uppercase tracking-wider text-accent-cyan mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-glow" />
            Stop guessing · Start optimizing
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Engineer the perfect rig with{' '}
            <span className="text-gradient-anim">real data</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Compatibility checks, bottleneck analysis, power estimates, FPS projections, a live 3D preview,
            and upgrade recommendations — all updated in real time as you build.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-600/50">
              <span className="text-xl font-bold text-accent-cyan font-mono">{completeness}%</span>
              <span className="text-xs text-slate-400">full build</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-600/50">
              <span className="text-xl font-bold text-slate-300 font-mono">{coreCompleteness}%</span>
              <span className="text-xs text-slate-400">core parts</span>
            </div>
            {totalCost > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-600/50">
                <span className="text-xl font-bold text-accent-emerald font-mono">${totalCost.toLocaleString()}</span>
                <span className="text-xs text-slate-400">estimated</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-rose/10 border border-accent-rose/20">
                <span className="text-xl font-bold text-accent-rose font-mono">{errorCount}</span>
                <span className="text-xs text-accent-rose">compat error{errorCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
