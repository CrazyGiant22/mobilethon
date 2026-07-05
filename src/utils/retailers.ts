import type { PCComponent } from '../types'

export interface Retailer {
  id: string
  name: string
  search: (query: string) => string
}

export const RETAILERS: Retailer[] = [
  { id: 'newegg', name: 'Newegg', search: (q) => `https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}` },
  { id: 'amazon', name: 'Amazon', search: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}` },
  { id: 'bestbuy', name: 'Best Buy', search: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}` },
  { id: 'pcpp', name: 'PCPartPicker', search: (q) => `https://pcpartpicker.com/search/?q=${encodeURIComponent(q)}` },
]

export function buyUrl(component: PCComponent, retailerId = 'newegg'): string {
  const r = RETAILERS.find((x) => x.id === retailerId) ?? RETAILERS[0]
  return r.search(component.name)
}
