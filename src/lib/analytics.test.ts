import { describe, it, expect } from 'vitest'
import {
  rangeStats,
  compareWindows,
  spentByCategory,
  smallPurchaseStats,
  biggestSpendingDay,
  balanceFor,
  largestTransactions,
} from './analytics'
import { balanceBreakdown } from '../store/appStore'
import type { Transaction } from './types'

function tx(partial: Partial<Transaction> & Pick<Transaction, 'amountMinor' | 'type' | 'date'>): Transaction {
  return {
    id: Math.random().toString(36).slice(2),
    amountMinor: partial.amountMinor,
    type: partial.type,
    categoryId: partial.categoryId ?? 'food',
    description: partial.description ?? '',
    date: partial.date,
    time: partial.time ?? '12:00',
    source: 'manual',
    createdAt: 0,
    updatedAt: 0,
  }
}

const makeTx = tx

describe('analytics', () => {
  it('computes range stats exactly', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'income', amountMinor: 50000, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 1500, categoryId: 'food', date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 500, categoryId: 'transport', date: '2026-09-01' }),
      makeTx({ type: 'savings', amountMinor: 2000, categoryId: 'savings', date: '2026-09-01' }),
    ]
    const stats = rangeStats(txs, '2026-09-01', '2026-09-30')
    expect(stats.incomeMinor).toBe(50000)
    expect(stats.expenseMinor).toBe(2000)
    expect(stats.savedMinor).toBe(2000)
    expect(stats.count).toBe(4)
    expect(stats.byCategoryExpense.get('food')).toBe(1500)
    expect(stats.byCategoryExpense.get('transport')).toBe(500)
  })

  it('excludes transactions outside the range', () => {
    const txs = [makeTx({ type: 'expense', amountMinor: 900, date: '2026-08-01' })]
    expect(rangeStats(txs, '2026-09-01', '2026-09-30').expenseMinor).toBe(0)
  })

  it('ranks categories by spending', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 1000, categoryId: 'food', date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 3000, categoryId: 'data', date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 2000, categoryId: 'food', date: '2026-09-02' }),
    ]
    const ranked = spentByCategory(txs, '2026-09-01', '2026-09-30')
    expect(ranked[0]?.categoryId).toBe('food')
    expect(ranked[0]?.minor).toBe(3000)
    expect(ranked[1]?.categoryId).toBe('data')
  })

  it('detects small purchases', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 500, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 900, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 1500, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 999, date: '2026-09-01' }),
    ]
    const sp = smallPurchaseStats(txs, '2026-09-01', '2026-09-30', 1000)
    expect(sp.count).toBe(3)
    expect(sp.totalMinor).toBe(2399)
  })

  it('finds biggest spending day', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 1000, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 2500, date: '2026-09-02' }),
      makeTx({ type: 'expense', amountMinor: 250, date: '2026-09-01' }),
    ]
    const day = biggestSpendingDay(txs, '2026-09-01', '2026-09-30')
    expect(day?.date).toBe('2026-09-02')
    expect(day?.minor).toBe(2500)
  })

  it('computes balance correctly', () => {
    const txs = [
      makeTx({ type: 'income', amountMinor: 10000, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 3500, date: '2026-09-01' }),
      makeTx({ type: 'savings', amountMinor: 1000, date: '2026-09-01' }),
    ]
    expect(balanceFor(2000, txs)).toBe(7500)
    expect(balanceBreakdown(2000, txs).balanceMinor).toBe(7500)
    expect(balanceBreakdown(2000, txs).receivedMinor).toBe(10000)
    expect(balanceBreakdown(2000, txs).spentMinor).toBe(3500)
    expect(balanceBreakdown(2000, txs).savedMinor).toBe(1000)
  })

  it('compares windows with aligned spans', () => {
    const curStart = '2026-09-14' // Monday
    const curEnd = '2026-09-16' // Wednesday
    const prevStart = '2026-09-07'
    const prevEnd = '2026-09-09' // same 3 elapsed days
    const txs: Transaction[] = [
      makeTx({ type: 'expense', amountMinor: 3000, date: curStart }),
      makeTx({ type: 'expense', amountMinor: 1000, date: prevStart }),
    ]
    const cmp = compareWindows(txs, curStart, curEnd, prevStart, prevEnd)
    expect(cmp.current.expenseMinor).toBe(3000)
    expect(cmp.previous.expenseMinor).toBe(1000)
    expect(cmp.spentChangeMinor).toBe(2000)
    expect(cmp.spentChangePercent).toBe(200)
  })

  it('lists largest transactions', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 700, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 5000, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 1500, date: '2026-09-01' }),
    ]
    const largest = largestTransactions(txs, '2026-09-01', '2026-09-30', 2)
    expect(largest.map((t) => t.amountMinor)).toEqual([5000, 1500])
  })

  it('handles zero amount transactions', () => {
    const txs = [makeTx({ type: 'expense', amountMinor: 0, date: '2026-09-01' })]
    expect(rangeStats(txs, '2026-09-01', '2026-09-30').expenseMinor).toBe(0)
  })

  it('handles 1 pesewa and GH₵1 amounts', () => {
    const txs = [
      makeTx({ type: 'expense', amountMinor: 1, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 100, date: '2026-09-01' }),
      makeTx({ type: 'expense', amountMinor: 10000, date: '2026-09-01' }),
    ]
    expect(rangeStats(txs, '2026-09-01', '2026-09-30').expenseMinor).toBe(10101)
  })
})