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
    } else {
      const maxRam = Number(build.motherboard.specs.maxRam)
      const capacity = Number(build.ram.specs.capacity)
      if (capacity > maxRam) {
        issues.push({
          id: 'ram-capacity',
          severity: 'error',
          title: 'RAM exceeds board limit',
          message: `${capacity}GB kit exceeds motherboard's ${maxRam}GB maximum.`,
          category: 'ram',
        })
      }
    }
  }

  if (build.motherboard && build.case) {
    const boardFf = String(build.motherboard.specs.formFactor)
    const caseFf = String(build.case.specs.formFactor)
    const rank: Record<string, number> = { 'mini-ITX': 1, mATX: 2, ATX: 3, 'E-ATX': 4 }
    if ((rank[boardFf] ?? 2) > (rank[caseFf] ?? 3)) {
      issues.push({
        id: 'form-factor',
        severity: 'error',
        title: 'Motherboard too large for case',
        message: `${boardFf} board won't fit in a ${caseFf} case.`,
        category: 'case',
      })
    }
  }

  if (build.cpu && !build.gpu) {
    const hasIgpu = Boolean(build.cpu.specs.igpu)
    if (!hasIgpu) {
      issues.push({
        id: 'no-gpu',
        severity: 'warning',
        title: 'No graphics card selected',
        message: `${build.cpu.name} has no integrated graphics — you need a dedicated GPU for display output.`,
        category: 'gpu',
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

  if (build.gpu && build.psu) {
    const draw = Number(build.gpu.powerDraw ?? 0)
    if (draw >= 300) {
      issues.push({
        id: 'gpu-connector',
        severity: 'info',
        title: 'High-power GPU connector',
        message: `${build.gpu.name} draws ${draw}W — use an ATX 3.0 PSU with a native 12VHPWR (12V-2x6) cable, or the included adapter.`,
        category: 'psu',
      })
    }
  }

  if (build.motherboard && build.gpu) {
    const boardPcie = Number(build.motherboard.specs.pcie ?? 0)
    const series = String(build.gpu.specs.series ?? '')
    const modern = series === 'RTX 40' || series === 'RTX 50' || !series // current-gen default
    if (boardPcie > 0 && boardPcie < 4 && modern && (build.gpu.performanceScore ?? 0) >= 70) {
      issues.push({
        id: 'pcie-gen',
        severity: 'info',
        title: 'Older PCIe generation',
        message: `Motherboard runs PCIe ${boardPcie}. This GPU will work fine, but a PCIe 4.0+ board avoids any bandwidth limits.`,
        category: 'motherboard',
      })
    }
  }

  if (build.motherboard && build.ram) {
    const ff = String(build.motherboard.specs.formFactor)
    const modules = Number(build.ram.specs.modules ?? 2)
    if (ff === 'mini-ITX' && modules > 2) {
      issues.push({
        id: 'ram-slots',
        severity: 'error',
        title: 'Too many RAM sticks for board',
        message: `Mini-ITX boards have only 2 DIMM slots, but this kit is ${modules} modules. Choose a 2-stick kit.`,
        category: 'ram',
      })
    }
  }

  if (build.gpu && build.monitor) {
    const pixels = Number(build.monitor.specs.pixels)
    const refresh = Number(build.monitor.specs.refreshRate)
    const gpuScore = build.gpu.performanceScore ?? 0
    if (pixels >= 8_000_000 && gpuScore < 80) {
      issues.push({
        id: 'monitor-4k',
        severity: 'warning',
        title: 'GPU may struggle at 4K',
        message: `${build.monitor.name} is 4K. ${build.gpu.name} may need lowered settings or upscaling to hit high FPS.`,
        category: 'monitor',
      })
    } else if (refresh >= 200 && gpuScore < 70) {
      issues.push({
        id: 'monitor-highrefresh',
        severity: 'info',
        title: 'High refresh needs more GPU',
        message: `To saturate ${refresh}Hz, pair with a stronger GPU or play esports titles at lower settings.`,
        category: 'monitor',
      })
    } else {
      issues.push({
        id: 'monitor-ok',
        severity: 'success',
        title: 'Monitor well matched',
        message: `${build.gpu.name} pairs nicely with this ${build.monitor.specs.resolution} display.`,
        category: 'monitor',
      })
    }
  }

  if (build.os && String(build.os.specs.type) === 'Windows' && build.ram) {
    const capacity = Number(build.ram.specs.capacity)
    if (capacity < 8) {
      issues.push({
        id: 'os-ram',
        severity: 'warning',
        title: 'RAM below Windows 11 needs',
        message: 'Windows 11 needs 8GB+ for a smooth experience.',
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
