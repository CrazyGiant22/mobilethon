import type { Build, ComponentCategory, PCComponent, UseCase } from '../types'
import { getComponentsByCategory } from '../data/components'

export interface AutoBuildResult {
  build: Build
  spent: number
  notes: string[]
}

type Weights = Partial<Record<ComponentCategory, number>>

const TOWER_WEIGHTS: Record<UseCase, Weights> = {
  '1080p': { gpu: 0.30, cpu: 0.21, motherboard: 0.11, ram: 0.08, storage: 0.09, cooler: 0.05, psu: 0.08, case: 0.08 },
  '1440p': { gpu: 0.38, cpu: 0.18, motherboard: 0.10, ram: 0.08, storage: 0.08, cooler: 0.05, psu: 0.07, case: 0.06 },
  '4k': { gpu: 0.45, cpu: 0.16, motherboard: 0.09, ram: 0.08, storage: 0.07, cooler: 0.05, psu: 0.06, case: 0.04 },
  productivity: { gpu: 0.22, cpu: 0.32, motherboard: 0.10, ram: 0.12, storage: 0.10, cooler: 0.05, psu: 0.05, case: 0.04 },
}

function num(v: unknown): number {
  return Number(v) || 0
}

function requiredWattage(build: Build): number {
  const draw = 55 + (build.cpu?.tdp ?? 0) + (build.gpu?.powerDraw ?? 0)
  return Math.ceil((draw * 1.3) / 50) * 50
}

function pick(
  candidates: PCComponent[],
  maxPrice: number,
  scoreFn: (c: PCComponent) => number,
): PCComponent | undefined {
  if (candidates.length === 0) return undefined
  const within = candidates.filter((c) => c.price <= maxPrice)
  const pool = within.length > 0 ? within : candidates
  return [...pool].sort((a, b) => scoreFn(b) - scoreFn(a))[0]
}

export function generateBuild(
  budget: number,
  useCase: UseCase,
  opts: { includeMonitor?: boolean; format?: (usd: number) => string } = {},
): AutoBuildResult {
  const fmt = opts.format ?? ((n: number) => `$${n.toLocaleString()}`)
  const notes: string[] = []
  const w = TOWER_WEIGHTS[useCase]
  const build: Build = {}

  const cpus = getComponentsByCategory('cpu')
  const gpus = getComponentsByCategory('gpu')
  const mobos = getComponentsByCategory('motherboard')
  const rams = getComponentsByCategory('ram')
  const storages = getComponentsByCategory('storage')
  const coolers = getComponentsByCategory('cooler')
  const psus = getComponentsByCategory('psu')
  const cases = getComponentsByCategory('case')

  // 1. CPU — best performer in its slice; sets the platform.
  build.cpu = pick(cpus, budget * (w.cpu ?? 0.2), (c) => (c.performanceScore ?? 0))
  const socket = build.cpu ? String(build.cpu.specs.socket) : undefined
  const ddr = build.cpu ? String(build.cpu.specs.ddr) : undefined

  // 2. Motherboard — cheapest compatible board.
  build.motherboard = pick(
    mobos.filter((m) => m.specs.socket === socket && m.specs.ddr === ddr),
    budget * (w.motherboard ?? 0.1),
    (m) => -m.price,
  )

  // 3. RAM — cheapest kit meeting the capacity target for this tier.
  const ramTarget = useCase === 'productivity' || budget >= 1500 ? 32 : 16
  const ramType = String(build.motherboard?.specs.ddr ?? ddr)
  const ramPool = rams.filter((r) => r.specs.type === ramType)
  build.ram =
    pick(ramPool.filter((r) => num(r.specs.capacity) >= ramTarget), budget * (w.ram ?? 0.08), (r) => -r.price) ??
    pick(ramPool, budget * (w.ram ?? 0.08), (r) => -r.price)

  // 4. GPU — best performer in its slice.
  build.gpu = pick(gpus, budget * (w.gpu ?? 0.3), (c) => (c.performanceScore ?? 0))

  // 5. Storage — fastest within slice, NVMe preferred.
  build.storage = pick(
    storages,
    budget * (w.storage ?? 0.08),
    (s) => (s.specs.type === 'NVMe' ? 40 : 0) + (s.performanceScore ?? 0) + num(s.specs.capacity) / 512,
  )

  // 6. Cooler — cheapest that supports the socket and CPU TDP.
  const cpuTdp = build.cpu?.tdp ?? 65
  const coolerPool = coolers.filter(
    (c) => Array.isArray(c.specs.sockets) && (c.specs.sockets as string[]).includes(socket ?? '') && num(c.specs.tdpRating) >= cpuTdp,
  )
  build.cooler = pick(coolerPool, budget * (w.cooler ?? 0.05), (c) => -c.price)

  // 7. PSU — cheapest unit with adequate wattage (safety over budget).
  const needW = requiredWattage(build)
  build.psu =
    pick(psus.filter((p) => num(p.specs.wattage) >= needW), budget * (w.psu ?? 0.07), (p) => -p.price) ??
    pick(psus, budget, (p) => num(p.specs.wattage))

  // 8. Case — cheapest that fits the GPU and motherboard.
  const gpuLen = num(build.gpu?.specs.length)
  const ffRank: Record<string, number> = { 'mini-ITX': 1, mATX: 2, ATX: 3, 'E-ATX': 4 }
  const boardFf = ffRank[String(build.motherboard?.specs.formFactor)] ?? 2
  build.case = pick(
    cases.filter((c) => num(c.specs.maxGpuLength) >= gpuLen && (ffRank[String(c.specs.formFactor)] ?? 3) >= boardFf),
    budget * (w.case ?? 0.06),
    (c) => -c.price,
  )

  // --- Spend leftover budget on the highest-impact upgrades ---
  const spent = () => towerCost(build)
  const priority: ('gpu' | 'cpu' | 'ram' | 'storage')[] =
    useCase === 'productivity' ? ['cpu', 'gpu', 'ram', 'storage'] : ['gpu', 'cpu', 'ram', 'storage']

  for (let iter = 0; iter < 8; iter++) {
    const leftover = budget - spent()
    if (leftover < 20) break
    let upgraded = false

    for (const cat of priority) {
      const current = build[cat]
      if (!current) continue
      const ceiling = current.price + leftover
      const better = findUpgrade(build, cat, ceiling)
      if (better) {
        build[cat] = better
        // Keep the platform coherent after an upgrade.
        if (cat === 'cpu') ensureCoolerAndBoard(build, coolers, mobos, budget)
        ensurePsu(build, psus, budget)
        ensureCaseFits(build, cases, budget)
        upgraded = true
        break
      }
    }
    if (!upgraded) break
  }

  ensurePsu(build, psus, budget)
  ensureCaseFits(build, cases, budget)

  // --- Round out the setup with accessories ---
  let leftover = budget - spent()
  const fans = getComponentsByCategory('fans')
  const cheapFans = [...fans].sort((a, b) => a.price - b.price)[0]
  if (cheapFans && leftover >= cheapFans.price) {
    build.fans = cheapFans
    leftover -= cheapFans.price
  }

  const oses = getComponentsByCategory('os')
  const windows = oses.find((o) => o.id === 'os-win11-home')
  const linux = oses.find((o) => String(o.specs.type) === 'Linux')
  if (windows && leftover >= windows.price) {
    build.os = windows
    leftover -= windows.price
  } else if (linux) {
    build.os = linux
    notes.push('Chose a free Linux OS to stay on budget — swap to Windows if you prefer.')
  }

  if (opts.includeMonitor) {
    const monitors = getComponentsByCategory('monitor')
    const resPref: Record<UseCase, string> = {
      '1080p': '1920x1080',
      '1440p': '2560x1440',
      '4k': '3840x2160',
      productivity: '2560x1440',
    }
    const matching = monitors.filter((m) => m.specs.resolution === resPref[useCase])
    const monitor = pick(matching.length ? matching : monitors, Math.max(leftover, 150), (m) => (m.performanceScore ?? 0))
    if (monitor) {
      build.monitor = monitor
      leftover -= monitor.price
    }
  }

  const total = towerCost(build)
  if (total > budget) {
    notes.push(`This is the most affordable compatible build for ${useCase.toUpperCase()} — it runs ${fmt(total - budget)} over your budget. Raise the budget for more headroom.`)
  } else if (budget - total >= 150) {
    notes.push(`${fmt(budget - total)} left over — consider a nicer monitor, more storage, or a quieter cooler.`)
  }

  return { build, spent: total, notes }
}

function towerCost(build: Build): number {
  return (Object.values(build) as (PCComponent | undefined)[]).reduce((sum, p) => sum + (p?.price ?? 0), 0)
}

function findUpgrade(build: Build, cat: 'gpu' | 'cpu' | 'ram' | 'storage', ceiling: number): PCComponent | undefined {
  const current = build[cat]
  if (!current) return undefined
  const list = getComponentsByCategory(cat).filter((c) => c.price <= ceiling && c.id !== current.id)

  if (cat === 'cpu') {
    const socket = build.motherboard?.specs.socket ?? current.specs.socket
    const candidates = list.filter((c) => c.specs.socket === socket && (c.performanceScore ?? 0) > (current.performanceScore ?? 0))
    return best(candidates)
  }
  if (cat === 'gpu') {
    const maxLen = build.case ? Number(build.case.specs.maxGpuLength) : Infinity
    const candidates = list.filter((c) => Number(c.specs.length) <= maxLen && (c.performanceScore ?? 0) > (current.performanceScore ?? 0))
    return best(candidates)
  }
  if (cat === 'ram') {
    const type = build.motherboard?.specs.ddr ?? current.specs.type
    const candidates = list.filter((c) => c.specs.type === type && Number(c.specs.capacity) >= Number(current.specs.capacity))
    // prefer more capacity, then faster
    return [...candidates].sort(
      (a, b) => Number(b.specs.capacity) - Number(a.specs.capacity) || Number(b.specs.speed) - Number(a.specs.speed),
    )[0]
  }
  // storage
  const candidates = list.filter((c) => Number(c.specs.capacity) > Number(current.specs.capacity) || (c.performanceScore ?? 0) > (current.performanceScore ?? 0))
  return best(candidates)
}

function best(list: PCComponent[]): PCComponent | undefined {
  return [...list].sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0) || a.price - b.price)[0]
}

function ensurePsu(build: Build, psus: PCComponent[], budget: number) {
  const need = requiredWattage(build)
  if (build.psu && Number(build.psu.specs.wattage) >= need) return
  const adequate = psus
    .filter((p) => Number(p.specs.wattage) >= need)
    .sort((a, b) => a.price - b.price)[0]
  if (adequate) build.psu = adequate
  void budget
}

function ensureCaseFits(build: Build, cases: PCComponent[], budget: number) {
  const gpuLen = Number(build.gpu?.specs.length ?? 0)
  if (build.case && Number(build.case.specs.maxGpuLength) >= gpuLen) return
  const fit = cases.filter((c) => Number(c.specs.maxGpuLength) >= gpuLen).sort((a, b) => a.price - b.price)[0]
  if (fit) build.case = fit
  void budget
}

function ensureCoolerAndBoard(build: Build, coolers: PCComponent[], mobos: PCComponent[], budget: number) {
  const socket = String(build.cpu?.specs.socket)
  const ddr = String(build.cpu?.specs.ddr)
  // Board must match new CPU socket/ddr
  if (build.motherboard && (build.motherboard.specs.socket !== build.cpu?.specs.socket || build.motherboard.specs.ddr !== build.cpu?.specs.ddr)) {
    const board = mobos.filter((m) => m.specs.socket === socket && m.specs.ddr === ddr).sort((a, b) => a.price - b.price)[0]
    if (board) build.motherboard = board
  }
  // Cooler must handle new TDP + socket
  const tdp = build.cpu?.tdp ?? 65
  if (build.cooler) {
    const ok = Array.isArray(build.cooler.specs.sockets) && (build.cooler.specs.sockets as string[]).includes(socket) && Number(build.cooler.specs.tdpRating) >= tdp
    if (!ok) {
      const cooler = coolers
        .filter((c) => Array.isArray(c.specs.sockets) && (c.specs.sockets as string[]).includes(socket) && Number(c.specs.tdpRating) >= tdp)
        .sort((a, b) => a.price - b.price)[0]
      if (cooler) build.cooler = cooler
    }
  }
  void budget
}
