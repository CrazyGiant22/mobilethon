import type { Build, CompatibilityIssue } from '../types'

function socketMatch(cpuSocket: string, mbSocket: string): boolean {
  return cpuSocket === mbSocket
}

function ramMatch(mbDdr: string, ramType: string): boolean {
  return mbDdr === ramType
}

function coolerSocketMatch(sockets: string[], cpuSocket: string): boolean {
  return sockets.includes(cpuSocket)
}

export function checkCompatibility(build: Build): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []

  if (build.cpu && build.motherboard) {
    const cpuSocket = String(build.cpu.specs.socket)
    const mbSocket = String(build.motherboard.specs.socket)
    if (!socketMatch(cpuSocket, mbSocket)) {
      issues.push({
        id: 'socket-mismatch',
        severity: 'error',
        title: 'Socket mismatch',
        message: `${build.cpu.name} (${cpuSocket}) is not compatible with ${build.motherboard.name} (${mbSocket}).`,
        category: 'motherboard',
      })
    } else {
      issues.push({
        id: 'socket-ok',
        severity: 'success',
        title: 'Socket compatible',
        message: `CPU and motherboard both use ${cpuSocket}.`,
        category: 'motherboard',
      })
    }
  }

  if (build.motherboard && build.ram) {
    const mbDdr = String(build.motherboard.specs.ddr)
    const ramType = String(build.ram.specs.type)
    if (!ramMatch(mbDdr, ramType)) {
      issues.push({
        id: 'ram-mismatch',
        severity: 'error',
        title: 'Memory type mismatch',
        message: `Motherboard supports ${mbDdr} but selected RAM is ${ramType}.`,
        category: 'ram',
      })
    }
  }

  if (build.cpu && build.cooler) {
    const cpuSocket = String(build.cpu.specs.socket)
    const sockets = build.cooler.specs.sockets
    if (!Array.isArray(sockets) || !coolerSocketMatch(sockets, cpuSocket)) {
      issues.push({
        id: 'cooler-socket',
        severity: 'error',
        title: 'Cooler incompatible',
        message: `${build.cooler.name} does not support ${cpuSocket} socket.`,
        category: 'cooler',
      })
    }
  }

  if (build.cpu && build.cooler) {
    const cpuTdp = build.cpu.tdp ?? 65
    const coolerRating = Number(build.cooler.specs.tdpRating)
    if (coolerRating < cpuTdp) {
      issues.push({
        id: 'cooler-tdp',
        severity: 'warning',
        title: 'Cooler may be undersized',
        message: `CPU TDP is ${cpuTdp}W but cooler is rated for ${coolerRating}W. Expect higher temps under load.`,
        category: 'cooler',
      })
    } else if (coolerRating >= cpuTdp + 50) {
      issues.push({
        id: 'cooler-tdp-ok',
        severity: 'success',
        title: 'Cooling headroom adequate',
        message: `Cooler (${coolerRating}W) comfortably handles the ${cpuTdp}W CPU.`,
        category: 'cooler',
      })
    }
  }

  if (build.gpu && build.case) {
    const gpuLength = Number(build.gpu.specs.length)
    const maxGpu = Number(build.case.specs.maxGpuLength)
    if (gpuLength > maxGpu) {
      issues.push({
        id: 'gpu-length',
        severity: 'error',
        title: 'GPU too long for case',
        message: `GPU is ${gpuLength}mm but case supports up to ${maxGpu}mm.`,
        category: 'case',
      })
    }
  }

  if (build.cooler && build.case) {
    const coolerType = String(build.cooler.specs.type)
    if (coolerType === 'air') {
      const height = Number(build.cooler.specs.height)
      const maxHeight = Number(build.case.specs.maxCoolerHeight)
      if (height > maxHeight) {
        issues.push({
          id: 'cooler-height',
          severity: 'error',
          title: 'Cooler too tall',
          message: `Air cooler is ${height}mm tall but case clearance is ${maxHeight}mm.`,
          category: 'case',
        })
      }
    }
    if (coolerType === 'aio') {
      const radiator = Number(build.cooler.specs.radiator)
      const caseRad = Number(build.case.specs.radiatorSupport)
      if (radiator > caseRad) {
        issues.push({
          id: 'radiator-size',
          severity: 'warning',
          title: 'Radiator may not fit',
          message: `${radiator}mm AIO exceeds case's ${caseRad}mm radiator support. Check mounting positions.`,
          category: 'case',
        })
      }
    }
  }

  if (build.ram) {
    const capacity = Number(build.ram.specs.capacity)
    if (capacity < 16) {
      issues.push({
        id: 'ram-low',
        severity: 'warning',
        title: 'Low memory capacity',
        message: '16GB is the practical minimum for modern gaming and multitasking.',
        category: 'ram',
      })
    } else if (capacity >= 32) {
      issues.push({
        id: 'ram-good',
        severity: 'info',
        title: 'Memory capacity solid',
        message: `${capacity}GB is well-suited for gaming, streaming, and content creation.`,
        category: 'ram',
      })
    }
  }

  const missing = (['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu'] as const).filter(
    (cat) => !build[cat],
  )
  if (missing.length > 0 && missing.length < 6) {
    issues.push({
      id: 'incomplete-build',
      severity: 'info',
      title: 'Build incomplete',
      message: `Still need: ${missing.join(', ')}. Analysis improves as you add parts.`,
      category: 'general',
    })
  }

  return issues
}
