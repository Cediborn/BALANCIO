import type { Insight, SavingsGoal, Transaction } from './types'
import { addDays, dayName, startOfWeek, todayISO } from './date'
import { formatMoney } from './money'
import { compareWindows, largestTransactions, rangeStats, smallPurchaseStats, biggestSpendingDay } from './analytics'

export interface InsightContext {
  transactions: Transaction[]
  goals: SavingsGoal[]
  weekStartDay: 0 | 1
  smallThresholdMinor: number
  startingBalanceMinor: number
}

interface InsightRule {
  id: string
  minTransactions: number
  weight: number
  run: (ctx: InsightContext) => Insight | null
}

function fmt(m: number): string {
  return formatMoney(m)
}

const categoryName = (id: string): string => {
  const map: Record<string, string> = {
    food: 'Food', transport: 'Transport', data: 'Data & Airtime', school: 'School',
    housing: 'Housing', personal: 'Personal Care', entertainment: 'Entertainment',
    shopping: 'Shopping', family: 'Family & Giving', health: 'Health', other: 'Other',
  }
  return map[id] ?? id
}

function describeChange(fromWeek: number, toWeek: number): number | null {
  if (fromWeek <= 0) return null
  const diff = toWeek - fromWeek
  const pct = Math.round((diff / fromWeek) * 100)
  return pct
}

function buildRules(): InsightRule[] {
  return [
    {
      id: 'spending_change',
      minTransactions: 0,
      weight: 90,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const cur = rangeStats(ctx.transactions, cs, today)
        const pStart = addDays(cs, -7)
        const pEnd = addDays(cs, -1)
        const prev = rangeStats(ctx.transactions, pStart, pEnd)
        const diff = cur.expenseMinor - prev.expenseMinor
        const prevPct = describeChange(prev.expenseMinor, cur.expenseMinor)
        if (prev.expenseMinor === 0 && cur.expenseMinor === 0) return null
        if (prev.count === 0 || cur.count === 0) return null
        if (Math.abs(diff) < 100) return null
        const dir = diff > 0 ? 'up' : 'down'
        const tone = dir === 'up' ? 'warning' : 'positive'
        const title = dir === 'up'
          ? `Spending is up this week`
          : `Spending is down this week`
        const body =
          prevPct !== null && Math.abs(prevPct) >= 10
            ? `You've spent ${fmt(Math.abs(diff))} ${dir} so far this week (${prevPct > 0 ? '+' : ''}${prevPct}%) compared with the same days last week.`
            : `You've spent ${fmt(Math.abs(diff))} ${dir} so far this week compared with the same days last week.`
        return { id: 'spending_change', kind: 'spending_change', tone, title, body }
      },
    },
    {
      id: 'top_category',
      minTransactions: 0,
      weight: 80,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const cur = rangeStats(ctx.transactions, cs, today)
        if (cur.expenseMinor <= 0) return null
        let topId = ''
        let topMinor = 0
        for (const [id, minor] of cur.byCategoryExpense) {
          if (minor > topMinor) {
            topId = id
            topMinor = minor
          }
        }
        if (!topId || topMinor <= 0) return null
        const share = Math.round((topMinor / cur.expenseMinor) * 100)
        const pStart = addDays(cs, -7)
        const pEnd = addDays(cs, -1)
        const prev = rangeStats(ctx.transactions, pStart, pEnd)
        const prevTop = prev.byCategoryExpense.get(topId) ?? 0
        const pct = describeChange(prevTop, topMinor)
        const body =
          prevTop > 0 && pct !== null && Math.abs(pct) >= 15
            ? `${categoryName(topId)} is your biggest spend so far this week at ${fmt(topMinor)} (${share}% of spending), ${pct > 0 ? 'up' : 'down'} ${Math.abs(pct)}% from last week.`
            : `${categoryName(topId)} is your biggest spend so far this week at ${fmt(topMinor)} (${share}% of spending).`
        return { id: 'top_category', kind: 'top_category', tone: 'info', title: 'Where most money went', body }
      },
    },
    {
      id: 'small_purchases',
      minTransactions: 0,
      weight: 85,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const sp = smallPurchaseStats(ctx.transactions, cs, today, ctx.smallThresholdMinor)
        if (sp.count < 5) return null
        const total = fmt(sp.totalMinor)
        return {
          id: 'small_purchases',
          kind: 'small_purchases',
          tone: 'warning',
          title: 'Small purchases are adding up',
          body: `${sp.count} purchases under ${fmt(ctx.smallThresholdMinor)} added up to ${total} this week. Each one was small, but together they matter.`,
        }
      },
    },
    {
      id: 'biggest_day',
      minTransactions: 0,
      weight: 70,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const day = biggestSpendingDay(ctx.transactions, cs, today)
        if (!day || day.minor <= 0) return null
        const total = fmt(day.minor)
        return {
          id: 'biggest_day',
          kind: 'biggest_day',
          tone: 'info',
          title: 'Your biggest spending day',
          body: `${dayName(day.date)} was your biggest spending day so far this week (${total} across ${day.count} purchase${day.count === 1 ? '' : 's'}).`,
        }
      },
    },
    {
      id: 'unusually_large',
      minTransactions: 0,
      weight: 65,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const cur = rangeStats(ctx.transactions, cs, today)
        const large = largestTransactions(ctx.transactions, cs, today, 1)[0]
        if (!large || cur.expenseMinor <= 0) return null
        const share = Math.round((large.amountMinor / cur.expenseMinor) * 100)
        if (large.amountMinor < 5000 || share < 30) return null
        const label = large.description || large.merchant || categoryName(large.categoryId)
        return {
          id: 'unusually_large',
          kind: 'unusually_large',
          tone: 'warning',
          title: 'One purchase stands out',
          body: `${fmt(large.amountMinor)} on “${label}” was ${share}% of everything you spent this week. Worth checking if it was necessary.`,
        }
      },
    },
    {
      id: 'income_received',
      minTransactions: 0,
      weight: 60,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const cur = rangeStats(ctx.transactions, cs, today)
        if (cur.incomeMinor <= 0) return null
        return {
          id: 'income_received',
          kind: 'income_received',
          tone: 'positive',
          title: 'Money in this week',
          body: `You received ${fmt(cur.incomeMinor)} so far this week. That's your runway for everything else.`,
        }
      },
    },
    {
      id: 'savings_progress',
      minTransactions: 0,
      weight: 55,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const cur = rangeStats(ctx.transactions, cs, today)
        const active = ctx.goals.filter((g) => g.targetMinor > 0 && g.currentMinor >= 0)
        if (cur.savedMinor <= 0 && active.length === 0) return null
        const parts: string[] = []
        if (cur.savedMinor > 0) {
          parts.push(`You saved ${fmt(cur.savedMinor)} this week.`)
        }
        const nearest = [...active].sort(
          (a, b) => (b.currentMinor / b.targetMinor) - (a.currentMinor / a.targetMinor),
        )[0]
        if (nearest) {
          const remaining = nearest.targetMinor - nearest.currentMinor
          const pct = Math.round((nearest.currentMinor / nearest.targetMinor) * 100)
          if (remaining > 0) {
            parts.push(
              `“${nearest.name}” is ${pct}% funded — ${fmt(Math.max(0, remaining))} to go.`,
            )
          } else {
            parts.push(`“${nearest.name}” is fully funded.`)
          }
        }
        if (parts.length === 0) return null
        return {
          id: 'savings_progress',
          kind: 'savings_progress',
          tone: 'positive',
          title: 'Savings progress',
          body: parts.join(' '),
        }
      },
    },
    {
      id: 'weekly_review',
      minTransactions: 0,
      weight: 50,
      run: (ctx) => {
        const today = todayISO()
        const cs = startOfWeek(today, ctx.weekStartDay)
        const cur = rangeStats(ctx.transactions, cs, today)
        if (cur.count > 0 && cur.expenseMinor > 0) {
          return {
            id: 'weekly_review',
            kind: 'weekly_review',
            tone: 'info',
            title: 'Can explain your week',
            body: `You can see where your money went — review it any time.`,
          }
        }
        return null
      },
    },
  ]
}

export function generateInsights(ctx: InsightContext): Insight[] {
  const rules = buildRules()
  const insights: Insight[] = []
  for (const rule of rules) {
    const result = rule.run(ctx)
    if (result) {
      insights.push(result)
    }
  }
  return insights.sort((a, b) => {
    const wa = a.kind === 'small_purchases' ? 4 : a.kind === 'spending_change' ? 3 : 2
    const wb = b.kind === 'small_purchases' ? 4 : b.kind === 'spending_change' ? 3 : 2
    return wb - wa
  })
}

export interface WeeklyReviewData {
  current: ReturnType<typeof rangeStats>
  previous: ReturnType<typeof rangeStats>
  comparison: ReturnType<typeof compareWindows>
  biggestDay: { date: string; minor: number; count: number } | null
  small: { count: number; totalMinor: number }
  largest: Transaction[]
  insights: Insight[]
  savingsProgress: { name: string; pct: number; remainingMinor: number }[]
}

export function buildWeeklyReview(
  txs: Transaction[],
  goals: SavingsGoal[],
  weekStartDay: 0 | 1,
  smallThresholdMinor: number,
): WeeklyReviewData {
  const today = todayISO()
  const cs = startOfWeek(today, weekStartDay)
  const current = rangeStats(txs, cs, today)
  const previous = rangeStats(txs, addDays(cs, -7), addDays(cs, -1))
  const comparison = compareWindows(txs, cs, today, addDays(cs, -7), addDays(cs, -1))
  const biggestDay = biggestSpendingDay(txs, cs, today)
  const small = smallPurchaseStats(txs, cs, today, smallThresholdMinor)
  const largest = largestTransactions(txs, cs, today, 5)
  const savingsProgress = goals
    .filter((g) => g.targetMinor > 0)
    .map((g) => ({
      name: g.name,
      pct: Math.round((g.currentMinor / g.targetMinor) * 100),
      remainingMinor: Math.max(0, g.targetMinor - g.currentMinor),
    }))
  const insights = generateInsights({
    transactions: txs,
    goals,
    weekStartDay,
    smallThresholdMinor,
    startingBalanceMinor: 0,
  }).filter((i) => i.kind !== 'weekly_review')
  return {
    current,
    previous,
    comparison,
    biggestDay,
    small: { count: small.count, totalMinor: small.totalMinor },
    largest,
    insights,
    savingsProgress,
  }
}