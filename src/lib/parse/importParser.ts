import type { ParsedTransaction } from '../types'
import { extractAmount } from './amount'
import { findCategory, findBrand } from './keywords'
import { todayISO, nowTime } from '../date'

export interface ImportParseResult {
  parsed: ParsedTransaction | null
  error?: string
}

const SENT_RE = /\b(sent|sent to|transferred|paid|purchase|payment|debit|withdrawn|bought)\b/i
const RECEIVED_RE = /\b(received|credited|deposited|added to|top[- ]up|payment received|incoming|from)\b/i

const DATE_IN_TEXT =
  /(?:(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:[-\/](\d{1,2}))?)/i

function detectDirection(text: string): 'income' | 'expense' | null {
  const hasSent = SENT_RE.test(text)
  const hasReceived = RECEIVED_RE.test(text)
  if (hasSent && !hasReceived) return 'expense'
  if (hasReceived && !hasSent) return 'income'
  if (/sent\s+.*\bto\b/i.test(text)) return 'expense'
  if (/to\s+mtn|to\s+telecel|to\s+person|to\s+.*\bmomo\b/i.test(text)) return 'expense'
  return null
}

function extractRecipient(text: string): string | null {
  const toMatch = /(?:to|to:)\s+([A-Za-z0-9_ .-]{3,60})/i.exec(text)
  if (toMatch && toMatch[1]) {
    return toMatch[1].trim().replace(/[.\s]+$/, '')
  }
  const fromMatch = /(?:from|from:)\s+([A-Za-z0-9_ .-]{3,60})/i.exec(text)
  if (fromMatch && fromMatch[1]) {
    return fromMatch[1].trim().replace(/[.\s]+$/, '')
  }
  return null
}

function extractRealDate(text: string): string | null {
  const m = DATE_IN_TEXT.exec(text)
  if (!m) return null
  if (m[1] && m[2]) {
    const dd = Number(m[1])
    const mm = Number(m[2])
    if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
      const yy = m[3] ? Number(m[3]) : new Date().getFullYear()
      return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
    }
  }
  return null
}

export function parseImportedTransaction(raw: string): ImportParseResult {
  if (!raw || !raw.trim()) {
    return { parsed: null, error: 'Paste a transaction message to begin.' }
  }

  const amount = extractAmount(raw.replace(/\b(ghs|gh)\b/gi, ' GHS '))
  if (!amount) {
    return {
      parsed: null,
      error: 'I couldn’t find an amount in that message. You can still log it manually.',
    }
  }

  const direction = detectDirection(raw) ?? 'expense'
  const recipient = extractRecipient(raw)
  const category = findCategory(raw)
  const brand = findBrand(raw)
  const date = extractRealDate(raw) ?? todayISO()

  const categoryId =
    direction === 'expense'
      ? category ?? 'other'
      : category === 'allowance' || category === 'family'
        ? 'allowance'
        : category && ['allowance', 'salary', 'sidehustle', 'business', 'gift', 'refund', 'otherother'].includes(category)
          ? category
          : 'otherother'

  const confidence: 'high' | 'medium' | 'low' =
    amount.explicit && direction !== null && date !== 'today'
      ? 'high'
      : amount.explicit
        ? 'medium'
        : 'low'

  return {
    parsed: {
      type: direction,
      amountMinor: amount.minor,
      categoryId,
      description: '',
      merchant: brand ?? recipient ?? undefined,
      date,
      time: nowTime(),
      confidence,
      source: 'import',
    },
  }
}