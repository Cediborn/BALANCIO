import type { Category, CategoryKind } from './types'

export const BUILTIN_CATEGORIES: Category[] = [
  { id: 'food', label: 'Food', kind: 'spend', builtin: true },
  { id: 'transport', label: 'Transport', kind: 'spend', builtin: true },
  { id: 'data', label: 'Data & Airtime', kind: 'spend', builtin: true },
  { id: 'school', label: 'School', kind: 'spend', builtin: true },
  { id: 'housing', label: 'Housing', kind: 'spend', builtin: true },
  { id: 'personal', label: 'Personal Care', kind: 'spend', builtin: true },
  { id: 'entertainment', label: 'Entertainment', kind: 'spend', builtin: true },
  { id: 'shopping', label: 'Shopping', kind: 'spend', builtin: true },
  { id: 'family', label: 'Family & Giving', kind: 'spend', builtin: true },
  { id: 'health', label: 'Health', kind: 'spend', builtin: true },
  { id: 'other', label: 'Other', kind: 'spend', builtin: true },

  { id: 'allowance', label: 'Allowance', kind: 'income', builtin: true },
  { id: 'salary', label: 'Salary', kind: 'income', builtin: true },
  { id: 'sidehustle', label: 'Side Hustle', kind: 'income', builtin: true },
  { id: 'business', label: 'Business', kind: 'income', builtin: true },
  { id: 'gift', label: 'Gift', kind: 'income', builtin: true },
  { id: 'refund', label: 'Refund', kind: 'income', builtin: true },
  { id: 'otherother', label: 'Other', kind: 'income', builtin: true },

  { id: 'savings', label: 'Savings', kind: 'transfer', builtin: true },
]

export const SAVINGS_CATEGORY_ID = 'savings'

export function spendingCategories(list: Category[]): Category[] {
  return list.filter((c) => c.kind === 'spend')
}

export function incomeCategories(list: Category[]): Category[] {
  return list.filter((c) => c.kind === 'income')
}

export function categoryById(list: Category[], id: string): Category | undefined {
  return list.find((c) => c.id === id)
}

export function fallbackCategory(list: Category[], kind: CategoryKind): Category {
  const fallbackId = kind === 'spend' ? 'other' : kind === 'income' ? 'otherother' : 'savings'
  return (
    list.find((c) => c.id === fallbackId) ??
    list.find((c) => c.kind === kind) ?? {
      id: fallbackId,
      label: 'Other',
      kind,
      builtin: false,
    }
  )
}

export const CATEGORY_REGISTRY: (Category & { color?: string })[] = [
  { id: 'food', label: 'Food', kind: 'spend', builtin: true, color: '#F4B860' },
  { id: 'transport', label: 'Transport', kind: 'spend', builtin: true, color: '#7FB4E8' },
  { id: 'data', label: 'Data & Airtime', kind: 'spend', builtin: true, color: '#C792EA' },
  { id: 'school', label: 'School', kind: 'spend', builtin: true, color: '#5FB8A6' },
  { id: 'housing', label: 'Housing', kind: 'spend', builtin: true, color: '#E8A87C' },
  { id: 'personal', label: 'Personal Care', kind: 'spend', builtin: true, color: '#E88BA0' },
  { id: 'entertainment', label: 'Entertainment', kind: 'spend', builtin: true, color: '#B0A5F0' },
  { id: 'shopping', label: 'Shopping', kind: 'spend', builtin: true, color: '#E8B4C0' },
  { id: 'family', label: 'Family & Giving', kind: 'spend', builtin: true, color: '#89CFF0' },
  { id: 'health', label: 'Health', kind: 'spend', builtin: true, color: '#7FD8B0' },
  { id: 'other', label: 'Other', kind: 'spend', builtin: true, color: '#8B95A1' },

  { id: 'allowance', label: 'Allowance', kind: 'income', builtin: true, color: '#35C98A' },
  { id: 'salary', label: 'Salary', kind: 'income', builtin: true, color: '#35C98A' },
  { id: 'sidehustle', label: 'Side Hustle', kind: 'income', builtin: true, color: '#35C98A' },
  { id: 'business', label: 'Business', kind: 'income', builtin: true, color: '#35C98A' },
  { id: 'gift', label: 'Gift', kind: 'income', builtin: true, color: '#35C98A' },
  { id: 'refund', label: 'Refund', kind: 'income', builtin: true, color: '#35C98A' },
  { id: 'otherother', label: 'Other', kind: 'income', builtin: true, color: '#35C98A' },

  { id: 'savings', label: 'Savings', kind: 'transfer', builtin: true, color: '#A5E8C7' },
]

export function categoryColor(id: string): string {
  return CATEGORY_REGISTRY.find((c) => c.id === id)?.color ?? '#8B95A1'
}