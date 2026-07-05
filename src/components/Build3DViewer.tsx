import { Suspense, lazy, useState, useRef, Component, type ReactNode } from 'react'
import type { Build } from '../types'
import { BUILD_CATEGORIES } from '../types'

const Build3DScene = lazy(() => import('./Build3DScene'))

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
          <p className="text-sm text-slate-400">
            3D preview couldn’t load on this device (WebGL may be unavailable). The rest of BuildForge works fine.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

interface Build3DViewerProps {
  build: Build
}

const RGB_SWATCHES: { label: string; value: string }[] = [
  { label: 'Rainbow', value: 'rainbow' },
  { label: 'Cyan', value: '#22d3ee' },
  { label: 'Violet', value: '#a78bfa' },
  { label: 'Green', value: '#34d399' },
  { label: 'Red', value: '#fb3b5c' },
  { label: 'Amber', value: '#fbbf24' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Pink', value: '#ec4899' },
]

export function Build3DViewer({ build }: Build3DViewerProps) {
  const [active, setActive] = useState(false)
  const [powered, setPowered] = useState(false)
  const [rgbColor, setRgbColor] = useState('rainbow')
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const partCount = BUILD_CATEGORIES.filter((c) => build[c]).length
  const canRender = Boolean(build.motherboard || build.case || build.cpu || build.gpu)
  const hasRgb = Boolean(build.fans?.specs.rgb)

  const takeScreenshot = () => {
    const canvas = canvasWrapRef.current?.querySelector('canvas')
    if (!canvas) return
    try {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'buildforge-3d.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      /* toDataURL can fail if the context was lost */
    }
  }

  return (
    <div className="tech-card rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-600/50 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            3D Build Preview
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-violet/15 text-accent-violet border border-accent-violet/25">
              Interactive
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {canRender ? `Assembled view of ${partCount} installed part${partCount === 1 ? '' : 's'}` : 'Add core parts to preview'}
          </p>
        </div>
        {active && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPowered((p) => !p)}
              aria-pressed={powered}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 min-h-9 rounded-lg border font-medium transition-all ${
                powered
                  ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30 shadow-[0_0_18px_-4px_rgba(52,211,153,0.6)]'
                  : 'bg-surface-700 text-slate-300 border-surface-600/50 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
              </svg>
              {powered ? 'Power off' : 'Power on'}
            </button>
            <button
              onClick={takeScreenshot}
              title="Save a PNG of the current view"
              aria-label="Screenshot"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-surface-700 text-slate-300 border border-surface-600/50 hover:text-accent-cyan transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setActive(false)}
              className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white active:bg-surface-700 transition-colors"
            >
              Hide
            </button>
          </div>
        )}
      </div>

      {active ? (
        <>
          <div ref={canvasWrapRef} className="relative h-[340px] sm:h-[420px] w-full">
            <SceneErrorBoundary>
              <Suspense fallback={<Loader />}>
                <Build3DScene build={build} powered={powered} rgbColor={rgbColor} />
              </Suspense>
            </SceneErrorBoundary>
            <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-slate-500 pointer-events-none">
              Drag to rotate · scroll to zoom{powered ? '' : ' · press Power on to boot'}
            </p>
          </div>
          <div className="px-5 py-3 border-t border-surface-600/50 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-400 uppercase tracking-wider">RGB</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {RGB_SWATCHES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setRgbColor(s.value)}
                  title={s.label}
                  aria-label={s.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    rgbColor === s.value ? 'border-white scale-110' : 'border-surface-600'
                  }`}
                  style={{
                    background:
                      s.value === 'rainbow'
                        ? 'conic-gradient(from 0deg, #ff0000, #ffa500, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                        : s.value,
                  }}
                />
              ))}
              <label className="w-6 h-6 rounded-full border-2 border-surface-600 overflow-hidden relative cursor-pointer" title="Custom color">
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-300 pointer-events-none">+</span>
                <input
                  type="color"
                  onChange={(e) => setRgbColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
            {!hasRgb && (
              <span className="text-[11px] text-slate-500">Add RGB fans to light up the fans too</span>
            )}
          </div>
        </>
      ) : (
        <div className="p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5V16.5M21 7.5L12 12M21 7.5L12 3L3 7.5M3 7.5V16.5L12 21M3 7.5L12 12M12 21V12" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            Render an interactive 3D model of your assembled PC — case, motherboard, GPU, cooler, RAM, and spinning fans.
          </p>
          <button
            onClick={() => setActive(true)}
            disabled={!canRender}
            className="px-5 py-2.5 min-h-11 rounded-xl text-sm font-semibold bg-accent-violet/15 text-accent-violet border border-accent-violet/30 hover:bg-accent-violet/25 active:bg-accent-violet/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            View 3D model
          </button>
        </div>
      )}
    </div>
  )
}

function Loader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-900">
      <div className="w-8 h-8 border-2 border-surface-600 border-t-accent-violet rounded-full animate-spin" />
      <p className="text-xs text-slate-500">Loading 3D engine…</p>
    </div>
  )
}
