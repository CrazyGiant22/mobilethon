import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { Build } from '../types'

interface Build3DSceneProps {
  build: Build
  powered: boolean
  rgbColor: string
}

const PCB = '#0a2620'
const METAL_LIGHT = { metalness: 0.85, roughness: 0.28 }
const METAL_DARK = { metalness: 0.75, roughness: 0.35 }
const PLASTIC = { metalness: 0.15, roughness: 0.7 }

/* ------------------------------- Fan ------------------------------- */
function Fan({
  position,
  radius = 0.55,
  rgb = false,
  speed = 6,
  facing = 'x',
  powered = true,
  rgbColor = 'rainbow',
  frame = true,
}: {
  position: [number, number, number]
  radius?: number
  rgb?: boolean
  speed?: number
  facing?: 'x' | 'z' | 'y'
  powered?: boolean
  rgbColor?: string
  frame?: boolean
}) {
  const blades = useRef<THREE.Group>(null)
  const ring = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state, delta) => {
    if (blades.current && powered) blades.current.rotation.z += delta * speed
    if (ring.current) {
      if (powered && rgb) {
        if (rgbColor === 'rainbow') {
          const hue = (state.clock.elapsedTime * 0.15) % 1
          ring.current.color.setHSL(hue, 0.9, 0.55)
          ring.current.emissive.setHSL(hue, 0.9, 0.4)
        } else {
          ring.current.color.set(rgbColor)
          ring.current.emissive.set(rgbColor)
        }
        ring.current.emissiveIntensity = 0.9
      } else {
        ring.current.emissiveIntensity = powered ? 0.15 : 0
      }
    }
  })

  const rot: [number, number, number] =
    facing === 'x' ? [0, Math.PI / 2, 0] : facing === 'y' ? [Math.PI / 2, 0, 0] : [0, 0, 0]
  const fs = radius * 2.15

  return (
    <group position={position} rotation={rot}>
      {frame && (
        <RoundedBox args={[fs, fs, 0.16]} radius={0.05} smoothness={2} position={[0, 0, -0.04]}>
          <meshStandardMaterial color="#12161d" {...PLASTIC} />
        </RoundedBox>
      )}
      {/* recessed hub housing */}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[radius * 1.02, radius * 1.02, 0.06, 32]} />
        <meshStandardMaterial color="#0c0f14" {...PLASTIC} />
      </mesh>
      {/* RGB rim */}
      <mesh position={[0, 0, 0.06]}>
        <ringGeometry args={[radius * 0.9, radius, 40]} />
        <meshStandardMaterial ref={ring} color={rgb ? '#22d3ee' : '#232c39'} emissive={rgb ? '#22d3ee' : '#151a22'} emissiveIntensity={0} side={THREE.DoubleSide} />
      </mesh>
      {/* blades */}
      <group ref={blades} position={[0, 0, 0.05]}>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * radius * 0.46, Math.sin(a) * radius * 0.46, 0]} rotation={[0.35, 0, a + 0.5]}>
              <boxGeometry args={[radius * 0.72, radius * 0.42, 0.03]} />
              <meshStandardMaterial color="#e2e6ec" transparent opacity={0.85} {...PLASTIC} />
            </mesh>
          )
        })}
        <mesh>
          <cylinderGeometry args={[radius * 0.2, radius * 0.24, 0.14, 20]} />
          <meshStandardMaterial color="#3a4658" {...METAL_DARK} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------- Case ------------------------------- */
function PowerLed({ powered }: { powered: boolean }) {
  return (
    <mesh position={[1.5, 3.15, 3.35]}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color={powered ? '#34d399' : '#151a22'} emissive={powered ? '#34d399' : '#000'} emissiveIntensity={powered ? 3 : 0} />
    </mesh>
  )
}

function PcCase({ build, powered, rgbColor }: { build: Build; powered: boolean; rgbColor: string }) {
  const rgb = Boolean(build.fans?.specs.rgb)
  const solid = rgbColor === 'rainbow' ? '#22d3ee' : rgbColor
  const accent = powered && rgb ? solid : '#3a4658'
  const hx = 1.5, hy = 3.4, hz = 3.4
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2)), [])
  const fanCount = build.fans ? Math.min(3, Number(build.fans.specs.count)) : 0

  return (
    <group>
      {/* Steel chassis panels */}
      <mesh position={[-hx, 0, 0]}><boxGeometry args={[0.12, hy * 2, hz * 2]} /><meshStandardMaterial color="#0f151f" {...METAL_DARK} /></mesh>
      <mesh position={[0, 0, -hz]}><boxGeometry args={[hx * 2, hy * 2, 0.12]} /><meshStandardMaterial color="#12161d" {...METAL_DARK} /></mesh>
      <mesh position={[0, -hy, 0]}><boxGeometry args={[hx * 2, 0.12, hz * 2]} /><meshStandardMaterial color="#0f151f" {...METAL_DARK} /></mesh>
      <mesh position={[0, hy, 0]}><boxGeometry args={[hx * 2, 0.12, hz * 2]} /><meshStandardMaterial color="#12161d" transparent opacity={0.6} {...METAL_DARK} /></mesh>
      {/* Front panel with mesh intake */}
      <mesh position={[0, 0, hz]}><boxGeometry args={[hx * 2, hy * 2, 0.1]} /><meshStandardMaterial color="#0c1017" transparent opacity={0.5} {...METAL_DARK} /></mesh>
      {/* PSU shroud */}
      <RoundedBox args={[hx * 2 - 0.1, 1.0, hz * 2 - 0.4]} radius={0.04} position={[0, -hy + 0.9, 0]}>
        <meshStandardMaterial color="#0c1119" {...METAL_DARK} />
      </RoundedBox>
      {/* Tempered glass side */}
      <mesh position={[hx, 0, 0]}><boxGeometry args={[0.05, hy * 2, hz * 2]} /><meshPhysicalMaterial color="#5aa0d0" transparent opacity={0.1} roughness={0.05} metalness={0} transmission={0.6} /></mesh>
      {/* Feet */}
      {[[-hx + 0.4, -hz + 0.4], [hx - 0.4, -hz + 0.4], [-hx + 0.4, hz - 0.4], [hx - 0.4, hz - 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, -hy - 0.12, z]}><cylinderGeometry args={[0.12, 0.12, 0.16, 12]} /><meshStandardMaterial color="#0a0d13" {...PLASTIC} /></mesh>
      ))}
      <lineSegments geometry={edges}><lineBasicMaterial color={accent} /></lineSegments>
      <PowerLed powered={powered} />
      {Array.from({ length: fanCount }).map((_, i) => (
        <Fan key={i} position={[0.2, hy - 1.1 - i * 1.15, hz - 0.18]} radius={0.5} rgb={rgb} facing="z" speed={5} powered={powered} rgbColor={rgbColor} />
      ))}
    </group>
  )
}

/* --------------------------- Motherboard --------------------------- */
function FinnedBlock({ position, size, color = '#39424f' }: { position: [number, number, number]; size: [number, number, number]; color?: string }) {
  const [w, h, d] = size
  const fins = 6
  return (
    <group position={position}>
      <RoundedBox args={size} radius={0.02} smoothness={2}><meshStandardMaterial color={color} {...METAL_LIGHT} /></RoundedBox>
      {Array.from({ length: fins }).map((_, i) => (
        <mesh key={i} position={[w / 2 + 0.005, 0, -d / 2 + (d / (fins - 1)) * i]}>
          <boxGeometry args={[0.02, h * 0.9, 0.02]} />
          <meshStandardMaterial color="#2a323d" {...METAL_DARK} />
        </mesh>
      ))}
    </group>
  )
}

function Motherboard() {
  return (
    <group position={[-1.35, 0.1, -0.1]}>
      <RoundedBox args={[0.12, 5, 5]} radius={0.03} smoothness={2}><meshStandardMaterial color={PCB} roughness={0.75} metalness={0.15} /></RoundedBox>
      {/* CPU socket frame */}
      <RoundedBox args={[0.06, 1.05, 1.05]} radius={0.02} position={[0.09, 1.2, 0.4]}><meshStandardMaterial color="#1a2029" {...METAL_DARK} /></RoundedBox>
      {/* VRM heatsinks around socket */}
      <FinnedBlock position={[0.13, 2.05, 0.4]} size={[0.16, 0.5, 1.1]} />
      <FinnedBlock position={[0.13, 1.2, 1.15]} size={[0.16, 1.0, 0.4]} />
      {/* Chipset heatsink */}
      <RoundedBox args={[0.16, 0.9, 0.9]} radius={0.03} position={[0.13, -1.5, 0.7]}><meshStandardMaterial color="#2b333f" {...METAL_LIGHT} /></RoundedBox>
      {/* M.2 heatsink */}
      <RoundedBox args={[0.14, 0.28, 1.6]} radius={0.02} position={[0.12, -0.55, 0.5]}><meshStandardMaterial color="#39424f" {...METAL_LIGHT} /></RoundedBox>
      {/* PCIe slots */}
      {[-0.2, -1.1].map((y, i) => (
        <mesh key={i} position={[0.09, y, 0.2]}><boxGeometry args={[0.05, 0.12, 2.4]} /><meshStandardMaterial color="#0c1218" {...PLASTIC} /></mesh>
      ))}
      {/* DIMM slots */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.08, 1.4, -0.6 - i * 0.28]}><boxGeometry args={[0.05, 1.6, 0.12]} /><meshStandardMaterial color="#101922" {...PLASTIC} /></mesh>
      ))}
      {/* 24-pin + rear I/O shroud */}
      <RoundedBox args={[0.16, 0.6, 0.28]} radius={0.02} position={[0.12, 0.5, 2.3]}><meshStandardMaterial color="#0c1218" {...PLASTIC} /></RoundedBox>
      <RoundedBox args={[0.2, 1.1, 1.6]} radius={0.04} position={[0.14, 2.05, -1.6]}><meshStandardMaterial color="#12161d" {...METAL_DARK} /></RoundedBox>
    </group>
  )
}

function Cpu() {
  return (
    <group position={[-1.1, 1.2, 0.4]}>
      <RoundedBox args={[0.1, 0.85, 0.85]} radius={0.02} position={[0.06, 0, 0]}><meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.2} /></RoundedBox>
      <mesh position={[0.115, 0, 0]}><boxGeometry args={[0.01, 0.4, 0.4]} /><meshStandardMaterial color="#9aa2ad" metalness={0.95} roughness={0.15} /></mesh>
    </group>
  )
}

/* ------------------------------ Coolers ------------------------------ */
function AirCooler({ powered }: { powered: boolean }) {
  return (
    <group position={[-0.5, 1.5, 0.4]}>
      {/* fin stack */}
      {Array.from({ length: 22 }).map((_, i) => (
        <mesh key={i} position={[0, -1.05 + i * 0.1, 0]}>
          <boxGeometry args={[1.0, 0.03, 1.15]} />
          <meshStandardMaterial color="#c2cad6" {...METAL_LIGHT} />
        </mesh>
      ))}
      {/* heatpipes */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0.1, z]}><cylinderGeometry args={[0.06, 0.06, 2.3, 12]} /><meshStandardMaterial color="#b08d57" metalness={0.9} roughness={0.25} /></mesh>
      ))}
      {/* mounted fan on +X */}
      <Fan position={[0.62, 0, 0]} radius={0.55} facing="x" speed={7} powered={powered} />
    </group>
  )
}

function AioCooler({ rgb, powered, rgbColor }: { rgb: boolean; powered: boolean; rgbColor: string }) {
  const solid = rgbColor === 'rainbow' ? '#22d3ee' : rgbColor
  return (
    <group>
      {/* pump block */}
      <RoundedBox args={[0.34, 0.8, 0.8]} radius={0.05} position={[-1.02, 1.2, 0.4]}><meshStandardMaterial color="#1a1f27" metalness={0.7} roughness={0.3} /></RoundedBox>
      <mesh position={[-0.84, 1.2, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.16, 0.3, 32]} />
        <meshStandardMaterial color={solid} emissive={solid} emissiveIntensity={powered ? 1.1 : 0} side={THREE.DoubleSide} />
      </mesh>
      {/* tubes */}
      {[-0.15, 0.15].map((z, i) => (
        <mesh key={i} position={[-0.7, 2.2, 0.4 + z]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.09, 0.09, 2.2, 10]} /><meshStandardMaterial color="#0c0f14" {...PLASTIC} /></mesh>
      ))}
      {/* top radiator */}
      <RoundedBox args={[2.7, 0.4, 1.05]} radius={0.04} position={[0, 3.15, 0]}><meshStandardMaterial color="#20262f" {...METAL_DARK} /></RoundedBox>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} position={[-1.25 + i * 0.16, 3.15, 0]}><boxGeometry args={[0.02, 0.36, 1.0]} /><meshStandardMaterial color="#2c333d" {...METAL_DARK} /></mesh>
      ))}
      <Fan position={[-0.7, 2.86, 0]} radius={0.46} facing="y" rgb={rgb} speed={6} powered={powered} rgbColor={rgbColor} />
      <Fan position={[0.7, 2.86, 0]} radius={0.46} facing="y" rgb={rgb} speed={6} powered={powered} rgbColor={rgbColor} />
    </group>
  )
}

/* -------------------------------- RAM -------------------------------- */
function RamSticks({ count, rgb, powered, rgbColor }: { count: number; rgb: boolean; powered: boolean; rgbColor: string }) {
  const n = Math.min(4, Math.max(2, count))
  const solid = rgbColor === 'rainbow' ? '#22d3ee' : rgbColor
  return (
    <group position={[-0.95, 1.5, -0.9]}>
      {Array.from({ length: n }).map((_, i) => (
        <group key={i} position={[0, 0, -i * 0.3]}>
          {/* PCB */}
          <mesh><boxGeometry args={[0.5, 1.5, 0.05]} /><meshStandardMaterial color="#0a2620" roughness={0.7} /></mesh>
          {/* heat spreader */}
          <RoundedBox args={[0.52, 1.35, 0.12]} radius={0.03} position={[0, -0.05, 0]}><meshStandardMaterial color="#8a1e2c" {...METAL_LIGHT} /></RoundedBox>
          {/* RGB diffuser bar on top */}
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[0.5, 0.1, 0.14]} />
            <meshStandardMaterial color={rgb ? solid : '#e5e7eb'} emissive={rgb ? solid : '#000'} emissiveIntensity={rgb && powered ? 0.9 : 0} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* -------------------------------- GPU -------------------------------- */
function Gpu({ accent, lengthUnits, powered, brand }: { accent: string; lengthUnits: number; powered: boolean; brand: string }) {
  const fanN = lengthUnits > 2.6 ? 3 : 2
  const half = lengthUnits / 2
  return (
    <group position={[-0.5, -0.55, 0.2]}>
      {/* PCB edge */}
      <mesh position={[0, -0.18, 0]}><boxGeometry args={[1.7, 0.1, lengthUnits]} /><meshStandardMaterial color="#0a2620" roughness={0.7} /></mesh>
      {/* shroud */}
      <RoundedBox args={[1.9, 0.5, lengthUnits]} radius={0.05} smoothness={2}><meshStandardMaterial color="#12161d" {...METAL_DARK} /></RoundedBox>
      {/* backplate */}
      <RoundedBox args={[1.96, 0.06, lengthUnits * 1.02]} radius={0.03} position={[0, -0.28, 0]}><meshStandardMaterial color="#1a1f27" {...METAL_LIGHT} /></RoundedBox>
      {/* accent light strip along top edge */}
      <mesh position={[0.7, 0.26, 0]}>
        <boxGeometry args={[0.12, 0.04, lengthUnits * 0.85]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={powered ? 0.9 : 0.15} />
      </mesh>
      {/* fans recessed into shroud */}
      {Array.from({ length: fanN }).map((_, i) => {
        const z = -half + (lengthUnits / fanN) * (i + 0.5)
        return <Fan key={i} position={[0, 0.27, z]} radius={0.42} facing="y" speed={8} powered={powered} frame={false} />
      })}
      {/* I/O bracket */}
      <mesh position={[0, 0, half + 0.03]}><boxGeometry args={[1.9, 0.7, 0.06]} /><meshStandardMaterial color="#c2cad6" {...METAL_LIGHT} /></mesh>
      {/* brand tag */}
      <mesh position={[0.97, 0, -half + lengthUnits * 0.25]}><boxGeometry args={[0.02, 0.24, 0.7]} /><meshStandardMaterial color={brand === 'AMD' ? '#ED1C24' : brand === 'NVIDIA' ? '#76B900' : '#22d3ee'} emissive={brand === 'AMD' ? '#ED1C24' : brand === 'NVIDIA' ? '#76B900' : '#22d3ee'} emissiveIntensity={powered ? 0.5 : 0.1} /></mesh>
    </group>
  )
}

/* -------------------------------- PSU -------------------------------- */
function Psu() {
  return (
    <group position={[-0.5, -2.75, -1.5]}>
      <RoundedBox args={[1.7, 1.1, 1.9]} radius={0.05}><meshStandardMaterial color="#0b0f16" {...METAL_DARK} /></RoundedBox>
      {/* fan grille on top */}
      <mesh position={[0, 0.56, 0]}><cylinderGeometry args={[0.5, 0.5, 0.02, 24]} /><meshStandardMaterial color="#05070b" {...PLASTIC} /></mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.57, 0]} rotation={[0, (i / 6) * Math.PI, 0]}><boxGeometry args={[1.0, 0.01, 0.02]} /><meshStandardMaterial color="#1a1f27" /></mesh>
      ))}
    </group>
  )
}

/* ------------------------------ Storage ------------------------------ */
function Storage() {
  return (
    <group position={[-1.15, -0.55, 1.7]}>
      <mesh><boxGeometry args={[0.06, 0.24, 1.4]} /><meshStandardMaterial color="#0a2620" roughness={0.7} /></mesh>
      <RoundedBox args={[0.1, 0.26, 1.5]} radius={0.02} position={[0.03, 0, 0]}><meshStandardMaterial color="#1f6feb" {...METAL_LIGHT} /></RoundedBox>
    </group>
  )
}

/* ------------------------------ Monitor ------------------------------ */
function Monitor({ sizeInches, powered }: { sizeInches: number; powered: boolean }) {
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const scale = 1 + (sizeInches - 24) / 45
  const w = 6.6 * scale
  const h = (w * 9) / 16
  const groundY = -3.5
  const neckHeight = 1.5

  useFrame((state) => {
    if (!screenMat.current) return
    screenMat.current.emissiveIntensity = powered ? 0.9 + Math.sin(state.clock.elapsedTime * 8) * 0.03 : 0
  })

  const screenCenterY = groundY + neckHeight + 0.1 + h / 2

  return (
    <group position={[7.4, 0, 0.5]} rotation={[0, -0.6, 0]}>
      <mesh position={[0, groundY + 0.06, 0]}><cylinderGeometry args={[w * 0.2, w * 0.24, 0.14, 32]} /><meshStandardMaterial color="#0b0f16" {...METAL_DARK} /></mesh>
      <RoundedBox args={[0.28, neckHeight, 0.3]} radius={0.04} position={[0, groundY + neckHeight / 2, 0]}><meshStandardMaterial color="#12161d" {...METAL_DARK} /></RoundedBox>
      <RoundedBox args={[w + 0.14, h + 0.14, 0.16]} radius={0.05} position={[0, screenCenterY, 0]}><meshStandardMaterial color="#080b11" metalness={0.5} roughness={0.5} /></RoundedBox>
      <mesh position={[0, screenCenterY, 0.09]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial ref={screenMat} color={powered ? '#0a1830' : '#05070c'} emissive="#1e66ff" emissiveIntensity={0} />
      </mesh>
      {powered && (
        <group position={[0, screenCenterY, 0.11]}>
          <mesh position={[0, h * 0.08, 0]}><planeGeometry args={[w * 0.98, h * 0.5]} /><meshStandardMaterial color="#0b3a6b" emissive="#22d3ee" emissiveIntensity={0.5} transparent opacity={0.6} /></mesh>
          <mesh position={[0, h * 0.05, 0.01]}><planeGeometry args={[w * 0.34, h * 0.14]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.1} /></mesh>
          <mesh position={[0, -h / 2 + h * 0.06, 0]}><planeGeometry args={[w * 0.98, h * 0.1]} /><meshStandardMaterial color="#0a1220" emissive="#0a1220" emissiveIntensity={0.2} /></mesh>
        </group>
      )}
      {powered && <pointLight position={[0, screenCenterY, 1.2]} intensity={12} color="#3b82f6" distance={6} />}
    </group>
  )
}

function Scene({ build, powered, rgbColor }: { build: Build; powered: boolean; rgbColor: string }) {
  const coolerType = build.cooler ? String(build.cooler.specs.type) : null
  const ramCount = build.ram ? Number(build.ram.specs.modules) || 2 : 0
  const rgb = Boolean(build.fans?.specs.rgb)
  const gpuLen = build.gpu ? Math.min(2.9, 2 + Number(build.gpu.specs.length) / 260) : 2.4
  const gpuAccent = build.gpu?.brand === 'NVIDIA' ? '#76B900' : build.gpu?.brand === 'AMD' ? '#ED1C24' : '#22d3ee'

  return (
    <group rotation={[0, -0.5, 0]}>
      <PcCase build={build} powered={powered} rgbColor={rgbColor} />
      {build.motherboard && <Motherboard />}
      {build.cpu && <Cpu />}
      {build.cooler && coolerType === 'air' && <AirCooler powered={powered} />}
      {build.cooler && coolerType === 'aio' && <AioCooler rgb={rgb} powered={powered} rgbColor={rgbColor} />}
      {build.ram && <RamSticks count={ramCount} rgb={rgb} powered={powered} rgbColor={rgbColor} />}
      {build.gpu && <Gpu accent={gpuAccent} lengthUnits={gpuLen} powered={powered} brand={build.gpu.brand} />}
      {build.psu && <Psu />}
      {build.storage && <Storage />}
      {build.monitor && <Monitor sizeInches={Number(build.monitor.specs.size) || 27} powered={powered} />}
    </group>
  )
}

export default function Build3DScene({ build, powered, rgbColor }: Build3DSceneProps) {
  return (
    <Canvas camera={{ position: [11, 4, 11], fov: 42 }} dpr={[1, 2]} shadows gl={{ preserveDrawingBuffer: true, antialias: true }}>
      <color attach="background" args={['#0a0e17']} />
      <fog attach="fog" args={['#0a0e17', 16, 30]} />

      <ambientLight intensity={powered ? 0.7 : 0.5} />
      <hemisphereLight args={['#8fb7ff', '#1a1030', 0.9]} />
      <directionalLight position={[6, 9, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.9} color="#bcd3ff" />
      <spotLight position={[0, 10, 2]} angle={0.6} penumbra={0.6} intensity={120} color="#ffffff" castShadow />
      <pointLight position={[-4, 2, 5]} intensity={powered ? 70 : 25} color="#22d3ee" distance={18} />
      <pointLight position={[5, 3, -3]} intensity={powered ? 55 : 20} color="#a78bfa" distance={18} />
      <pointLight position={[4, -2, 4]} intensity={35} color="#38bdf8" distance={16} />
      <pointLight position={[-3, -3, -3]} intensity={25} color="#fb7185" distance={14} />
      <spotLight position={[-2, 4, -8]} angle={0.8} penumbra={1} intensity={90} color="#22d3ee" />

      <Scene build={build} powered={powered} rgbColor={rgbColor} />
      <ContactShadows position={[0, -3.65, 0]} opacity={0.6} scale={20} blur={2.5} far={5} />
      <OrbitControls enablePan={false} minDistance={7} maxDistance={24} autoRotate autoRotateSpeed={0.8} target={[1.5, 0, 0]} />
    </Canvas>
  )
}
