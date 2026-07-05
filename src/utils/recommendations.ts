import type { Build, Recommendation } from '../types'
import type { BottleneckResult, PowerEstimate } from '../types'

export function generateRecommendations(
  build: Build,
  bottleneck: BottleneckResult,
  power: PowerEstimate,
): Recommendation[] {
  const recs: Recommendation[] = []

  if (!build.cpu) {
    recs.push({
      id: 'add-cpu',
      priority: 'high',
      title: 'Start with a CPU',
      description: 'Pick a processor first — it determines your motherboard socket and platform.',
    })
  }

  if (!build.gpu) {
    recs.push({
      id: 'add-gpu',
      priority: 'high',
      title: 'Add a graphics card',
      description: 'The GPU has the biggest impact on gaming performance. Match it to your target resolution and refresh rate.',
    })
  }

  if (bottleneck.limitingFactor === 'cpu' && build.cpu && build.gpu) {
    const upgrade = build.cpu.performanceScore! < 85
    if (upgrade) {
      recs.push({
        id: 'upgrade-cpu',
        priority: 'high',
        title: 'Upgrade your CPU',
        description: 'Your GPU is outpacing your processor. A faster CPU (especially with 3D V-Cache) will unlock more frames.',
        estimatedGain: '+15–30% FPS in CPU-bound games',
      })
    }
  }

  if (bottleneck.limitingFactor === 'gpu' && build.cpu && build.gpu) {
    recs.push({
      id: 'upgrade-gpu',
      priority: 'medium',
      title: 'GPU is the limiting factor',
      description: 'Your CPU has headroom. Upgrading the graphics card is the most impactful path to higher FPS.',
      estimatedGain: 'Proportional to GPU tier jump',
    })
  }

  if (build.psu && !power.psuAdequate) {
    recs.push({
      id: 'upgrade-psu',
      priority: 'high',
      title: 'Upgrade power supply',
      description: `System draws ~${power.estimatedDraw}W. You need at least ${power.recommendedWattage}W for safe headroom.`,
    })
  }

  if (!build.psu && power.estimatedDraw > 0) {
    recs.push({
      id: 'add-psu',
      priority: 'medium',
      title: `Choose a ${power.recommendedWattage}W+ PSU`,
      description: 'Select an 80+ Gold rated unit with 30% headroom above estimated draw for efficiency and longevity.',
    })
  }

  if (build.ram && Number(build.ram.specs.capacity) < 32 && build.gpu && build.gpu.performanceScore! >= 70) {
    recs.push({
      id: 'more-ram',
      priority: 'low',
      title: 'Consider 32GB RAM',
      description: 'Modern AAA titles and streaming benefit from 32GB. Especially relevant for this GPU tier.',
      estimatedGain: 'Smoother multitasking, fewer stutters',
    })
  }

  if (build.cpu?.specs.x3d && build.gpu && build.gpu.performanceScore! < 70) {
    recs.push({
      id: 'x3d-gpu-mismatch',
      priority: 'medium',
      title: 'X3D CPU deserves a stronger GPU',
      description: '3D V-Cache CPUs shine at high FPS — pair with at least an RTX 4070-class GPU to maximize the investment.',
    })
  }

  if (!build.cooler && build.cpu) {
    const tdp = build.cpu.tdp ?? 65
    recs.push({
      id: 'add-cooler',
      priority: tdp > 125 ? 'high' : 'medium',
      title: 'Add a CPU cooler',
      description: tdp > 125
        ? 'High-TDP CPUs need robust cooling — consider a 240mm+ AIO or premium air cooler.'
        : 'Stock coolers work but aftermarket options run quieter and cooler.',
    })
  }

  if (!build.storage) {
    recs.push({
      id: 'add-storage',
      priority: 'medium',
      title: 'Add NVMe storage',
      description: 'A fast NVMe SSD dramatically improves boot times, game loads, and workflow responsiveness.',
    })
  }

  return recs.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}
