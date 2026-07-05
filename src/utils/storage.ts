import type { Build, ComponentCategory } from '../types'
import { CATEGORY_ORDER } from '../types'
import { getComponentById } from '../data/components'

const STORAGE_KEY = 'buildforge-saved-builds'

export interface SavedBuild {
  id: string
  name: string
  componentIds: Partial<Record<ComponentCategory, string>>
  savedAt: string
}

export function serializeBuild(build: Build): Partial<Record<ComponentCategory, string>> {
  const ids: Partial<Record<ComponentCategory, string>> = {}
  for (const cat of CATEGORY_ORDER) {
    if (build[cat]) ids[cat] = build[cat]!.id
  }
  return ids
}

export function deserializeBuild(componentIds: Partial<Record<ComponentCategory, string>>): Build {
  const build: Build = {}
  for (const [cat, id] of Object.entries(componentIds)) {
    const comp = getComponentById(id)
    if (comp) build[cat as ComponentCategory] = comp
  }
  return build
}

export function getSavedBuilds(): SavedBuild[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedBuild[]
  } catch {
    return []
  }
}

export function saveBuild(name: string, build: Build): SavedBuild {
  const saved: SavedBuild = {
    id: crypto.randomUUID(),
    name,
    componentIds: serializeBuild(build),
    savedAt: new Date().toISOString(),
  }
  const existing = getSavedBuilds()
  existing.unshift(saved)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 20)))
  return saved
}

export function deleteSavedBuild(id: string): void {
  const filtered = getSavedBuilds().filter((b) => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function renameSavedBuild(id: string, name: string): void {
  const builds = getSavedBuilds().map((b) => (b.id === id ? { ...b, name } : b))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds))
}
