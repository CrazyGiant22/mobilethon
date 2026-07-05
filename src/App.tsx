import { useState, useMemo, useCallback } from 'react'
import type { Build, ComponentCategory, PCComponent, AppView } from './types'
import { getComponentById } from './data/components'
import { analyzeBuild } from './utils/analyze'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { BuildPanel } from './components/BuildPanel'
import { AnalysisPanel } from './components/AnalysisPanel'
import { ComponentPicker } from './components/ComponentPicker'
import { PresetBuilds } from './components/PresetBuilds'
import { SavedBuilds } from './components/SavedBuilds'
import { ComparePanel } from './components/ComparePanel'
import { BuildVisualizer } from './components/BuildVisualizer'

const EMPTY_BUILD: Build = {}

export default function App() {
  const [view, setView] = useState<AppView>('builder')
  const [build, setBuild] = useState<Build>(EMPTY_BUILD)
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | null>(null)

  const analysis = useMemo(() => analyzeBuild(build), [build])

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
    setView('builder')
  }, [])

  const clearBuild = useCallback(() => {
    setBuild(EMPTY_BUILD)
  }, [])

  const useInBuild = useCallback((component: PCComponent) => {
    setBuild((prev) => ({ ...prev, [component.category]: component }))
    setView('builder')
  }, [])

  return (
    <div className="min-h-screen grid-bg">
      <Header view={view} onViewChange={setView} />
      <main>
        <Hero completeness={analysis.completeness} totalCost={analysis.totalCost} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {view === 'builder' ? (
            <>
              <PresetBuilds onLoad={loadPreset} />
              <div className="mt-6">
                <BuildVisualizer build={build} />
              </div>
              <div className="mt-8 grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  <BuildPanel
                    build={build}
                    onSlotClick={setActiveCategory}
                    onClear={clearBuild}
                  />
                  <SavedBuilds currentBuild={build} onLoad={loadPreset} />
                </div>
                <div className="xl:col-span-3">
                  <AnalysisPanel analysis={analysis} build={build} />
                </div>
              </div>
            </>
          ) : (
            <ComparePanel onUseInBuild={useInBuild} />
          )}
        </div>
      </main>
      {activeCategory && (
        <ComponentPicker
          category={activeCategory}
          selectedId={build[activeCategory]?.id}
          onSelect={(id) => handleSelect(activeCategory, id)}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  )
}
