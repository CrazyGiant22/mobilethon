import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Build, ComponentCategory, PCComponent, AppView, UseCase } from './types'
import { getComponentById } from './data/components'
import { analyzeBuild } from './utils/analyze'
import {
  buildFromUrl,
  loadSessionBuild,
  saveSessionBuild,
  syncBuildUrl,
} from './utils/buildState'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { BuildPanel } from './components/BuildPanel'
import { AnalysisPanel } from './components/AnalysisPanel'
import { ComponentPicker } from './components/ComponentPicker'
import { PresetBuilds } from './components/PresetBuilds'
import { SavedBuilds } from './components/SavedBuilds'
import { ComparePanel } from './components/ComparePanel'
import { BuildVisualizer } from './components/BuildVisualizer'
import { UseCaseSelector } from './components/UseCaseSelector'
import { BuildToolbar } from './components/BuildToolbar'
import { FpsEstimator } from './components/FpsEstimator'
import { Build3DViewer } from './components/Build3DViewer'
import { MobileBuildBar } from './components/MobileBuildBar'

const EMPTY_BUILD: Build = {}

function viewFromHash(): AppView {
  return window.location.hash === '#compare' ? 'compare' : 'builder'
}

function loadInitialBuild(): Build {
  return buildFromUrl() ?? loadSessionBuild() ?? EMPTY_BUILD
}

export default function App() {
  const [view, setView] = useState<AppView>(viewFromHash)
  const [build, setBuild] = useState<Build>(loadInitialBuild)
  const [useCase, setUseCase] = useState<UseCase>('1440p')
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | null>(null)

  const analysis = useMemo(() => analyzeBuild(build, useCase), [build, useCase])

  useEffect(() => {
    saveSessionBuild(build)
    syncBuildUrl(build)
  }, [build])

  useEffect(() => {
    const onHash = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const changeView = useCallback((next: AppView) => {
    setView(next)
    window.location.hash = next === 'compare' ? '#compare' : '#builder'
  }, [])

  const handleSelect = useCallback((category: ComponentCategory, componentId: string | null) => {
    setBuild((prev) => {
      const next = { ...prev }
      if (componentId === null) {
        delete next[category]
      } else {
        const comp = getComponentById(componentId)
        if (comp) next[category] = comp
      }
      return next
    })
    setActiveCategory(null)
  }, [])

  const loadPreset = useCallback((preset: Build) => {
    setBuild(preset)
    changeView('builder')
  }, [changeView])

  const clearBuild = useCallback(() => {
    const hasParts = Object.values(build).some(Boolean)
    if (hasParts && !window.confirm('Clear all components from your build?')) return
    setBuild(EMPTY_BUILD)
  }, [build])

  const useInBuild = useCallback((component: PCComponent) => {
    setBuild((prev) => ({ ...prev, [component.category]: component }))
    changeView('builder')
  }, [changeView])

  const scrollToAnalysis = () => {
    document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen grid-bg">
      <a href="#builder" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-accent-cyan focus:text-surface-900 focus:rounded-lg">
        Skip to content
      </a>
      <Header view={view} onViewChange={changeView} />
      <main className="pb-24 xl:pb-20">
        {view === 'builder' && (
          <Hero
            completeness={analysis.completeness}
            coreCompleteness={analysis.coreCompleteness}
            totalCost={analysis.totalCost}
            errorCount={analysis.errorCount}
          />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {view === 'builder' ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <PresetBuilds
                  onLoad={loadPreset}
                  hasExistingBuild={Object.values(build).some(Boolean)}
                />
                <div className="shrink-0 sm:pt-6">
                  <BuildToolbar build={build} analysis={analysis} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2 space-y-4">
                  <BuildVisualizer build={build} />
                  <Build3DViewer build={build} />
                </div>
                <UseCaseSelector value={useCase} onChange={setUseCase} />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  <BuildPanel
                    build={build}
                    onSlotClick={setActiveCategory}
                    onClear={clearBuild}
                  />
                  <SavedBuilds currentBuild={build} onLoad={loadPreset} />
                </div>
                <div className="xl:col-span-3 space-y-4">
                  <AnalysisPanel
                    analysis={analysis}
                    build={build}
                    onFixCategory={setActiveCategory}
                  />
                  <FpsEstimator build={build} useCase={useCase} />
                </div>
              </div>
            </>
          ) : (
            <ComparePanel onUseInBuild={useInBuild} />
          )}
        </div>
      </main>
      {view === 'builder' && (
        <MobileBuildBar analysis={analysis} onScrollToAnalysis={scrollToAnalysis} />
      )}
      {activeCategory && (
        <ComponentPicker
          build={build}
          category={activeCategory}
          selectedId={build[activeCategory]?.id}
          onSelect={(id) => handleSelect(activeCategory, id)}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  )
}
