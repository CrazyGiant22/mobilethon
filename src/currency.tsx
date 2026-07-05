import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type CurrencyCode = 'USD' | 'ZMW'

interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  label: string
  rate: number // units per 1 USD
}

// Rates are approximate; catalog prices are stored in USD.
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 },
  ZMW: { code: 'ZMW', symbol: 'K', label: 'Zambian Kwacha', rate: 26.5 },
}

const STORAGE_KEY = 'buildforge-currency'

export function convertFromUsd(usd: number, code: CurrencyCode): number {
  return usd * CURRENCIES[code].rate
}

export function formatCurrency(usd: number, code: CurrencyCode): string {
  const value = Math.round(convertFromUsd(usd, code))
  return `${CURRENCIES[code].symbol}${value.toLocaleString()}`
}

interface CurrencyContextValue {
  code: CurrencyCode
  setCode: (code: CurrencyCode) => void
  format: (usd: number) => string
  isApprox: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function loadCode(): CurrencyCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'USD' || saved === 'ZMW') return saved
  } catch {
    /* ignore */
  }
  return 'USD'
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<CurrencyCode>(loadCode)

  const setCode = useCallback((c: CurrencyCode) => {
    setCodeState(c)
    try {
      localStorage.setItem(STORAGE_KEY, c)
    } catch {
      /* ignore */
    }
  }, [])

  const format = useCallback((usd: number) => formatCurrency(usd, code), [code])

  return (
    <CurrencyContext.Provider value={{ code, setCode, format, isApprox: code !== 'USD' }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    // Fallback for components rendered outside the provider (defensive).
    return {
      code: 'USD',
      setCode: () => {},
      format: (usd: number) => formatCurrency(usd, 'USD'),
      isApprox: false,
    }
  }
  return ctx
}

export function CurrencySelector({ className = '' }: { className?: string }) {
  const { code, setCode } = useCurrency()
  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">Currency</span>
      <select
        value={code}
        onChange={(e) => setCode(e.target.value as CurrencyCode)}
        aria-label="Currency"
        className="text-sm px-2.5 py-2 min-h-10 rounded-lg bg-surface-800 border border-surface-600/50 text-slate-300 hover:text-white focus:outline-none focus:border-accent-cyan/50 cursor-pointer"
      >
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
          <option key={c} value={c}>
            {CURRENCIES[c].symbol} {c}
          </option>
        ))}
      </select>
    </label>
  )
}
