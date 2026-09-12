import type { Transaction } from './types'
import { addDays, daysBetween, isWithinRange, startOfWeek } from './date'
import { formatMoney } from './money'

export type ChallengeKind = 'reset' | 'save' | 'limit' | 'small-audit'

export interface ChallengeParams {
  targetMinor?: number
  countTarget?: number
  thresholdMinor?: number
  categoryId?: string
  necessaryCategoryIds?: string[]
}

export interface ChallengeDef {
  id: string
  kind: ChallengeKind
  title: string
  description: string
  durationLabel: string
  defaultParams?: ChallengeParams
}

export interface ChallengeProgress {
  defId: string
  fraction: number
  current: string
  target: string
  done: boolean
  note?: string
}

export const DEFAULT_NECESSARY = ['food', 'transport', 'housing', 'school', 'health', 'data']

export const CHALLENGE_DEFS: ChallengeDef[] = [
  {
    id: 'reset3',
    kind: 'reset',
    title: '3-Day Reset',
    description: 'Avoid unnecessary spending for 3 days straight. Food, transport, school and health are fine — cut the rest.',
    durationLabel: '3 days',
  },
  {
    id: 'save20',
    kind: 'save',
    title: 'Save GH₵20',
    description: 'Put aside GH₵20 this week. Even ten days, two days at a time.',
    durationLabel: 'this week',
    defaultParams: { targetMinor: 2000 },
  },
  {
    id: 'foodcheck',
    kind: 'limit',
    title: 'Food Check',
    description: 'Keep food spending under a target amount for the week.',
    durationLabel: 'this week',
    defaultParams: { targetMinor: 10000, categoryId: 'food' },
  },
  {
    id: 'smallaudit',
    kind: 'small-audit',
    title: 'Small-Spend Audit',
    description: 'Every purchase under GH₵10 counts. Spot 5 of them in a week so you can see what they really add up to.',
    durationLabel: 'this week',
    defaultParams: { thresholdMinor: 1000, countTarget: 5 },
  },
]

const fmt = (m: number) => formatMoney(m)

function resetStreak(txs: Transaction[], startedISO: string, necessary: string[], today: string): { days: number; start: string } {
  let streak = 0
  let cursor = today
  const startDate = startedISO
  let guard = 0
  while (guard < 60) {
    guard++
    if (isWithinRange(cursor, startDate, today) === false) break
    const hasDiscretionary = txs.some(
      (tx) =>
        tx.type === 'expense' &&
        tx.date === cursor &&
        !necessary.includes(tx.categoryId),
    )
    if (hasDiscretionary) break
    streak++
    cursor = addDays(cursor, -1)
  }
  return { days: streak, start: startDate }
}

export function computeChallengeProgress(
  defId: string,
  txs: Transaction[],
  startedISO: string,
  today: string,
  params?: ChallengeParams,
): ChallengeProgress {
  const def = CHALLENGE_DEFS.find((d) => d.id === defId)

  if (defId === 'reset3') {
    const necessary = params?.necessaryCategoryIds ?? DEFAULT_NECESSARY
    const { days } = resetStreak(txs, startedISO, necessary, today)
    const target = 3
    return {
      defId,
      fraction: Math.min(1, days / target),
      current: `${days} clean day${days === 1 ? '' : 's'}`,
      target: `${target} days`,
      done: days >= target,
      note: necessary.length > 0
        ? 'Optional spending: anything outside food, transport, school, health, housing and data.'
        : undefined,
    }
  }

  if (defId === 'save20') {
    const target = params?.targetMinor ?? 2000
    const weekStart = startOfWeek(today, 1)
    const saved = txs
      .filter((tx) => tx.type === 'savings' && isWithinRange(tx.date, weekStart, today))
      .reduce((sum, tx) => sum + tx.amountMinor, 0)
    return {
      defId,
      fraction: Math.min(1, saved / target),
      current: `${fmt(saved)} saved`,
      target: fmt(target),
      done: saved >= target,
    }
  }

  if (defId === 'foodcheck') {
    const target = params?.targetMinor ?? 10000
    const categoryId = params?.categoryId ?? 'food'
    const weekStart = startOfWeek(today, 1)
    const spent = txs
      .filter((tx) => tx.type === 'expense' && tx.categoryId === categoryId && isWithinRange(tx.date, weekStart, today))
      .reduce((sum, tx) => sum + tx.amountMinor, 0)
    const budgetLeft = Math.max(0, target - spent)
    return {
      defId,
      fraction: Math.min(1, spent / target),
      current: `${fmt(spent)} spent`,
      target: `${fmt(target)} budget`,
      done: spent <= target,
      note: spent > target
        ? `You've gone over the ${def?.title ?? 'category'} target for the week.`
        : `${fmt(budgetLeft)} left for the week.`,
    }
  }

  if (defId === 'smallaudit') {
    const threshold = params?.thresholdMinor ?? 1000
    const countTarget = params?.countTarget ?? 5
    const weekStart = startOfWeek(today, 1)
    const found = txs.filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.amountMinor > 0 &&
        tx.amountMinor <= threshold &&
        isWithinRange(tx.date, weekStart, today),
    ).length
    return {
      defId,
      fraction: Math.min(1, found / countTarget),
      current: `${found} found`,
      target: `${countTarget} purchases`,
      done: found >= countTarget,
      note: `Purchases under ${fmt(threshold)} count.`,
    }
  }

  return {
    defId,
    fraction: 0,
    current: '',
    target: '',
    done: false,
  }
}

export function remainingDays(startedISO: string, today: string, totalDays: number): number {
  const elapsed = daysBetween(startedISO, today)
  return Math.max(0, totalDays - elapsed)
}