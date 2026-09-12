import type { SavingsGoal, Transaction } from './types'
import { addDays, todayISO } from './date'

export function goalContributions(txs: Transaction[], goalId: string): Transaction[] {
  return txs
    .filter((tx) => tx.type === 'savings' && tx.goalId === goalId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function goalContributionTotal(txs: Transaction[], goalId: string): number {
  return goalContributions(txs, goalId).reduce((sum, tx) => sum + tx.amountMinor, 0)
}

export function goalStatus(goal: SavingsGoal): 'active' | 'completed' | 'missed' {
  if (goal.currentMinor >= goal.targetMinor) return 'completed'
  if (goal.deadline && addDays(goal.deadline, 1) < todayISO()) return 'missed'
  return 'active'
}

export function remainingMinor(goal: SavingsGoal): number {
  return Math.max(0, goal.targetMinor - goal.currentMinor)
}

export function goalPct(goal: SavingsGoal): number {
  if (goal.targetMinor <= 0) return 0
  return Math.min(100, Math.round((goal.currentMinor / goal.targetMinor) * 100))
}