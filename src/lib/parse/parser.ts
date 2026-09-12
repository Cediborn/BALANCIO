import type { ParsedTransaction } from '../types'
import { extractAmount, stripAmountFromText } from './amount'
import { findCategory, findBrand, findPerson, STOPWORDS, PEOPLE, BRAND_MERCHANTS } from './keywords'
import { addDays, todayISO, nowTime } from '../date'

interface ParseResult {
  parsed: ParsedTransaction | null
  error?: string
  note?: string
}

export type { ParseResult }

const INCOME_VERBS = /\b(got|get|receiv\w*|sent me|transferr\w* me|paid me|lent me|gave me|face?d me|credited|credited me|topped up my|allowance|salary|wages|refund\w*)\b/i

function detectType(text: string): 'income' | 'expense' | 'savings' {
  const lower = text.toLowerCase()

  if (/\b(save|saving|savings|set aside|put away|fixed deposit|into my savings|to savings)\b/.test(lower)) {
    return 'savings'
  }

  const person = findPerson(lower)
  const fromPerson = person !== null && /\bfrom\b/.test(lower) && !/\b(spent|paid|bought|buy)\b/.test(lower)

  if (fromPerson) return 'income'

  if (INCOME_VERBS.test(lower)) return 'income'

  const hasIncomeWord =
    /\b(allowance|salary|wages|refund|gift|birthday money|side hustle|hustle|gig|business profit|sales)\b/.test(lower)

  if (hasIncomeWord && !/\b(spent|paid for|bought)\b/.test(lower)) return 'income'

  const spentOn = /\b(spent|spend|paid|pay|bought|buy|cost|gave for|sent)\b/.test(lower)
  if (spentOn) return 'expense'

  return 'expense'
}

function categoryForType(categoryId: string | null, type: 'income' | 'expense' | 'savings'): string {
  if (type === 'savings') return 'savings'
  if (categoryId) return categoryId
  if (type === 'income') return 'allowance'
  return 'other'
}

function categoryForIncomeSignal(text: string, categoryId: string | null): string {
  if (categoryId && categoryId !== 'family') return categoryId
  const lower = text.toLowerCase()
  if (/\b(allowance|pocket money|from\b.*\b(mum|mom|mother|mummy|dad|father|family|parents))\b/.test(lower)) {
    return 'allowance'
  }
  return 'allowance'
}

const MERCHANT_TOKEN_SET = new Set([
  ...PEOPLE.map((p) => p.toLowerCase()),
  ...BRAND_MERCHANTS.map((b) => b.toLowerCase()),
])

function buildDescription(cleanTokens: string[], detectedCategory: string | null): string {
  void detectedCategory
  const words = cleanTokens.filter((w) => w && !STOPWORDS.has(w) && !MERCHANT_TOKEN_SET.has(w))
  const kept = words.join(' ').trim()
  return kept
}

function probeDescription(raw: string, matched: string): string {
  const stripped = stripAmountFromText(raw, matched)
  const tokens = stripped.split(/\s+/).filter(Boolean)
  return buildDescription(tokens, null)
}

export function parseExpenseText(raw: string): ParseResult {
  if (!raw || !raw.trim()) {
    return { parsed: null, error: 'Enter something like “15 waakye” or “20 for food”.' }
  }

  let lower = raw.trim()

  let matchedAmount = extractAmount(lower)
  if (!matchedAmount) {
    let probe = probeDescription(lower, '')
    probe = probe.replace(/\b(spent|spend|paid|pay|bought|buy|on|for)\b/gi, ' ').trim()
    return {
      parsed: null,
      error: 'I couldn’t find an amount. Try something like “15 waakye”.',
    }
  }

  const type = detectType(lower)

  if (type === 'savings') {
    const desc = probeDescription(lower, '')
    return {
      parsed: {
        type: 'savings',
        amountMinor: matchedAmount.minor,
        categoryId: 'savings',
        description: desc || 'Savings',
        merchant: undefined,
        date: todayISO(),
        time: nowTime(),
        confidence: 'high',
        source: 'natural',
      },
    }
  }

  const seen: string[] = []
  const seenRaw: string[] = []
  let m: RegExpExecArray | null
  const amountRegex = /\d+(?:[.,]\d{1,2})?\s*(?:cedis?|cedi)?|\bGHS\b|GH₵|GH¢|₵|¢/gi
  while ((m = amountRegex.exec(lower)) !== null) {
    seen.push(m[0])
    seenRaw.push(m[0])
  }

  let clean = stripAmountFromText(lower, matchedAmount.matched)
  clean = clean.replace(/\b(from|i|i'm|i am|im|me|my|the|a|an|is|was|were)\b/gi, ' ')

  const category = findCategory(clean)
  const brand = findBrand(clean)
  const person = findPerson(clean)

  let finalCategory: string
  if (type === 'income') {
    finalCategory = categoryForIncomeSignal(clean, category)
  } else {
    finalCategory = categoryForType(category, type)
  }

  const desc = buildDescription(clean.split(/\s+/), category)

  const explicit = matchedAmount.explicit || seen.length === 1
  const confidence: 'high' | 'medium' | 'low' =
    explicit && category !== null
      ? 'high'
      : explicit
        ? 'medium'
        : 'low'

  return {
    parsed: {
      type,
      amountMinor: matchedAmount.minor,
      categoryId: finalCategory,
      description: desc,
      merchant: brand ?? (type === 'income' ? person ?? undefined : undefined),
      date: todayISO(),
      time: nowTime(),
      confidence,
      source: 'natural',
    },
  }
}

export function parseQuickAmount(amountMinor: number): ParsedTransaction {
  return {
    type: 'expense',
    amountMinor,
    categoryId: 'other',
    description: '',
    date: todayISO(),
    time: nowTime(),
    confidence: 'high',
    source: 'manual',
  }
}

export function parsePlainExpense(amountMinor: number): ParsedTransaction {
  return parseQuickAmount(amountMinor)
}

export function detectDate(text: string): string | null {
  const lower = text.toLowerCase()
  if (/\byesterday\b/.test(lower)) return addDays(todayISO(), -1)
  if (/\btoday\b/.test(lower)) return todayISO()
  const monthDay = lower.match(/(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t)?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?/)
  if (monthDay) return null
  return null
}