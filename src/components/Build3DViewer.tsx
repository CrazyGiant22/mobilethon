import { Suspense, lazy, useState } from 'react'
import type { Build } from '../types'
import { BUILD_CATEGORIES } from '../types'

const Build3DScene = lazy(() => import('./Build3DScene'))

interface Build3DViewerProps {
  build: Build
}

export function Build3DViewer({ build }: Build3DViewerProps) {
  const [active, setActive] = useState(false)
  const partCount = BUILD_CATEGORIES.filter((c) => build[c]).length
  const canRender = Boolean(build.motherboard || build.case || build.cpu || build.gpu)

  return (
    <div className="rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
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
          <button
            onClick={() => setActive(false)}
            className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white active:bg-surface-700 transition-colors shrink-0"
          >
            Hide
          </button>
        )}
      </div>

      {active ? (
        <div className="relative h-[340px] sm:h-[420px] w-full">
          <Suspense fallback={<Loader />}>
            <Build3DScene build={build} />
          </Suspense>
          <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-slate-500 pointer-events-none">
            Drag to rotate · scroll to zoom
          </p>
        </div>
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
