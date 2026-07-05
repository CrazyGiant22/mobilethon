import type { Build, ComponentCategory, PCComponent } from '../types'
import { CATEGORY_ORDER } from '../types'
import { getComponentById } from '../data/components'

const SESSION_KEY = 'buildforge-session'
const FORM_FACTOR_RANK: Record<string, number> = {
  'mini-ITX': 1,
  mATX: 2,
  ATX: 3,
  'E-ATX': 4,
}

export function serializeBuildIds(build: Build): Record<string, string> {
  const ids: Record<string, string> = {}
  for (const cat of CATEGORY_ORDER) {
    if (build[cat]) ids[cat] = build[cat]!.id
  }
  return ids
}

export function deserializeBuildIds(ids: Record<string, string>): Build {
  const build: Build = {}
  for (const [cat, id] of Object.entries(ids)) {
    const comp = getComponentById(id)
    if (comp) build[cat as ComponentCategory] = comp
  }
  return build
}

export function buildToUrlParams(build: Build): string {
  const ids = serializeBuildIds(build)
  if (Object.keys(ids).length === 0) return ''
  return new URLSearchParams({ build: JSON.stringify(ids) }).toString()
}

export function buildFromUrl(): Build | null {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('build')
  if (!raw) return null
  try {
    return deserializeBuildIds(JSON.parse(raw))
  } catch {
    return null
  }
}

export function syncBuildUrl(build: Build) {
  const params = buildToUrlParams(build)
  const hash = window.location.hash || '#builder'
  const next = params ? `${window.location.pathname}?${params}${hash}` : `${window.location.pathname}${hash}`
  window.history.replaceState(null, '', next)
}

export function saveSessionBuild(build: Build) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(serializeBuildIds(build)))
  } catch {
    /* quota exceeded */
  }
}

export function loadSessionBuild(): Build | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return deserializeBuildIds(JSON.parse(raw))
  } catch {
    return null
  }
}

export function getShareUrl(build: Build): string {
  const params = buildToUrlParams(build)
  return params ? `${window.location.origin}${window.location.pathname}?${params}` : window.location.origin
}

/** Returns incompatibility reason, or null if the part fits the current build. */
export function getCompatBlockReason(
  build: Build,
  candidate: PCComponent,
  slot: ComponentCategory,
): string | null {
  const trial: Build = { ...build, [slot]: candidate }

  if (slot === 'cpu' && build.motherboard) {
    if (String(candidate.specs.socket) !== String(build.motherboard.specs.socket)) {
      return `Needs ${build.motherboard.specs.socket} socket`
    }
  }
  if (slot === 'motherboard' && build.cpu) {
    if (String(candidate.specs.socket) !== String(build.cpu.specs.socket)) {
      return `Needs ${build.cpu.specs.socket} socket`
    }
  }
  if (slot === 'ram' && build.motherboard) {
    if (String(candidate.specs.type) !== String(build.motherboard.specs.ddr)) {
      return `Requires ${build.motherboard.specs.ddr}`
    }
    const maxRam = Number(build.motherboard.specs.maxRam)
    const capacity = Number(candidate.specs.capacity)
    if (capacity > maxRam) {
      return `Exceeds ${maxRam}GB board limit`
    }
  }
  if (slot === 'motherboard' && build.ram) {
    if (String(candidate.specs.ddr) !== String(build.ram.specs.type)) {
      return `Needs ${build.ram.specs.type} support`
    }
  }
  if (slot === 'cooler' && build.cpu) {
    const sockets = candidate.specs.sockets
    const cpuSocket = String(build.cpu.specs.socket)
    if (!Array.isArray(sockets) || !sockets.includes(cpuSocket)) {
      return `No ${cpuSocket} mount`
    }
  }
  if (slot === 'gpu' && build.case) {
    if (Number(candidate.specs.length) > Number(build.case.specs.maxGpuLength)) {
      return `Too long for case (${build.case.specs.maxGpuLength}mm max)`
    }
  }
  if (slot === 'case' && build.gpu) {
    if (Number(build.gpu.specs.length) > Number(candidate.specs.maxGpuLength)) {
      return `GPU needs ${build.gpu.specs.length}mm clearance`
    }
  }
  if (slot === 'motherboard' && build.case) {
    const boardRank = FORM_FACTOR_RANK[String(candidate.specs.formFactor)] ?? 2
    const caseRank = FORM_FACTOR_RANK[String(build.case.specs.formFactor)] ?? 3
    if (boardRank > caseRank) {
      return `Board too large for ${build.case.specs.formFactor} case`
    }
  }
  if (slot === 'case' && build.motherboard) {
    const boardRank = FORM_FACTOR_RANK[String(build.motherboard.specs.formFactor)] ?? 2
    const caseRank = FORM_FACTOR_RANK[String(candidate.specs.formFactor)] ?? 3
    if (boardRank > caseRank) {
      return `Fits ${build.motherboard.specs.formFactor} boards only`
    }
  }
  if (slot === 'psu' && trial.cpu && trial.gpu) {
    const draw = 55 + (trial.cpu.tdp ?? 0) + (trial.gpu.powerDraw ?? 0)
    const recommended = Math.ceil((draw * 1.3) / 50) * 50
    if (Number(candidate.specs.wattage) < recommended) {
      return `Undersized — need ${recommended}W+`
    }
  }

  return null
}

export function getComponentSpecSummary(component: PCComponent): string {
  const { category, specs } = component
  switch (category) {
    case 'cpu':
      return `${specs.socket} · ${specs.cores}C/${specs.threads}T · ${component.tdp ?? specs.tdp}W`
    case 'gpu':
      return `${specs.vram}GB ${specs.vramType} · ${component.powerDraw}W · ${specs.length}mm`
    case 'motherboard':
      return `${specs.socket} · ${specs.chipset} · ${specs.ddr} · ${specs.formFactor}`
    case 'ram':
      return `${specs.capacity}GB ${specs.type}-${specs.speed}`
    case 'storage':
      return `${specs.capacity}GB ${specs.type} · ${specs.readMBs}MB/s read`
    case 'psu':
      return `${specs.wattage}W · ${specs.efficiency} · ${specs.modular}`
    case 'cooler':
      return specs.type === 'aio'
        ? `${specs.radiator}mm AIO · ${specs.tdpRating}W TDP`
        : `Air · ${specs.tdpRating}W TDP · ${specs.height}mm`
    case 'case':
      return `${specs.formFactor} · GPU ≤${specs.maxGpuLength}mm · Rad ${specs.radiatorSupport}mm`
    case 'monitor':
      return `${specs.size}" · ${specs.resolution} · ${specs.refreshRate}Hz ${specs.panel}`
    case 'fans':
      return `${specs.count}× ${specs.size}mm · ${specs.rpm} RPM${specs.rgb ? ' · RGB' : ''}`
    case 'os':
      return `${specs.type} ${specs.edition} · ${specs.license}`
    default:
      return ''
  }
}
