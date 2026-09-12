import { describe, it, expect } from 'vitest'
import { CHALLENGE_DEFS, computeChallengeProgress, DEFAULT_NECESSARY } from './challenges'
import type { Transaction } from './types'

function makeTx(partial: Partial<Transaction> & Pick<Transaction, 'type' | 'amountMinor' | 'date' | 'categoryId'>): Transaction {
  return {
    id: Math.random().toString(36).slice(2),
    type: partial.type,
    amountMinor: partial.amountMinor,
    categoryId: partial.categoryId,
    description: partial.description ?? '',
    date: partial.date,
    time: '12:00',
    source: 'manual',
    createdAt: 0,
    updatedAt: 0,
  }
}

describe('challenges', () => {
  it('has exactly the four spec challenges', () => {
    expect(CHALLENGE_DEFS.map((d) => d.id)).toEqual(['reset3', 'save20', 'foodcheck', 'smallaudit'])
  })

  it('reset3 tracks clean streak', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'expense', amountMinor: 1000, categoryId: 'food', date: '2026-09-14' }),
      makeTx({ type: 'expense', amountMinor: 500, categoryId: 'transport', date: '2026-09-15' }),
    ]
    const p = computeChallengeProgress('reset3', txs, '2026-09-14', '2026-09-16', {
      necessaryCategoryIds: DEFAULT_NECESSARY,
    })
    expect(p.current).toContain('3 clean days')
    expect(p.fraction).toBe(1)
    expect(p.done).toBe(true)
  })

  it('reset3 breaks the streak on a discretionary purchase', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'expense', amountMinor: 2000, categoryId: 'entertainment', date: '2026-09-16' }),
      makeTx({ type: 'expense', amountMinor: 1000, categoryId: 'food', date: '2026-09-15' }),
    ]
    const p = computeChallengeProgress('reset3', txs, '2026-09-14', '2026-09-16', {
      necessaryCategoryIds: DEFAULT_NECESSARY,
    })
    expect(p.current).toContain('0 clean days')
    expect(p.done).toBe(false)
  })

  it('save20 sums savings transactions this week', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'savings', amountMinor: 1500, categoryId: 'savings', date: '2026-09-15' }),
      makeTx({ type: 'savings', amountMinor: 1000, categoryId: 'savings', date: '2026-09-16' }),
    ]
    const p = computeChallengeProgress('save20', txs, '2026-09-14', '2026-09-16', { targetMinor: 2000 })
    expect(p.done).toBe(true)
    expect(p.current).toBe('GH₵25.00 saved')
  })

  it('save20 is not done when under target', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'savings', amountMinor: 500, categoryId: 'savings', date: '2026-09-15' }),
    ]
    const p = computeChallengeProgress('save20', txs, '2026-09-14', '2026-09-16', { targetMinor: 2000 })
    expect(p.done).toBe(false)
    expect(p.fraction).toBe(0.25)
  })

  it('foodcheck reflects budget remaining', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'expense', amountMinor: 4000, categoryId: 'food', date: '2026-09-15' }),
    ]
    const p = computeChallengeProgress('foodcheck', txs, '2026-09-14', '2026-09-16', {
      targetMinor: 10000,
      categoryId: 'food',
    })
    expect(p.current).toBe('GH₵40.00 spent')
    expect(p.note).toContain('GH₵60.00 left')
  })

  it('smallaudit counts small purchases', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'expense', amountMinor: 900, categoryId: 'food', date: '2026-09-15' }),
      makeTx({ type: 'expense', amountMinor: 500, categoryId: 'transport', date: '2026-09-15' }),
      makeTx({ type: 'expense', amountMinor: 700, categoryId: 'food', date: '2026-09-16' }),
      makeTx({ type: 'expense', amountMinor: 300, categoryId: 'other', date: '2026-09-16' }),
      makeTx({ type: 'expense', amountMinor: 950, categoryId: 'data', date: '2026-09-16' }),
    ]
    const p = computeChallengeProgress('smallaudit', txs, '2026-09-14', '2026-09-16', {
      thresholdMinor: 1000,
      countTarget: 5,
    })
    expect(p.current).toBe('5 found')
    expect(p.done).toBe(true)
  })

  it('smallaudit ignores larger purchases', () => {
    const txs: Transaction[] = [
      makeTx({ type: 'expense', amountMinor: 900, categoryId: 'food', date: '2026-09-15' }),
      makeTx({ type: 'expense', amountMinor: 1500, categoryId: 'food', date: '2026-09-15' }),
    ]
    const p = computeChallengeProgress('smallaudit', txs, '2026-09-14', '2026-09-16', {
      thresholdMinor: 1000,
      countTarget: 5,
    })
    expect(p.current).toBe('1 found')
    expect(p.done).toBe(false)
  })
})