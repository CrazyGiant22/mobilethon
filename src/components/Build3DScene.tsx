import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { Build } from '../types'

interface Build3DSceneProps {
  build: Build
}

const PCB_COLOR = '#0c2a22'
const METAL = { metalness: 0.6, roughness: 0.35 }

function Fan({
  position,
  radius = 0.55,
  rgb = false,
  speed = 6,
  facing = 'x',
}: {
  position: [number, number, number]
  radius?: number
  rgb?: boolean
  speed?: number
  facing?: 'x' | 'z' | 'y'
}) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.z += delta * speed
    if (rgb && mat.current) {
      const hue = (state.clock.elapsedTime * 0.15) % 1
      mat.current.color.setHSL(hue, 0.9, 0.55)
      mat.current.emissive.setHSL(hue, 0.9, 0.35)
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
          emissive={rgb ? '#22d3ee' : '#000000'}
          emissiveIntensity={rgb ? 0.6 : 0}
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

function PcCase({ build }: { build: Build }) {
  const caseColor = '#141c2b'
  const accent = build.fans?.specs.rgb ? '#22d3ee' : '#3a4658'
  const hx = 1.5
  const hy = 3.4
  const hz = 3.4

  // Case wireframe edges (open side panel toward +X viewer)
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2)), [])
  const fanCount = build.fans ? Math.min(3, Number(build.fans.specs.count)) : 0
  const fanRgb = Boolean(build.fans?.specs.rgb)

  return (
    <group>
      {/* Back + bottom + top + far panels (semi-transparent) */}
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
      {/* Glass side panel (far side) */}
      <mesh position={[hx, 0, 0]}>
        <boxGeometry args={[0.05, hy * 2, hz * 2]} />
        <meshPhysicalMaterial color="#4a90c0" transparent opacity={0.12} roughness={0.1} metalness={0} />
      </mesh>
      {/* Accent edge glow */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={accent} />
      </lineSegments>

      {/* Front intake fans */}
      {Array.from({ length: fanCount }).map((_, i) => (
        <Fan
          key={i}
          position={[0.2, hy - 1.1 - i * 1.15, hz - 0.15]}
          radius={0.5}
          rgb={fanRgb}
          facing="z"
          speed={5}
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
      {/* Chipset + traces hint */}
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

function AirCooler() {
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
      <Fan position={[0.55, 0, 0]} radius={0.55} facing="x" speed={7} />
    </group>
  )
}

function AioCooler({ rgb }: { rgb: boolean }) {
  return (
    <group>
      {/* Pump block on CPU */}
      <mesh position={[-1.05, 1.3, 0.4]}>
        <boxGeometry args={[0.3, 0.7, 0.7]} />
        <meshStandardMaterial color="#20272f" metalness={0.7} roughness={0.3} />
      </mesh>
      {rgb && (
        <mesh position={[-0.89, 1.3, 0.4]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.18, 0.28, 24]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Top radiator */}
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[2.6, 0.35, 1.0]} />
        <meshStandardMaterial color="#3a4658" {...METAL} />
      </mesh>
      <Fan position={[-0.7, 2.9, 0]} radius={0.45} facing="y" rgb={rgb} speed={6} />
      <Fan position={[0.7, 2.9, 0]} radius={0.45} facing="y" rgb={rgb} speed={6} />
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

function Gpu({ accent, lengthUnits }: { accent: string; lengthUnits: number }) {
  return (
    <group position={[-0.5, -0.6, 0.2]}>
      <mesh>
        <boxGeometry args={[1.9, 0.55, lengthUnits]} />
        <meshStandardMaterial color="#171d28" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Shroud accent */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.7, 0.06, lengthUnits * 0.9]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
      </mesh>
      {/* GPU fans (face up toward viewer) */}
      <Fan position={[0, 0.32, lengthUnits * 0.22]} radius={0.45} facing="y" speed={8} />
      <Fan position={[0, 0.32, -lengthUnits * 0.22]} radius={0.45} facing="y" speed={8} />
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

function Scene({ build }: { build: Build }) {
  const coolerType = build.cooler ? String(build.cooler.specs.type) : null
  const ramCount = build.ram ? Number(build.ram.specs.modules) || 2 : 0
  const gpuLen = build.gpu ? Math.min(2.9, 2 + Number(build.gpu.specs.length) / 260) : 2.4
  const gpuAccent =
    build.gpu?.brand === 'NVIDIA' ? '#76B900' : build.gpu?.brand === 'AMD' ? '#ED1C24' : '#22d3ee'

  return (
    <group rotation={[0, -0.5, 0]}>
      <PcCase build={build} />
      {build.motherboard && <Motherboard />}
      {build.cpu && <Cpu />}
      {build.cooler && coolerType === 'air' && <AirCooler />}
      {build.cooler && coolerType === 'aio' && <AioCooler rgb={Boolean(build.fans?.specs.rgb)} />}
      {build.ram && <RamSticks count={ramCount} />}
      {build.gpu && <Gpu accent={gpuAccent} lengthUnits={gpuLen} />}
      {build.psu && <Psu />}
      {build.storage && <Storage />}
    </group>
  )
}

export default function Build3DScene({ build }: Build3DSceneProps) {
  return (
    <Canvas camera={{ position: [7, 3.5, 7], fov: 42 }} dpr={[1, 2]} shadows>
      <color attach="background" args={['#0a0e17']} />
      <fog attach="fog" args={['#0a0e17', 14, 26]} />

      {/* Base fill */}
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#8fb7ff', '#1a1030', 0.9]} />

      {/* Key + fill directional lights */}
      <directionalLight position={[6, 9, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.9} color="#bcd3ff" />

      {/* Top spotlight highlighting the interior */}
      <spotLight position={[0, 10, 2]} angle={0.6} penumbra={0.6} intensity={120} color="#ffffff" castShadow />

      {/* Colored accent lights for depth and glow */}
      <pointLight position={[-4, 2, 5]} intensity={70} color="#22d3ee" distance={18} />
      <pointLight position={[5, 3, -3]} intensity={55} color="#a78bfa" distance={18} />
      <pointLight position={[4, -2, 4]} intensity={35} color="#38bdf8" distance={16} />
      <pointLight position={[-3, -3, -3]} intensity={25} color="#fb7185" distance={14} />

      {/* Rim light from behind for edge separation */}
      <spotLight position={[-2, 4, -8]} angle={0.8} penumbra={1} intensity={90} color="#22d3ee" />

      <Scene build={build} />
      <ContactShadows position={[0, -3.6, 0]} opacity={0.6} scale={16} blur={2.5} far={5} />
      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={16}
        autoRotate
        autoRotateSpeed={0.8}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}
