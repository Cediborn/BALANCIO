import type { Transaction } from './types'
import { addDays, compareDates, daysBetween, endOfWeek, isWithinRange, startOfWeek, todayISO } from './date'

export interface RangeStats {
  incomeMinor: number
  expenseMinor: number
  savedMinor: number
  count: number
  byCategory: Map<string, number>
  byCategoryExpense: Map<string, number>
}

export function inRange(tx: Transaction, startISO: string, endISO: string): boolean {
  return isWithinRange(tx.date, startISO, endISO)
}

export function filterInRange(txs: Transaction[], startISO: string, endISO: string): Transaction[] {
  return txs.filter((tx) => isWithinRange(tx.date, startISO, endISO))
}

export function rangeStats(txs: Transaction[], startISO: string, endISO: string): RangeStats {
  let income = 0
  let expense = 0
  let saved = 0
  let count = 0
  const byCategory = new Map<string, number>()
  const byCategoryExpense = new Map<string, number>()

  for (const tx of txs) {
    if (!isWithinRange(tx.date, startISO, endISO)) continue
    count++
    if (tx.type === 'income') {
      income += tx.amountMinor
      byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) ?? 0) + tx.amountMinor)
    } else if (tx.type === 'savings') {
      saved += tx.amountMinor
    } else {
      expense += tx.amountMinor
      byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) ?? 0) + tx.amountMinor)
      byCategoryExpense.set(tx.categoryId, (byCategoryExpense.get(tx.categoryId) ?? 0) + tx.amountMinor)
    }
  }

  return {
    incomeMinor: income,
    expenseMinor: expense,
    savedMinor: saved,
    count,
    byCategory,
    byCategoryExpense,
  }
}

export function currentWindow(weekStartDay: 0 | 1 = 1): { start: string; end: string } {
  const today = todayISO()
  const start = startOfWeek(today, weekStartDay)
  return { start, end: today }
}

export function previousWindow(weekStartDay: 0 | 1 = 1): { start: string; end: string } {
  const today = todayISO()
  const end = addDays(startOfWeek(today, weekStartDay), -1)
  const start = addDays(end, -6)
  return { start, end }
}

export function fullCurrentWeek(weekStartDay: 0 | 1 = 1): { start: string; end: string } {
  const today = todayISO()
  const start = startOfWeek(today, weekStartDay)
  return { start, end: endOfWeek(today, weekStartDay) }
}

export interface WeekComparison {
  current: RangeStats
  previous: RangeStats
  spentChangeMinor: number
  spentChangePercent: number
  incomeChangeMinor: number
  savedChangeMinor: number
}

export function compareWeeks(txs: Transaction[], weekStartDay: 0 | 1 = 1): WeekComparison {
  const today = todayISO()
  const cwStart = startOfWeek(today, weekStartDay)
  const elapsedDays = daysBetween(cwStart, today)
  const prevStart = addDays(cwStart, -7)
  const prevEnd = addDays(prevStart, elapsedDays)
  return compareWindows(txs, cwStart, today, prevStart, prevEnd)
}

export function compareWindows(
  txs: Transaction[],
  curStart: string,
  curEnd: string,
  prevStart: string,
  prevEnd: string,
): WeekComparison {
  const current = rangeStats(txs, curStart, curEnd)
  const previous = rangeStats(txs, prevStart, prevEnd)

  const spentChangeMinor = current.expenseMinor - previous.expenseMinor
  const spentChangePercent =
    previous.expenseMinor > 0 ? Math.round((spentChangeMinor / previous.expenseMinor) * 100) : 0

  return {
    current,
    previous,
    spentChangeMinor,
    spentChangePercent,
    incomeChangeMinor: current.incomeMinor - previous.incomeMinor,
    savedChangeMinor: current.savedMinor - previous.savedMinor,
  }
}

export function spentByCategory(txs: Transaction[], startISO: string, endISO: string): { categoryId: string; minor: number; count: number }[] {
  const map = new Map<string, { minor: number; count: number }>()
  for (const tx of txs) {
    if (tx.type !== 'expense') continue
    if (!isWithinRange(tx.date, startISO, endISO)) continue
    const agg = map.get(tx.categoryId) ?? { minor: 0, count: 0 }
    agg.minor += tx.amountMinor
    agg.count += 1
    map.set(tx.categoryId, agg)
  }
  return [...map.entries()]
    .map(([categoryId, v]) => ({ categoryId, minor: v.minor, count: v.count }))
    .sort((a, b) => b.minor - a.minor)
}

export function smallPurchaseStats(
  txs: Transaction[],
  startISO: string,
  endISO: string,
  thresholdMinor: number,
): { count: number; totalMinor: number; purchases: Transaction[] } {
  const purchases = txs.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.amountMinor > 0 &&
      tx.amountMinor <= thresholdMinor &&
      isWithinRange(tx.date, startISO, endISO),
  )
  return {
    count: purchases.length,
    totalMinor: purchases.reduce((sum, tx) => sum + tx.amountMinor, 0),
    purchases,
  }
}

export function biggestSpendingDay(
  txs: Transaction[],
  startISO: string,
  endISO: string,
): { date: string; minor: number; count: number } | null {
  const map = new Map<string, { minor: number; count: number }>()
  for (const tx of txs) {
    if (tx.type !== 'expense') continue
    if (!isWithinRange(tx.date, startISO, endISO)) continue
    const agg = map.get(tx.date) ?? { minor: 0, count: 0 }
    agg.minor += tx.amountMinor
    agg.count += 1
    map.set(tx.date, agg)
  }
  let best: { date: string; minor: number; count: number } | null = null
  for (const [date, agg] of map) {
    if (!best || agg.minor > best.minor) {
      best = { date, minor: agg.minor, count: agg.count }
    }
  }
  return best
}

export function largestTransactions(txs: Transaction[], startISO: string, endISO: string, n = 5): Transaction[] {
  return txs
    .filter((tx) => tx.type === 'expense' && isWithinRange(tx.date, startISO, endISO))
    .sort((a, b) => b.amountMinor - a.amountMinor)
    .slice(0, n)
}

export function balanceFor(
  startingBalanceMinor: number,
  txs: Transaction[],
): number {
  let balance = startingBalanceMinor
  for (const tx of txs) {
    if (tx.type === 'income') balance += tx.amountMinor
    else balance -= tx.amountMinor
  }
  return balance
}

export function netForRange(txs: Transaction[], startISO: string, endISO: string): number {
  const s = rangeStats(txs, startISO, endISO)
  return s.incomeMinor - s.expenseMinor
}

export function weekSeries(
  txs: Transaction[],
  weeks = 6,
  weekStartDay: 0 | 1 = 1,
): { weekStart: string; spentMinor: number; incomeMinor: number }[] {
  const today = todayISO()
  const out: { weekStart: string; spentMinor: number; incomeMinor: number }[] = []
  const thisWeek = startOfWeek(today, weekStartDay)
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -7 * i)
    const end = i === 0 ? today : endOfWeek(start, weekStartDay)
    const s = rangeStats(txs, start, end)
    out.push({ weekStart: start, spentMinor: s.expenseMinor, incomeMinor: s.incomeMinor })
  }
  return out
}

export function monthlySeries(txs: Transaction[], months = 6): { monthKey: string; spentMinor: number; incomeMinor: number }[] {
  const out: { monthKey: string; spentMinor: number; incomeMinor: number }[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    const end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    const s = rangeStats(txs, start, end)
    out.push({ monthKey: start.slice(0, 7), spentMinor: s.expenseMinor, incomeMinor: s.incomeMinor })
  }
  return out
}

export function sortedTransactions(txs: Transaction[]): Transaction[] {
  return [...txs].sort((a, b) => {
    const c = compareDates(b.date, a.date)
    if (c !== 0) return c
    return b.createdAt - a.createdAt
  })
}

export { compareDates }