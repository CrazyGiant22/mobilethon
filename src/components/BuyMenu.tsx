import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { PCComponent } from '../types'
import { RETAILERS } from '../utils/retailers'

interface BuyMenuProps {
  component: PCComponent
}

const MENU_WIDTH = 190

export function BuyMenu({ component }: BuyMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const place = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect()
    if (!r) return
    const left = Math.max(8, Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8))
    setPos({ top: r.bottom + 6, left })
  }, [])

  useEffect(() => {
    if (!open) return
    place()
    const close = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const reposition = () => setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, place])

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Find ${component.name} at a retailer`}
        className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-surface-600/50 text-slate-300 hover:text-accent-cyan hover:bg-surface-600 transition-colors"
      >
        Buy
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH }}
            className="z-50 rounded-xl bg-surface-800 border border-surface-600/60 shadow-2xl overflow-hidden animate-fade-in"
          >
            <p className="px-3 py-2 text-[11px] text-slate-500 border-b border-surface-600/50 truncate">
              Buy {component.name}
            </p>
            {RETAILERS.map((r) => (
              <a
                key={r.id}
                href={r.search(component.name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center justify-between px-3 py-2.5 text-sm text-slate-300 hover:bg-surface-700 hover:text-accent-cyan transition-colors"
              >
                {r.name}
                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
