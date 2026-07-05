import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { Build } from '../types'

interface Build3DSceneProps {
  build: Build
  powered: boolean
  rgbColor: string
}

const PCB_COLOR = '#0c2a22'
const METAL = { metalness: 0.6, roughness: 0.35 }

function Fan({
  position,
  radius = 0.55,
  rgb = false,
  speed = 6,
  facing = 'x',
  powered = true,
  rgbColor = 'rainbow',
}: {
  position: [number, number, number]
  radius?: number
  rgb?: boolean
  speed?: number
  facing?: 'x' | 'z' | 'y'
  powered?: boolean
  rgbColor?: string
}) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state, delta) => {
    if (group.current && powered) group.current.rotation.z += delta * speed
    if (mat.current) {
      if (powered && rgb) {
        if (rgbColor === 'rainbow') {
          const hue = (state.clock.elapsedTime * 0.15) % 1
          mat.current.color.setHSL(hue, 0.9, 0.55)
          mat.current.emissive.setHSL(hue, 0.9, 0.35)
        } else {
          mat.current.color.set(rgbColor)
          mat.current.emissive.set(rgbColor)
        }
        mat.current.emissiveIntensity = 0.8
      } else if (powered) {
        mat.current.emissiveIntensity = 0.25
      } else {
        mat.current.emissiveIntensity = 0
      }
    }
  })

  const rot: [number, number, number] =
    facing === 'x' ? [0, Math.PI / 2, 0] : facing === 'y' ? [Math.PI / 2, 0, 0] : [0, 0, 0]

  return (
    <group position={position} rotation={rot}>
      <mesh>
        <ringGeometry args={[radius * 0.95, radius, 24]} />
        <meshStandardMaterial
          ref={mat}
          color={rgb ? '#22d3ee' : '#1b2433'}
          emissive={rgb ? '#22d3ee' : '#2a3646'}
          emissiveIntensity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={group}>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * radius * 0.45, Math.sin(a) * radius * 0.45, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[radius * 0.6, radius * 0.22, 0.04]} />
              <meshStandardMaterial color="#2a3646" {...METAL} />
            </mesh>
          )
        })}
        <mesh>
          <cylinderGeometry args={[radius * 0.18, radius * 0.18, 0.12, 16]} />
          <meshStandardMaterial color="#3a4658" {...METAL} />
        </mesh>
      </group>
    </group>
  )
}

function PowerLed({ powered }: { powered: boolean }) {
  return (
    <mesh position={[1.5, 2.9, 3.3]}>
      <sphereGeometry args={[0.09, 12, 12]} />
      <meshStandardMaterial
        color={powered ? '#34d399' : '#1b2433'}
        emissive={powered ? '#34d399' : '#000000'}
        emissiveIntensity={powered ? 2 : 0}
      />
    </mesh>
  )
}

function PcCase({ build, powered, rgbColor }: { build: Build; powered: boolean; rgbColor: string }) {
  const caseColor = '#141c2b'
  const rgb = Boolean(build.fans?.specs.rgb)
  const solid = rgbColor === 'rainbow' ? '#22d3ee' : rgbColor
  const accent = powered && rgb ? solid : '#3a4658'
  const hx = 1.5
  const hy = 3.4
  const hz = 3.4

  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2)), [])
  const fanCount = build.fans ? Math.min(3, Number(build.fans.specs.count)) : 0

  return (
    <group>
      <mesh position={[-hx, 0, 0]}>
        <boxGeometry args={[0.1, hy * 2, hz * 2]} />
        <meshStandardMaterial color={caseColor} {...METAL} />
      </mesh>
      <mesh position={[0, 0, -hz]}>
        <boxGeometry args={[hx * 2, hy * 2, 0.1]} />
        <meshStandardMaterial color={caseColor} transparent opacity={0.55} {...METAL} />
      </mesh>
      <mesh position={[0, -hy, 0]}>
        <boxGeometry args={[hx * 2, 0.1, hz * 2]} />
        <meshStandardMaterial color={caseColor} {...METAL} />
      </mesh>
      <mesh position={[0, hy, 0]}>
        <boxGeometry args={[hx * 2, 0.1, hz * 2]} />
        <meshStandardMaterial color={caseColor} transparent opacity={0.5} {...METAL} />
      </mesh>
      <mesh position={[hx, 0, 0]}>
        <boxGeometry args={[0.05, hy * 2, hz * 2]} />
        <meshPhysicalMaterial color="#4a90c0" transparent opacity={0.12} roughness={0.1} metalness={0} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={accent} />
      </lineSegments>

      <PowerLed powered={powered} />

      {Array.from({ length: fanCount }).map((_, i) => (
        <Fan
          key={i}
          position={[0.2, hy - 1.1 - i * 1.15, hz - 0.15]}
          radius={0.5}
          rgb={rgb}
          facing="z"
          speed={5}
          powered={powered}
          rgbColor={rgbColor}
        />
      ))}
    </group>
  )
}

function Motherboard() {
  return (
    <group position={[-1.35, 0.1, -0.1]}>
      <mesh>
        <boxGeometry args={[0.12, 5, 5]} />
        <meshStandardMaterial color={PCB_COLOR} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0.08, -1.2, 0.6]}>
        <boxGeometry args={[0.05, 1, 1]} />
        <meshStandardMaterial color="#123a30" />
      </mesh>
    </group>
  )
}

function Cpu() {
  return (
    <mesh position={[-1.1, 1.3, 0.4]}>
      <boxGeometry args={[0.12, 0.9, 0.9]} />
      <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.25} />
    </mesh>
  )
}

function AirCooler({ powered }: { powered: boolean }) {
  return (
    <group position={[-0.55, 1.3, 0.4]}>
      <mesh>
        <boxGeometry args={[1.0, 1.7, 1.2]} />
        <meshStandardMaterial color="#8a94a6" {...METAL} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, -0.8 + i * 0.2, 0]}>
          <boxGeometry args={[1.02, 0.05, 1.22]} />
          <meshStandardMaterial color="#aab4c4" {...METAL} />
        </mesh>
      ))}
      <Fan position={[0.55, 0, 0]} radius={0.55} facing="x" speed={7} powered={powered} />
    </group>
  )
}

function AioCooler({ rgb, powered, rgbColor }: { rgb: boolean; powered: boolean; rgbColor: string }) {
  const solid = rgbColor === 'rainbow' ? '#22d3ee' : rgbColor
  return (
    <group>
      <mesh position={[-1.05, 1.3, 0.4]}>
        <boxGeometry args={[0.3, 0.7, 0.7]} />
        <meshStandardMaterial color="#20272f" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.89, 1.3, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.18, 0.28, 24]} />
        <meshStandardMaterial
          color={solid}
          emissive={solid}
          emissiveIntensity={powered ? 1 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[2.6, 0.35, 1.0]} />
        <meshStandardMaterial color="#3a4658" {...METAL} />
      </mesh>
      <Fan position={[-0.7, 2.9, 0]} radius={0.45} facing="y" rgb={rgb} speed={6} powered={powered} rgbColor={rgbColor} />
      <Fan position={[0.7, 2.9, 0]} radius={0.45} facing="y" rgb={rgb} speed={6} powered={powered} rgbColor={rgbColor} />
    </group>
  )
}

function RamSticks({ count }: { count: number }) {
  const n = Math.min(4, Math.max(2, count))
  return (
    <group position={[-0.95, 1.4, -0.9]}>
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 0.28]}>
          <boxGeometry args={[0.5, 1.5, 0.1]} />
          <meshStandardMaterial color="#b0273a" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Gpu({ accent, lengthUnits, powered }: { accent: string; lengthUnits: number; powered: boolean }) {
  return (
    <group position={[-0.5, -0.6, 0.2]}>
      <mesh>
        <boxGeometry args={[1.9, 0.55, lengthUnits]} />
        <meshStandardMaterial color="#171d28" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.7, 0.06, lengthUnits * 0.9]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={powered ? 0.6 : 0.1} />
      </mesh>
      <Fan position={[0, 0.32, lengthUnits * 0.22]} radius={0.45} facing="y" speed={8} powered={powered} />
      <Fan position={[0, 0.32, -lengthUnits * 0.22]} radius={0.45} facing="y" speed={8} powered={powered} />
    </group>
  )
}

function Psu() {
  return (
    <mesh position={[-0.5, -2.7, -1.6]}>
      <boxGeometry args={[1.7, 1.2, 1.8]} />
      <meshStandardMaterial color="#0e131c" {...METAL} />
    </mesh>
  )
}

function Storage() {
  return (
    <mesh position={[-1.15, -1.6, 1.6]}>
      <boxGeometry args={[0.15, 0.7, 1.1]} />
      <meshStandardMaterial color="#1f6feb" metalness={0.5} roughness={0.4} />
    </mesh>
  )
}

function Monitor({ sizeInches, powered }: { sizeInches: number; powered: boolean }) {
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const scale = 1 + (sizeInches - 24) / 45
  const w = 6.6 * scale
  const h = (w * 9) / 16
  const groundY = -3.5

  useFrame((state) => {
    if (!screenMat.current) return
    if (powered) {
      const flicker = 0.9 + Math.sin(state.clock.elapsedTime * 8) * 0.03
      screenMat.current.emissiveIntensity = flicker
    } else {
      screenMat.current.emissiveIntensity = 0
    }
  })

  const neckHeight = 1.5
  const screenBottom = groundY + neckHeight + 0.1
  const screenCenterY = screenBottom + h / 2

  return (
    <group position={[7.4, 0, 0.5]} rotation={[0, -0.6, 0]}>
      {/* Stand base + neck */}
      <mesh position={[0, groundY + 0.05, 0]}>
        <cylinderGeometry args={[w * 0.2, w * 0.24, 0.12, 24]} />
        <meshStandardMaterial color="#0e131c" {...METAL} />
      </mesh>
      <mesh position={[0, groundY + neckHeight / 2, 0]}>
        <boxGeometry args={[0.28, neckHeight, 0.28]} />
        <meshStandardMaterial color="#1b2433" {...METAL} />
      </mesh>
      {/* Bezel */}
      <mesh position={[0, screenCenterY, 0]}>
        <boxGeometry args={[w + 0.18, h + 0.18, 0.16]} />
        <meshStandardMaterial color="#0b0f17" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, screenCenterY, 0.09]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={screenMat}
          color={powered ? '#0a1830' : '#05070c'}
          emissive="#1e66ff"
          emissiveIntensity={0}
        />
      </mesh>
      {/* Desktop content when powered */}
      {powered && (
        <group position={[0, screenCenterY, 0.11]}>
          {/* wallpaper glow band */}
          <mesh position={[0, h * 0.08, 0]}>
            <planeGeometry args={[w * 0.98, h * 0.5]} />
            <meshStandardMaterial color="#0b3a6b" emissive="#22d3ee" emissiveIntensity={0.5} transparent opacity={0.6} />
          </mesh>
          {/* centered logo block */}
          <mesh position={[0, h * 0.05, 0.01]}>
            <planeGeometry args={[w * 0.34, h * 0.14]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.1} />
          </mesh>
          {/* taskbar */}
          <mesh position={[0, -h / 2 + h * 0.06, 0]}>
            <planeGeometry args={[w * 0.98, h * 0.1]} />
            <meshStandardMaterial color="#0a1220" emissive="#0a1220" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}
      {powered && <pointLight position={[0, screenCenterY, 1.2]} intensity={12} color="#3b82f6" distance={6} />}
    </group>
  )
}

function Scene({ build, powered, rgbColor }: { build: Build; powered: boolean; rgbColor: string }) {
  const coolerType = build.cooler ? String(build.cooler.specs.type) : null
  const ramCount = build.ram ? Number(build.ram.specs.modules) || 2 : 0
  const gpuLen = build.gpu ? Math.min(2.9, 2 + Number(build.gpu.specs.length) / 260) : 2.4
  const gpuAccent =
    build.gpu?.brand === 'NVIDIA' ? '#76B900' : build.gpu?.brand === 'AMD' ? '#ED1C24' : '#22d3ee'
  const rgb = Boolean(build.fans?.specs.rgb)

  return (
    <group rotation={[0, -0.5, 0]}>
      <PcCase build={build} powered={powered} rgbColor={rgbColor} />
      {build.motherboard && <Motherboard />}
      {build.cpu && <Cpu />}
      {build.cooler && coolerType === 'air' && <AirCooler powered={powered} />}
      {build.cooler && coolerType === 'aio' && <AioCooler rgb={rgb} powered={powered} rgbColor={rgbColor} />}
      {build.ram && <RamSticks count={ramCount} />}
      {build.gpu && <Gpu accent={gpuAccent} lengthUnits={gpuLen} powered={powered} />}
      {build.psu && <Psu />}
      {build.storage && <Storage />}
      {build.monitor && <Monitor sizeInches={Number(build.monitor.specs.size) || 27} powered={powered} />}
    </group>
  )
}

export default function Build3DScene({ build, powered, rgbColor }: Build3DSceneProps) {
  return (
    <Canvas camera={{ position: [11, 4, 11], fov: 42 }} dpr={[1, 2]} shadows>
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
      <ContactShadows position={[0, -3.6, 0]} opacity={0.6} scale={20} blur={2.5} far={5} />
      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={24}
        autoRotate
        autoRotateSpeed={0.8}
        target={[1.5, 0, 0]}
      />
    </Canvas>
  )
}
