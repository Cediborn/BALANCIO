import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/id', () => ({
  makeId: () => `id_${Math.random().toString(36).slice(2, 8)}`,
}))

import { useBalancioStore } from './appStore'
import { useNavStore } from './navStore'
import { useEntryStore } from './entryStore'
import { BUILTIN_CATEGORIES } from '../lib/categories'

const plain = useBalancioStore.getState
const set = useBalancioStore.setState

beforeEach(() => {
  set({
    startingBalanceMinor: 0,
    transactions: [],
    goals: [],
    activeChallenges: [],
    categories: BUILTIN_CATEGORIES,
    settings: {
      onboarded: false,
      smallThresholdMinor: 1000,
      weekStartDay: 1,
      reduceMotion: false,
      currencyLabel: 'GHS',
    },
  })
})

describe('appStore', () => {
  it('completeOnboarding stores the balance and marks onboarded', () => {
    plain().completeOnboarding(12000)
    expect(plain().startingBalanceMinor).toBe(12000)
    expect(plain().settings.onboarded).toBe(true)
  })

  it('addTransaction prepends and returns the tx', () => {
    plain().setBalance(10000)
    const tx = plain().addTransaction({
      type: 'expense',
      amountMinor: 1500,
      categoryId: 'food',
      description: 'waakye',
      date: '2026-09-12',
      time: '12:00',
      source: 'natural',
      goalId: null,
    })
    expect(plain().transactions).toHaveLength(1)
    expect(plain().transactions[0]!.id).toBe(tx.id)
    expect(plain().transactions[0]!.amountMinor).toBe(1500)
  })

  it('savings contributions move both balance and the goal', () => {
    plain().setBalance(10000)
    const goal = plain().addGoal({ name: 'Laptop', targetMinor: 100000, currentMinor: 0, deadline: null })
    plain().addTransaction({
      type: 'savings',
      amountMinor: 2000,
      categoryId: 'savings',
      description: 'Savings â€” Laptop',
      date: '2026-09-12',
      time: '12:00',
      source: 'savings',
      goalId: goal.id,
    })
    const state = plain()
    expect(state.goals[0]!.currentMinor).toBe(2000)
    expect(state.transactions[0]!.goalId).toBe(goal.id)
  })

  it('deleting a savings tx reverses the goal contribution', () => {
    const goal = plain().addGoal({ name: 'Laptop', targetMinor: 100000, currentMinor: 0, deadline: null })
    const tx = plain().addTransaction({
      type: 'savings',
      amountMinor: 2000,
      categoryId: 'savings',
      description: 'Savings â€” Laptop',
      date: '2026-09-12',
      time: '12:00',
      source: 'savings',
      goalId: goal.id,
    })
    plain().deleteTransaction(tx.id)
    expect(plain().goals[0]!.currentMinor).toBe(0)
  })

  it('deleteGoal clears goalId on its transactions', () => {
    const goal = plain().addGoal({ name: 'Laptop', targetMinor: 100000, currentMinor: 0, deadline: null })
    plain().addTransaction({
      type: 'savings',
      amountMinor: 2000,
      categoryId: 'savings',
      description: 'Savings â€” Laptop',
      date: '2026-09-12',
      time: '12:00',
      source: 'savings',
      goalId: goal.id,
    })
    plain().deleteGoal(goal.id)
    expect(plain().transactions[0]!.goalId).toBeNull()
    expect(plain().goals).toHaveLength(0)
  })

  it('contribute creates the savings tx and updates the goal', () => {
    const goal = plain().addGoal({ name: 'Trip', targetMinor: 50000, currentMinor: 0, deadline: null })
    const tx = plain().contribute(goal.id, 3500, 'week one')
    expect(tx).not.toBeNull()
    expect(plain().goals[0]!.currentMinor).toBe(3500)
    expect(plain().transactions[0]!.categoryId).toBe('savings')
    expect(plain().transactions[0]!.goalId).toBe(goal.id)
  })

  it('contribute returns null for an unknown goal', () => {
    expect(plain().contribute('nope', 100)).toBeNull()
  })

  it('startChallenge ignores duplicate def ids', () => {
    plain().startChallenge('reset3')
    plain().startChallenge('reset3')
    expect(plain().activeChallenges.filter((c) => c.defId === 'reset3')).toHaveLength(1)
  })

  it('abandonChallenge removes the challenge', () => {
    plain().startChallenge('save20')
    const id = plain().activeChallenges[0]!.id
    plain().abandonChallenge(id)
    expect(plain().activeChallenges).toHaveLength(0)
  })

  it('addCategory appends a custom category', () => {
    plain().addCategory({ id: 'custom-x', label: 'Church', kind: 'spend', builtin: false })
    expect(plain().categories.some((c) => c.label === 'Church')).toBe(true)
  })

  it('updateSettings patches only the given keys', () => {
    plain().updateSettings({ smallThresholdMinor: 500 })
    const s = plain().settings
    expect(s.smallThresholdMinor).toBe(500)
    expect(s.weekStartDay).toBe(1)
  })

  it('resetAll clears data and re-seeds categories', () => {
    plain().setBalance(5000)
    plain().addTransaction({ type: 'expense', amountMinor: 100, categoryId: 'food', description: '', date: '2026-09-12', time: '12:00', source: 'manual', goalId: null })
    plain().resetAll()
    const s = plain()
    expect(s.startingBalanceMinor).toBe(0)
    expect(s.transactions).toHaveLength(0)
    expect(s.settings.onboarded).toBe(false)
    expect(s.categories.length).toBe(BUILTIN_CATEGORIES.length)
  })
})

describe('navStore', () => {
  it('go changes the screen', () => {
    useNavStore.setState({ screen: 'home' })
    useNavStore.getState().go('savings')
    expect(useNavStore.getState().screen).toBe('savings')
  })
})

describe('entryStore', () => {
  it('opens quick and closes', () => {
    useEntryStore.setState({ mode: 'none' })
    useEntryStore.getState().openQuick()
    expect(useEntryStore.getState().mode).toBe('quick')
    useEntryStore.getState().close()
    expect(useEntryStore.getState().mode).toBe('none')
  })

  it('opens confirm with a parsed draft', () => {
    useEntryStore.setState({ mode: 'none' })
    useEntryStore.getState().openConfirm({
      parsed: {
        type: 'expense',
        amountMinor: 1500,
        categoryId: 'food',
        description: 'waakye',
        confidence: 'high',
        source: 'natural',
      },
      raw: '15 waakye',
    })
    expect(useEntryStore.getState().mode).toBe('confirm')
    expect(useEntryStore.getState().confirm?.parsed.amountMinor).toBe(1500)
  })

  it('opens form with a prefill', () => {
    useEntryStore.setState({ mode: 'none' })
    useEntryStore.getState().openForm({ type: 'income' })
    expect(useEntryStore.getState().mode).toBe('form')
    expect(useEntryStore.getState().formPrefill?.type).toBe('income')
  })
})