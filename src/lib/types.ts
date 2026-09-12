export type TxType = 'expense' | 'income' | 'savings'
export type TxSource = 'manual' | 'natural' | 'import' | 'savings' | 'onboarding'
export type CategoryKind = 'spend' | 'income' | 'transfer'

export interface Category {
  id: string
  label: string
  kind: CategoryKind
  builtin: boolean
}

export interface Transaction {
  id: string
  type: TxType
  amountMinor: number
  categoryId: string
  description: string
  merchant?: string
  date: string
  time: string
  source: TxSource
  notes?: string
  goalId?: string | null
  createdAt: number
  updatedAt: number
}

export interface SavingsGoal {
  id: string
  name: string
  targetMinor: number
  currentMinor: number
  deadline?: string | null
  createdAt: number
}

export interface ActiveChallenge {
  id: string
  defId: string
  startedAt: number
  completedAt?: number | null
}

export interface SettingsState {
  currencyLabel: string
  reduceMotion: boolean
  smallThresholdMinor: number
  weekStartDay: 0 | 1
  onboarded: boolean
}

export interface Insight {
  id: string
  kind: string
  tone: 'info' | 'positive' | 'warning' | 'neutral'
  title: string
  body: string
}

export interface ParsedAmount {
  minor: number
}

export interface ParsedEntity {
  id: string
  label: string
}

export interface ParsedTransaction {
  type: TxType
  amountMinor: number
  categoryId: string
  description: string
  merchant?: string
  date?: string
  time?: string
  confidence: 'high' | 'medium' | 'low'
  source: TxSource
  notes?: string
}