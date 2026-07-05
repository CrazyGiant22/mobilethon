import { useState } from 'react'
import type { Build, BuildAnalysis } from '../types'
import { getShareUrl } from '../utils/buildState'
import { buildToText, downloadBuild } from '../utils/export'

interface BuildToolbarProps {
  build: Build
  analysis: BuildAnalysis
}

export function BuildToolbar({ build, analysis }: BuildToolbarProps) {
  const [copied, setCopied] = useState<'link' | 'text' | null>(null)
  const hasParts = Object.values(build).some(Boolean)

  if (!hasParts) return null

  const copy = async (mode: 'link' | 'text') => {
    const value = mode === 'link' ? getShareUrl(build) : buildToText(build, analysis)
    try {
      await navigator.clipboard.writeText(value)
      setCopied(mode)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      window.prompt('Copy manually:', value)
    }
  }

  const btn =
    'inline-flex items-center gap-2 px-3 py-2 min-h-10 rounded-lg text-sm font-medium bg-surface-800 border border-surface-600/50 text-slate-300 hover:text-accent-cyan hover:border-accent-cyan/30 active:bg-surface-700 transition-all'

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => copy('link')} className={btn}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {copied === 'link' ? 'Link copied!' : 'Share'}
      </button>
      <button onClick={() => copy('text')} className={btn}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {copied === 'text' ? 'Copied!' : 'Copy list'}
      </button>
      <button onClick={() => downloadBuild(build, analysis)} className={btn}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export .txt
      </button>
    </div>
  )
}
