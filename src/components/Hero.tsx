interface HeroProps {
  completeness: number
  totalCost: number
}

export function Hero({ completeness, totalCost }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-surface-600/30">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl animate-fade-in">
          <p className="text-accent-cyan font-mono text-sm mb-4 tracking-wider uppercase">
            Stop guessing. Start optimizing.
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
            Build the perfect PC with{' '}
            <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
              real data
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-400 leading-relaxed max-w-2xl">
            BuildForge checks compatibility, analyzes CPU/GPU bottlenecks, estimates power draw,
            and recommends upgrades — so every dollar goes where it matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-800 border border-surface-600/50">
              <span className="text-2xl font-bold text-accent-cyan font-mono">{completeness}%</span>
              <span className="text-sm text-slate-400">build complete</span>
            </div>
            {totalCost > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-800 border border-surface-600/50">
                <span className="text-2xl font-bold text-accent-emerald font-mono">${totalCost.toLocaleString()}</span>
                <span className="text-sm text-slate-400">estimated total</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
