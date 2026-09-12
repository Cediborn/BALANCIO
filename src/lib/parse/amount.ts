export interface AmountResult {
  minor: number
  matched: string
  explicit: boolean
}

const SYMBOL_PATTERNS: RegExp[] = [
  /(?:GH₵|GH¢|₵|¢|GH)\s*(\d+(?:[.,]\d{1,2})?)/g,
  /\bGHS\s*(\d+(?:[.,]\d{1,2})?)\b/gi,
]

const WORDS_PATTERN = /(\d+(?:[.,]\d{1,2})?)\s*(?:cedis?|cedi|pesewas?)\b/gi

const K_PATTERN = /\b(\d+(?:[.,]\d{1,2})?)\s*k\b/gi

const NUMBER_PATTERN = /\b(\d+(?:[.,]\d{1,2})?)\b/g

const MONEY_MARKERS = /\b(spent|spend|paid|pay|bought|buy|got|gave|give|sent|send|received|receive|cost|worth|for|on|about|around|approx|approximately|was|goes for|needed)\b/i
const TIME_PATTERN = /\b\d{1,2}:\d{2}\b/g
const DATE_PATTERN = /\b(?:\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?)\b/gi

function cleanNumberToken(token: string): number {
  return Number(token.replace(/,/g, ''))
}

export function extractAmount(text: string): AmountResult | null {
  for (const re of SYMBOL_PATTERNS) {
    re.lastIndex = 0
    const m = re.exec(text)
    if (m && m[1]) {
      const minor = Math.round(cleanNumberToken(m[1]) * 100)
      return { minor, matched: m[0].trim(), explicit: true }
    }
  }

  WORDS_PATTERN.lastIndex = 0
  const wordMatch = WORDS_PATTERN.exec(text)
  if (wordMatch && wordMatch[1]) {
    const minor = Math.round(cleanNumberToken(wordMatch[1]) * 100)
    return { minor, matched: wordMatch[0], explicit: true }
  }

  K_PATTERN.lastIndex = 0
  const kMatch = K_PATTERN.exec(text)
  if (kMatch && kMatch[1]) {
    const minor = Math.round(cleanNumberToken(kMatch[1]) * 1000 * 100)
    return { minor, matched: kMatch[0], explicit: true }
  }

  let scan = text
    .replace(TIME_PATTERN, ' ')
    .replace(DATE_PATTERN, ' ')
    .replace(/[₵¢]/g, ' ')
    .replace(/\bGHS\b/gi, ' ')

  const candidates: { value: number; index: number; marked: boolean }[] = []
  NUMBER_PATTERN.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = NUMBER_PATTERN.exec(scan)) !== null) {
    if (!m[1]) continue
    const value = cleanNumberToken(m[1])
    if (value >= 0 && value <= 1_000_000) {
      const before = scan.slice(Math.max(0, m.index - 40), m.index)
      candidates.push({
        value,
        index: m.index,
        marked: MONEY_MARKERS.test(before),
      })
    }
  }

  if (candidates.length === 0) return null

  const marked = candidates.filter((c) => c.marked)
  const best = marked[0] ?? candidates[0]!

  const minor = Math.round(best.value * 100)
  return { minor, matched: String(best.value), explicit: false }
}

export function stripAmountFromText(text: string, matched: string): string {
  let out = text
    .replace(new RegExp(`(?:GH₵|GH¢|₵|¢|GH|GHS)?\\s*${matched.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?:cedis?|cedi)?`, 'i'), ' ')
    .replace(/\bGHS\b/gi, ' ')
  return out
}