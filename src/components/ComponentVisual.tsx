import type { ComponentCategory, PCComponent } from '../types'

export const BRAND_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  AMD: { primary: '#ED1C24', secondary: '#1a1a1a', glow: 'rgba(237,28,36,0.35)' },
  Intel: { primary: '#0071C5', secondary: '#00AEEF', glow: 'rgba(0,113,197,0.35)' },
  NVIDIA: { primary: '#76B900', secondary: '#1a1a1a', glow: 'rgba(118,185,0,0.35)' },
  MSI: { primary: '#FF0000', secondary: '#1a1a1a', glow: 'rgba(255,0,0,0.3)' },
  ASUS: { primary: '#000000', secondary: '#B8860B', glow: 'rgba(184,134,11,0.3)' },
  Corsair: { primary: '#FEBE10', secondary: '#1a1a1a', glow: 'rgba(254,190,16,0.3)' },
  Gigabyte: { primary: '#F47920', secondary: '#1a1a1a', glow: 'rgba(244,121,32,0.3)' },
  Samsung: { primary: '#1428A0', secondary: '#1a1a1a', glow: 'rgba(20,40,160,0.3)' },
  Noctua: { primary: '#8B6914', secondary: '#4a3520', glow: 'rgba(139,105,20,0.3)' },
  'G.Skill': { primary: '#FF0040', secondary: '#1a1a1a', glow: 'rgba(255,0,64,0.3)' },
  NZXT: { primary: '#7B2D8E', secondary: '#1a1a1a', glow: 'rgba(123,45,142,0.3)' },
  default: { primary: '#22d3ee', secondary: '#1a2332', glow: 'rgba(34,211,238,0.3)' },
}

export function getBrandColors(brand: string) {
  return BRAND_COLORS[brand] ?? BRAND_COLORS.default
}

interface ComponentVisualProps {
  component?: PCComponent
  category?: ComponentCategory
  brand?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ComponentVisual({ component, category, brand, size = 'md', className = '' }: ComponentVisualProps) {
  const cat = component?.category ?? category ?? 'cpu'
  const colors = getBrandColors(component?.brand ?? brand ?? '')
  const dims = { sm: 48, md: 72, lg: 120 }[size]

  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden border border-white/5 ${className}`}
      style={{
        width: dims,
        height: dims,
        background: `linear-gradient(145deg, ${colors.secondary} 0%, #0a0e17 100%)`,
        boxShadow: `0 0 20px ${colors.glow}`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
        <CategoryArt category={cat} primary={colors.primary} secondary={colors.secondary} componentId={component?.id} />
      </svg>
      {size !== 'sm' && component && (
        <div
          className="absolute bottom-0 inset-x-0 px-1 py-0.5 text-center truncate"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
        >
          <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
            {component.brand}
          </span>
        </div>
      )}
    </div>
  )
}

function CategoryArt({
  category,
  primary,
  secondary,
  componentId,
}: {
  category: ComponentCategory
  primary: string
  secondary: string
  componentId?: string
}) {
  switch (category) {
    case 'cpu': return <CpuArt primary={primary} secondary={secondary} />
    case 'gpu': return <GpuArt primary={primary} secondary={secondary} />
    case 'motherboard': return <MotherboardArt primary={primary} secondary={secondary} isMsiB365={componentId === 'mb-b365m-pro-vdh'} />
    case 'ram': return <RamArt primary={primary} />
    case 'storage': return <StorageArt primary={primary} />
    case 'psu': return <PsuArt primary={primary} />
    case 'cooler': return <CoolerArt primary={primary} isAio={componentId?.includes('aio') ?? false} />
    case 'case': return <CaseArt primary={primary} />
    default: return null
  }
}

function CpuArt({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <g>
      <rect x="22" y="22" width="56" height="56" rx="4" fill={secondary} stroke={primary} strokeWidth="2" />
      <rect x="30" y="30" width="40" height="40" rx="2" fill="#1a2332" stroke={primary} strokeWidth="1" opacity="0.8" />
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <circle key={`${i}-${j}`} cx={34 + i * 8} cy={34 + j * 8} r="1.2" fill={primary} opacity="0.6" />
        )),
      )}
      <text x="50" y="54" textAnchor="middle" fill={primary} fontSize="8" fontWeight="bold" fontFamily="monospace">CPU</text>
    </g>
  )
}

function GpuArt({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <g>
      <rect x="10" y="35" width="80" height="30" rx="3" fill={secondary} stroke={primary} strokeWidth="1.5" />
      <rect x="14" y="38" width="22" height="24" rx="10" fill="#1a2332" stroke={primary} strokeWidth="1" />
      <rect x="40" y="38" width="22" height="24" rx="10" fill="#1a2332" stroke={primary} strokeWidth="1" />
      <rect x="66" y="38" width="22" height="24" rx="10" fill="#1a2332" stroke={primary} strokeWidth="1" />
      {[18, 44, 70].map((cx) => (
        <circle key={cx} cx={cx} cy="50" r="7" fill="none" stroke={primary} strokeWidth="1" opacity="0.5" />
      ))}
      <rect x="10" y="62" width="12" height="6" rx="1" fill={primary} opacity="0.7" />
    </g>
  )
}

function MotherboardArt({ primary, secondary, isMsiB365 }: { primary: string; secondary: string; isMsiB365?: boolean }) {
  return (
    <g>
      <rect x="12" y="18" width="76" height="64" rx="2" fill={isMsiB365 ? '#1a1a1a' : secondary} stroke={primary} strokeWidth="1.5" />
      <rect x="18" y="24" width="28" height="28" rx="2" fill="#2a3040" stroke={primary} strokeWidth="1" />
      <text x="32" y="42" textAnchor="middle" fill={primary} fontSize="6" fontFamily="monospace">CPU</text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={52 + i * 10} y="26" width="6" height="22" rx="1" fill={primary} opacity={0.5 + i * 0.1} />
      ))}
      <rect x="18" y="58" width="50" height="4" rx="1" fill={primary} opacity="0.4" />
      <rect x="18" y="66" width="35" height="4" rx="1" fill={primary} opacity="0.3" />
      {isMsiB365 && (
        <>
          <rect x="72" y="22" width="12" height="4" fill="#FF0000" />
          <text x="78" y="74" textAnchor="middle" fill="#FF0000" fontSize="7" fontWeight="bold" fontFamily="sans-serif">MSI</text>
          <text x="50" y="12" textAnchor="middle" fill="#888" fontSize="5" fontFamily="monospace">B365M PRO-VDH</text>
        </>
      )}
    </g>
  )
}

function RamArt({ primary }: { primary: string }) {
  return (
    <g>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={22 + i * 28} y="20" width="18" height="60" rx="2" fill="#1a2332" stroke={primary} strokeWidth="1.5" />
          {Array.from({ length: 6 }).map((_, j) => (
            <rect key={j} x={24 + i * 28} y={24 + j * 9} width="14" height="5" rx="0.5" fill={primary} opacity={0.3 + j * 0.05} />
          ))}
        </g>
      ))}
    </g>
  )
}

function StorageArt({ primary }: { primary: string }) {
  return (
    <g>
      <rect x="20" y="38" width="60" height="24" rx="2" fill="#1a2332" stroke={primary} strokeWidth="1.5" />
      <rect x="24" y="42" width="20" height="16" rx="1" fill={primary} opacity="0.3" />
      <text x="58" y="52" fill={primary} fontSize="7" fontFamily="monospace" fontWeight="bold">NVMe</text>
    </g>
  )
}

function PsuArt({ primary }: { primary: string }) {
  return (
    <g>
      <rect x="18" y="25" width="64" height="50" rx="3" fill="#1a2332" stroke={primary} strokeWidth="1.5" />
      <circle cx="50" cy="45" r="14" fill="none" stroke={primary} strokeWidth="1.5" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <line
            key={i}
            x1={50 + Math.cos(angle) * 6}
            y1={45 + Math.sin(angle) * 6}
            x2={50 + Math.cos(angle) * 13}
            y2={45 + Math.sin(angle) * 13}
            stroke={primary}
            strokeWidth="1"
            opacity="0.5"
          />
        )
      })}
      <rect x="24" y="62" width="8" height="4" rx="1" fill={primary} opacity="0.6" />
      <rect x="36" y="62" width="8" height="4" rx="1" fill={primary} opacity="0.5" />
      <rect x="48" y="62" width="8" height="4" rx="1" fill={primary} opacity="0.4" />
    </g>
  )
}

function CoolerArt({ primary, isAio }: { primary: string; isAio: boolean }) {
  if (isAio) {
    return (
      <g>
        <rect x="15" y="30" width="70" height="40" rx="3" fill="#1a2332" stroke={primary} strokeWidth="1.5" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={20 + i * 5.5} y1="32" x2={20 + i * 5.5} y2="68" stroke={primary} strokeWidth="0.8" opacity="0.4" />
        ))}
        <circle cx="50" cy="18" r="10" fill="#1a2332" stroke={primary} strokeWidth="1.5" />
      </g>
    )
  }
  return (
    <g>
      <rect x="38" y="15" width="24" height="55" rx="2" fill="#1a2332" stroke={primary} strokeWidth="1.5" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1="40" y1={18 + i * 6.5} x2="60" y2={18 + i * 6.5} stroke={primary} strokeWidth="0.8" opacity="0.4" />
      ))}
      <rect x="30" y="68" width="40" height="8" rx="1" fill={primary} opacity="0.5" />
      <circle cx="50" cy="10" r="6" fill="none" stroke={primary} strokeWidth="1" />
    </g>
  )
}

function CaseArt({ primary }: { primary: string }) {
  return (
    <g>
      <rect x="25" y="12" width="50" height="76" rx="3" fill="#1a2332" stroke={primary} strokeWidth="1.5" />
      <rect x="30" y="18" width="40" height="30" rx="1" fill="none" stroke={primary} strokeWidth="1" opacity="0.4" />
      <circle cx="38" cy="58" r="8" fill="none" stroke={primary} strokeWidth="1" opacity="0.5" />
      <circle cx="62" cy="58" r="8" fill="none" stroke={primary} strokeWidth="1" opacity="0.5" />
      <rect x="42" y="75" width="16" height="4" rx="1" fill={primary} opacity="0.3" />
    </g>
  )
}
