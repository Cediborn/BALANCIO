import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActiveChallenge,
  Category,
  SavingsGoal,
  SettingsState,
  Transaction,
  TxType,
} from '../lib/types'
import { BUILTIN_CATEGORIES } from '../lib/categories'
import { makeId } from '../lib/id'
import { todayISO, nowTime } from '../lib/date'

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>

interface CategoriesState {
  categories: Category[]
}

interface BalancioState extends CategoriesState {
  startingBalanceMinor: number
  transactions: Transaction[]
  goals: SavingsGoal[]
  activeChallenges: ActiveChallenge[]
  settings: SettingsState

  completeOnboarding: (balanceMinor: number) => void
  setBalance: (minor: number) => void
  addTransaction: (input: NewTransaction) => Transaction
  addTransactions: (inputs: NewTransaction[]) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  addGoal: (input: Omit<SavingsGoal, 'id' | 'createdAt'>) => SavingsGoal
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void
  deleteGoal: (id: string) => void
  contribute: (goalId: string, minor: number, notes?: string) => Transaction | null

  startChallenge: (defId: string, params?: Record<string, unknown>) => void
  abandonChallenge: (id: string) => void

  addCategory: (category: Category) => void
  updateSettings: (patch: Partial<SettingsState>) => void
  resetAll: () => void
}

function seedCategories(prev?: Category[]): Category[] {
  if (prev && prev.length > 0) return prev
  return BUILTIN_CATEGORIES
}

export type { BalancioState }

function applySavingsToGoal(
  goals: SavingsGoal[],
  goalId: string | null | undefined,
  delta: number,
): SavingsGoal[] {
  if (!goalId) return goals
  return goals.map((g) =>
    g.id === goalId
      ? { ...g, currentMinor: Math.max(0, g.currentMinor + delta) }
      : g,
  )
}

export const useBalancioStore = create<BalancioState>()(
  persist(
    (set, get) => ({
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

      completeOnboarding: (balanceMinor) =>
        set((s) => ({
          startingBalanceMinor: balanceMinor,
          settings: { ...s.settings, onboarded: true },
        })),

      setBalance: (minor) => set({ startingBalanceMinor: minor }),

      addTransaction: (input) => {
        const now = Date.now()
        const tx: Transaction = {
          ...input,
          id: makeId('tx'),
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({
          transactions: [tx, ...s.transactions],
          goals:
            input.type === 'savings'
              ? applySavingsToGoal(s.goals, input.goalId, input.amountMinor)
              : s.goals,
        }))
        return tx
      },

      addTransactions: (inputs) => {
        const now = Date.now()
        const txs: Transaction[] = inputs.map((input) => ({
          ...input,
          id: makeId('tx'),
          createdAt: now,
          updatedAt: now,
        }))
        set((s) => {
          let goals = s.goals
          for (const input of inputs) {
            if (input.type === 'savings') {
              goals = applySavingsToGoal(goals, input.goalId, input.amountMinor)
            }
          }
          return { transactions: [...txs, ...s.transactions], goals }
        })
      },

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((tx) => {
            if (tx.id !== id) return tx
            return { ...tx, ...patch, updatedAt: Date.now() }
          }),
        })),

      deleteTransaction: (id) =>
        set((s) => {
          const tx = s.transactions.find((t) => t.id === id)
          if (!tx) return s
          return {
            transactions: s.transactions.filter((t) => t.id !== id),
            goals:
              tx.type === 'savings'
                ? applySavingsToGoal(s.goals, tx.goalId, -tx.amountMinor)
                : s.goals,
          }
        }),

      addGoal: (input) => {
        const goal: SavingsGoal = {
          ...input,
          id: makeId('goal'),
          createdAt: Date.now(),
        }
        set((s) => ({ goals: [...s.goals, goal] }))
        return goal
      },

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
          transactions: s.transactions.map((tx) =>
            tx.goalId === id ? { ...tx, goalId: null } : tx,
          ),
        })),

      contribute: (goalId, minor, notes) => {
        if (minor <= 0) return null
        const goal = get().goals.find((g) => g.id === goalId)
        if (!goal) return null
        const now = Date.now()
        const tx: Transaction = {
          id: makeId('tx'),
          type: 'savings',
          amountMinor: minor,
          categoryId: 'savings',
          description: notes?.trim() || `Savings — ${goal.name}`,
          date: todayISO(),
          time: nowTime(),
          source: 'savings',
          goalId,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({
          transactions: [tx, ...s.transactions],
          goals: applySavingsToGoal(s.goals, goalId, minor),
        }))
        return tx
      },

      startChallenge: (defId, params) => {
        void params
        const existing = get().activeChallenges.find((c) => c.defId === defId)
        if (existing) return
        const challenge: ActiveChallenge = {
          id: makeId('ch'),
          defId,
          startedAt: Date.now(),
          completedAt: null,
        }
        set((s) => ({ activeChallenges: [...s.activeChallenges, challenge] }))
      },

      abandonChallenge: (id) =>
        set((s) => ({
          activeChallenges: s.activeChallenges.filter((c) => c.id !== id),
        })),

      addCategory: (category) =>
        set((s) => ({ categories: [...s.categories, category] })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetAll: () =>
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
        }),
    }),
    {
      name: 'balancio-store-v1',
      partialize: (state) => ({
        startingBalanceMinor: state.startingBalanceMinor,
        transactions: state.transactions,
        goals: state.goals,
        activeChallenges: state.activeChallenges,
        categories: state.categories,
        settings: state.settings,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<BalancioState>
        return {
          ...current,
          ...p,
          categories: seedCategories(p.categories ?? current.categories),
          settings: {
            ...current.settings,
            ...(p.settings ?? {}),
          },
          startingBalanceMinor: p.startingBalanceMinor ?? current.startingBalanceMinor,
          transactions: p.transactions ?? [],
          goals: p.goals ?? [],
          activeChallenges: p.activeChallenges ?? [],
        }
      },
    },
  ),
)

export function useTransactions(): Transaction[] {
  return useBalancioStore((s) => s.transactions)
}

export interface BalanceBreakdown {
  balanceMinor: number
  receivedMinor: number
  spentMinor: number
  savedMinor: number
}

export function balanceBreakdown(
  startingBalanceMinor: number,
  transactions: Transaction[],
): BalanceBreakdown {
  let received = 0
  let spent = 0
  let saved = 0
  for (const tx of transactions) {
    if (tx.type === 'income') received += tx.amountMinor
    else if (tx.type === 'savings') saved += tx.amountMinor
    else spent += tx.amountMinor
  }
  return {
    balanceMinor: startingBalanceMinor + received - spent - saved,
    receivedMinor: received,
    spentMinor: spent,
    savedMinor: saved,
  }
}

export function transactionTypeLabel(type: TxType): string {
  return type === 'income' ? 'Income' : type === 'savings' ? 'Savings' : 'Expense'
}

export { seedCategories }