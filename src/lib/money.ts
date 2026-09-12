export function toMinor(amount: number): number {
  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * 100)
}

export function minorToNumber(minor: number): number {
  return minor / 100
}

export function formatMoney(minor: number): string {
  return `GH₵${(minor / 100).toFixed(2)}`
}

export function formatMoneyCompact(minor: number): string {
  return minor % 100 === 0
    ? `GH₵${Math.trunc(minor / 100)}`
    : formatMoney(minor)
}

export function formatMoneyPlain(minor: number): string {
  return (minor / 100).toFixed(2)
}

const SYMBOL_RE = /[₵¢]/g

export function parseAmountToMinor(input: string): number | null {
  if (typeof input !== 'string') return null
  let cleaned = input.trim().toLowerCase()
  if (!cleaned) return null
  cleaned = cleaned
    .replace(SYMBOL_RE, ' ')
    .replace(/\bghs\b/g, ' ')
    .replace(/\bgh¢\b/g, ' ')
    .replace(/\bg[h]?\b(?!\w)/g, ' ')
    .replace(/cedi(?:s)?/g, ' ')
    .replace(/pesewa(?:s)?/g, ' ')
    .replace(/,/g, '')
    .trim()
  const match = cleaned.match(/^(\d+)(?:\.(\d{1,2}))?$/)
  if (!match) return null
  const whole = Number(match[1])
  const fracPart = (match[2] ?? '').padEnd(2, '0')
  const frac = fracPart ? Number(fracPart) : 0
  return whole * 100 + frac
}

export function addMinor(a: number, b: number): number {
  return a + b
}

export function subtractMinor(a: number, b: number): number {
  return a - b
}

export function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.min(100, Math.round((part / whole) * 100))
}

export function ghsSymbol(): string {
  return 'GH₵'
}