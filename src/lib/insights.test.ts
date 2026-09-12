import { describe, it, expect } from 'vitest'
import { generateInsights } from './insights'
import { startOfWeek, todayISO, addDays } from './date'
import type { Transaction, SavingsGoal } from './types'

const WEEK_START = startOfWeek(todayISO(), 1)

function makeTx(partial: Partial<Transaction> & Pick<Transaction, 'type' | 'amountMinor'>): Transaction {
  return {
    id: Math.random().toString(36).slice(2),
    type: partial.type,
    amountMinor: partial.amountMinor,
    categoryId: partial.categoryId ?? 'food',
    description: partial.description ?? '',
    date: partial.date ?? WEEK_START,
    time: '12:00',
    source: 'manual',
    createdAt: 0,
    updatedAt: 0,
  }
}

const ctx = (txs: Transaction[], goals: SavingsGoal[] = []) => ({
  transactions: txs,
  goals,
  weekStartDay: 1 as const,
  smallThresholdMinor: 1000,
  startingBalanceMinor: 0,
})

describe('insights engine', () => {
  it('does not produce misleading percentages from tiny samples', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 3000 }), // only one tx this week
    ]
    const insights = generateInsights(ctx(txs))
    const change = insights.find((i) => i.kind === 'spending_change')
    expect(change).toBeUndefined()
  })

  it('flags small purchases that add up', () => {
    const txs = Array.from({ length: 6 }, () =>
      makeTx({ type: 'expense', amountMinor: 900 }),
    )
    const insights = generateInsights(ctx(txs))
    const small = insights.find((i) => i.kind === 'small_purchases')
    expect(small).toBeDefined()
    expect(small?.body).toContain('GH₵54.00')
  })

  it('does not flag small purchases under the threshold of 5', () => {
    const txs = [makeTx({ type: 'expense', amountMinor: 500 })]
    const insights = generateInsights(ctx(txs))
    expect(insights.find((i) => i.kind === 'small_purchases')).toBeUndefined()
  })

  it('produces income insight when money comes in', () => {
    const txs = [makeTx({ type: 'income', amountMinor: 50000 })]
    const insights = generateInsights(ctx(txs))
    expect(insights.find((i) => i.kind === 'income_received')).toBeDefined()
  })

  it('produces top category insight', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 2000, categoryId: 'food' }),
      makeTx({ type: 'expense', amountMinor: 500, categoryId: 'transport' }),
    ]
    const insights = generateInsights(ctx(txs))
    const top = insights.find((i) => i.kind === 'top_category')
    expect(top).toBeDefined()
    expect(top?.body).toContain('Food')
  })

  it('flags an unusually large purchase that dominates', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 80000, description: 'laptop repairs' }),
      makeTx({ type: 'expense', amountMinor: 2000, categoryId: 'food' }),
    ]
    const insights = generateInsights(ctx(txs))
    const large = insights.find((i) => i.kind === 'unusually_large')
    expect(large).toBeDefined()
    expect(large?.body).toContain('GH₵800.00')
  })

  it('does not flag small totals as unusually large', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 4000, description: 'shirt' }),
      makeTx({ type: 'expense', amountMinor: 2000, categoryId: 'food' }),
    ]
    const insights = generateInsights(ctx(txs))
    expect(insights.find((i) => i.kind === 'unusually_large')).toBeUndefined()
  })

  it('reports savings progress', () => {
    const goals: SavingsGoal[] = [
      {
        id: 'g1',
        name: 'New laptop',
        targetMinor: 250000,
        currentMinor: 70000,
        deadline: null,
        createdAt: 0,
      },
    ]
    const txs = [makeTx({ type: 'savings', amountMinor: 2000 })]
    const insights = generateInsights(ctx(txs, goals))
    const sp = insights.find((i) => i.kind === 'savings_progress')
    expect(sp).toBeDefined()
    expect(sp?.body).toContain('GH₵20.00')
    expect(sp?.body).toContain('New laptop')
    expect(sp?.body).toContain('28%')
  })

  it('guards spending-change insight when previous week has no data', () => {
    const txs: Transaction[] = []
    const insights = generateInsights(ctx(txs))
    expect(insights.find((i) => i.kind === 'spending_change')).toBeUndefined()
  })

  it('finds biggest spending day', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 4000, date: WEEK_START }),
      makeTx({ type: 'expense', amountMinor: 1000, date: addDays(WEEK_START, 1) }),
    ]
    const insights = generateInsights(ctx(txs))
    const day = insights.find((i) => i.kind === 'biggest_day')
    expect(day).toBeDefined()
  })
})