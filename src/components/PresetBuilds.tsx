import type { Build } from '../types'
import { getComponentById } from '../data/components'

interface PresetBuildsProps {
  onLoad: (build: Build) => void
}

const PRESETS = [
  {
    id: '1080p-gaming',
    name: '1080p Gaming',
    description: 'Solid 1080p high-refresh gaming',
    parts: ['cpu-ryzen-5-7600', 'mb-b650', 'ram-16-ddr5', 'gpu-rtx-4060', 'ssd-1tb-nvme', 'psu-650-gold', 'cooler-hyper212', 'case-nzxt-h5'],
  },
  {
    id: '1440p-ultra',
    name: '1440p Ultra',
    description: 'Max settings at 1440p',
    parts: ['cpu-ryzen-7-7800x3d', 'mb-b650', 'ram-32-ddr5', 'gpu-rtx-4070-super', 'ssd-2tb-nvme', 'psu-750-gold', 'cooler-aio-240', 'case-fractal-north'],
  },
  {
    id: '4k-enthusiast',
    name: '4K Enthusiast',
    description: 'No-compromise 4K gaming',
    parts: ['cpu-i7-14700k', 'mb-z790', 'ram-32-ddr5', 'gpu-rtx-4080-super', 'ssd-2tb-nvme', 'psu-850-platinum', 'cooler-aio-360', 'case-lian-li-o11'],
  },
] as const

export function PresetBuilds({ onLoad }: PresetBuildsProps) {
  const loadPreset = (parts: readonly string[]) => {
    const build: Build = {}
    for (const id of parts) {
      const comp = getComponentById(id)
      if (comp) build[comp.category] = comp
    }
    onLoad(build)
  }

  return (
    <section id="builder" className="animate-fade-in">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Quick-start presets</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => loadPreset(preset.parts)}
            className="text-left p-4 rounded-xl bg-surface-800 border border-surface-600/50 hover:border-accent-cyan/40 hover:bg-surface-700/50 transition-all group"
          >
            <span className="font-semibold text-white group-hover:text-accent-cyan transition-colors">
              {preset.name}
            </span>
            <p className="text-sm text-slate-400 mt-1">{preset.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
