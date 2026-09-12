import { create } from 'zustand'
import type { ParsedTransaction, Transaction, TxType } from '../lib/types'

export type EntryMode = 'quick' | 'form' | 'import' | 'confirm' | 'none'

export interface ConfirmDraft {
  parsed: ParsedTransaction
  raw: string
}

export interface FormPrefill {
  type?: TxType
  amountMinor?: number
  categoryId?: string
  description?: string
  merchant?: string
  date?: string
  notes?: string
  source?: ParsedTransaction['source']
  goalId?: string | null
}

interface EntryState {
  mode: EntryMode
  confirm: ConfirmDraft | null
  formPrefill: FormPrefill | null
  editingTx: Transaction | null

  openQuick: () => void
  openConfirm: (confirm: ConfirmDraft) => void
  openForm: (prefill?: FormPrefill | null) => void
  openImport: () => void
  edit: (tx: Transaction) => void
  close: () => void
}

export const useEntryStore = create<EntryState>((set) => ({
  mode: 'none',
  confirm: null,
  formPrefill: null,
  editingTx: null,

  openQuick: () => set({ mode: 'quick', confirm: null, formPrefill: null, editingTx: null }),
  openConfirm: (confirm) => set({ mode: 'confirm', confirm, formPrefill: null, editingTx: null }),
  openForm: (prefill = null) =>
    set({ mode: 'form', formPrefill: prefill, confirm: null, editingTx: null }),
  openImport: () => set({ mode: 'import', confirm: null, formPrefill: null, editingTx: null }),
  edit: (tx) => set({ mode: 'form', formPrefill: null, confirm: null, editingTx: tx }),
  close: () => set({ mode: 'none' }),
}))