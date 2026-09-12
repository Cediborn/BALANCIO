import { useMemo, useState } from 'react'
import type { FormPrefill } from '../../store/entryStore'
import {
  SAVINGS_CATEGORY_ID,
  categoryById,
  incomeCategories,
  spendingCategories,
} from '../../lib/categories'
import { parseAmountToMinor, formatMoney } from '../../lib/money'
import { todayISO, nowTime } from '../../lib/date'
import { categoryColor } from '../../lib/categories'
import { useBalancioStore } from '../../store/appStore'
import { useToastStore } from '../ui/Toast'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Widgets'
import type { Transaction } from '../../lib/types'

interface Props {
  initial?: FormPrefill | null
  editing?: Transaction | null
}

function buildTransaction(
  input: FormPrefill,
  editing: Transaction | null | undefined,
): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
  const source = editing?.source ?? input.source ?? ('manual' as const)
  return {
    type: input.type ?? 'expense',
    amountMinor: input.amountMinor ?? 0,
    categoryId: input.categoryId ?? 'other',
    description: input.description ?? '',
    merchant: input.merchant || undefined,
    date: input.date ?? todayISO(),
    time: editing?.time ?? nowTime(),
    source,
    notes: input.notes || undefined,
    goalId: input.goalId ?? editing?.goalId ?? null,
  }
}

export function TransactionForm({ initial, editing }: Props) {
  const categories = useBalancioStore((s) => s.categories)
  const addTransaction = useBalancioStore((s) => s.addTransaction)
  const updateTransaction = useBalancioStore((s) => s.updateTransaction)
  const updateGoal = useBalancioStore((s) => s.updateGoal)
  const goals = useBalancioStore((s) => s.goals)

  const [type, setType] = useState<'expense' | 'income' | 'savings'>(
    initial?.type ?? editing?.type ?? 'expense',
  )
  const [amountText, setAmountText] = useState(
    editing?.amountMinor != null
      ? String(editing.amountMinor / 100)
      : initial?.amountMinor != null
        ? String(initial.amountMinor / 100)
        : '',
  )
  const [categoryId, setCategoryId] = useState(
    editing?.categoryId ?? initial?.categoryId ?? (initial?.type === 'income' ? 'allowance' : 'food'),
  )
  const [description, setDescription] = useState(editing?.description ?? initial?.description ?? '')
  const [merchant, setMerchant] = useState(editing?.merchant ?? initial?.merchant ?? '')
  const [date, setDate] = useState(editing?.date ?? initial?.date ?? todayISO())
  const [notes, setNotes] = useState(editing?.notes ?? initial?.notes ?? '')
  const [goalId, setGoalId] = useState<string>(editing?.goalId ?? '')
  const [error, setError] = useState<string | null>(null)

  const toast = useToastStore((s) => s.show)

  const spendCats = useMemo(() => spendingCategories(categories), [categories])
  const incomeCats = useMemo(() => incomeCategories(categories), [categories])

  const activeCats = type === 'income' ? incomeCats : type === 'savings' ? [] : spendCats

  function onSave() {
    if (!amountText.trim()) {
      setError('Enter an amount — even “15 waakye” works here.')
      return
    }
    const minor = parseAmountToMinor(amountText)
    if (minor === null || minor <= 0) {
      setError('That amount doesn’t look right. Try 15 or 15.50.')
      return
    }

    const source = editing?.source ?? initial?.source ?? ('manual' as const)
    const input: FormPrefill = {
      type,
      amountMinor: minor,
      categoryId: type === 'savings' ? SAVINGS_CATEGORY_ID : categoryId,
      description: description.trim(),
      merchant: merchant.trim() || undefined,
      date,
      notes: notes.trim() || undefined,
      source,
      goalId: type === 'savings' ? (goalId || null) : null,
    }

    if (editing) {
      updateTransaction(editing.id, buildTransaction(input, editing))
      if (editing.type === 'savings' && editing.goalId) {
        const current = goals.find((g) => g.id === editing.goalId)?.currentMinor ?? 0
        const delta = minor - editing.amountMinor
        updateGoal(editing.goalId, { currentMinor: Math.max(0, current + delta) })
      }
      toast(`Updated ${formatMoney(minor)}`)
      return
    }

    addTransaction(buildTransaction(input, editing))

    if (type === 'income') toast(`${formatMoney(minor)} received`)
    else if (type === 'savings') toast(`${formatMoney(minor)} saved`)
    else toast(`Logged ${formatMoney(minor)}`)
  }

  function switchType(next: 'expense' | 'income' | 'savings') {
    setType(next)
    setCategoryId(
      next === 'income' ? (incomeCats[0]?.id ?? 'allowance') : next === 'savings' ? SAVINGS_CATEGORY_ID : (spendCats[0]?.id ?? 'food'),
    )
    setGoalId('')
    setError(null)
  }

  return (
    <div>
      <Segmented
        value={type}
        onChange={switchType}
        ariaLabel="Transaction type"
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
          { value: 'savings', label: 'Savings' },
        ]}
      />

      <div style={{ height: 16 }} />

      <div className="field">
        <label className="field-label" htmlFor="tx-amount">
          Amount
        </label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontWeight: 650,
              fontSize: 20,
              color: 'var(--text-secondary)',
            }}
          >
            GH₵
          </span>
          <input
            id="tx-amount"
            className="input input-amount"
            style={{ paddingLeft: 62 }}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amountText}
            onChange={(e) => {
              setAmountText(e.target.value)
              setError(null)
            }}
          />
        </div>
      </div>

      {type === 'savings' ? (
        <div className="field">
          <label className="field-label" htmlFor="tx-goal">
            Savings goal (optional)
          </label>
          <select
            id="tx-goal"
            className="select"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
          >
            <option value="">General savings</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="field">
          <span className="field-label" id="tx-cat-label">
            Category
          </span>
          <div
            className="filter-row"
            role="listbox"
            aria-labelledby="tx-cat-label"
            aria-label="Category"
          >
            {activeCats.map((c) => (
              <button
                type="button"
                key={c.id}
                role="option"
                aria-selected={categoryId === c.id}
                className={`chip${categoryId === c.id ? ' active' : ''}`}
                onClick={() => {
                  setCategoryId(c.id)
                  setError(null)
                }}
              >
                <span className="chip-dot" style={{ background: categoryColor(c.id) }} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          <span className="form-hint">
            {categoryById(categories, categoryId)?.label ?? 'Category'}
            {merchant ? ` · ${merchant}` : ''}
          </span>
        </div>
      )}

      <div className="field">
        <label className="field-label" htmlFor="tx-desc">
          {type === 'income' ? 'From who?' : type === 'savings' ? 'Note (optional)' : 'What was it for?'}
        </label>
        <input
          id="tx-desc"
          className="input"
          placeholder={
            type === 'income'
              ? 'e.g. Mum, allowance, side hustle'
              : type === 'savings'
                ? 'e.g. Laptop fund'
                : 'e.g. waakye, trotro, haircut'
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {type !== 'savings' ? (
        <div className="field">
          <label className="field-label" htmlFor="tx-merchant">
            Paid to / received from <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            id="tx-merchant"
            className="input"
            placeholder="e.g. MTN, Kofi, University"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="field">
          <label className="field-label" htmlFor="tx-date">
            Date
          </label>
          <input
            id="tx-date"
            className="input"
            type="date"
            max={todayISO()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="tx-notes">
            Notes <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            id="tx-notes"
            className="input"
            placeholder="Anything else"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {error ? <div className="form-error" role="alert">{error}</div> : null}

      <Button variant="primary" size="lg" block onClick={onSave}>
        {editing ? 'Save changes' : type === 'income' ? 'Record income' : type === 'savings' ? 'Add to savings' : 'Log expense'}
      </Button>
    </div>
  )
}