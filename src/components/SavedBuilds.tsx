import { useState, useEffect, useCallback } from 'react'
import type { Build } from '../types'
import { CATEGORY_ORDER } from '../types'
import {
  getSavedBuilds,
  saveBuild,
  deleteSavedBuild,
  deserializeBuild,
  type SavedBuild,
} from '../utils/storage'

interface SavedBuildsProps {
  currentBuild: Build
  onLoad: (build: Build) => void
}

export function SavedBuilds({ currentBuild, onLoad }: SavedBuildsProps) {
  const [saved, setSaved] = useState<SavedBuild[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [buildName, setBuildName] = useState('')

  const refresh = useCallback(() => setSaved(getSavedBuilds()), [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const hasParts = CATEGORY_ORDER.some((cat) => currentBuild[cat])

  const handleSave = () => {
    if (!buildName.trim() || !hasParts) return
    saveBuild(buildName.trim(), currentBuild)
    setBuildName('')
    setShowSaveDialog(false)
    refresh()
  }

  const handleDelete = (id: string) => {
    deleteSavedBuild(id)
    refresh()
  }

  const handleLoad = (entry: SavedBuild) => {
    onLoad(deserializeBuild(entry.componentIds))
  }

  return (
    <div className="rounded-2xl bg-surface-800 border border-surface-600/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-600/50 flex items-center justify-between">
        <h3 className="font-semibold text-white">Saved Builds</h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!hasParts}
          className="text-sm px-4 py-2 min-h-10 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 active:bg-accent-cyan/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save current
        </button>
      </div>

      {showSaveDialog && (
        <div className="px-5 py-4 border-b border-surface-600/50 bg-surface-700/30">
          <input
            type="text"
            placeholder="Build name (e.g. My 1440p Rig)"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className="w-full px-3 py-2.5 min-h-11 rounded-lg bg-surface-700 border border-surface-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan/50 text-base sm:text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={!buildName.trim()}
              className="text-sm px-4 py-2 min-h-10 rounded-lg bg-accent-cyan text-surface-900 font-medium hover:bg-accent-blue active:bg-accent-blue transition-colors disabled:opacity-40"
            >
              Save
            </button>
            <button
              onClick={() => { setShowSaveDialog(false); setBuildName('') }}
              className="text-sm px-4 py-2 min-h-10 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {saved.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No saved builds yet. Configure a build and hit Save.
          </p>
        ) : (
          saved.map((entry) => {
            const partCount = Object.keys(entry.componentIds).length
            const date = new Date(entry.savedAt).toLocaleDateString()
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/40 border border-surface-600/30 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{entry.name}</p>
                  <p className="text-xs text-slate-400">{partCount} parts · {date}</p>
                </div>
                <button
                  onClick={() => handleLoad(entry)}
                  className="text-sm px-3 py-2 min-h-10 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 active:bg-accent-cyan/25 transition-colors shrink-0"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-500 hover:text-accent-rose active:bg-surface-600 transition-colors shrink-0"
                  aria-label={`Delete ${entry.name}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
