import { useState } from 'react'
import { useEntryStore } from '../../store/entryStore'
import { useBalancioStore } from '../../store/appStore'
import { useToastStore } from '../ui/Toast'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { TransactionForm } from './TransactionForm'
import { parseExpenseText } from '../../lib/parse/parser'
import { parseImportedTransaction } from '../../lib/parse/importParser'
import { categoryById } from '../../lib/categories'
import { categoryIcon } from '../../lib/categoryIcons'
import { formatMoney } from '../../lib/money'
import { todayISO } from '../../lib/date'
import { Icon } from '../ui/Icon'
import type { ParsedTransaction } from '../../lib/types'

const QUICK_EXAMPLES = [
  { label: '20 food', text: '20 food' },
  { label: '10 trotro', text: '10 trotro' },
  { label: '5 pure water', text: '5 pure water' },
  { label: '30 data', text: '30 data' },
]

export function EntryHost() {
  const mode = useEntryStore((s) => s.mode)
  const confirm = useEntryStore((s) => s.confirm)
  const prefill = useEntryStore((s) => s.formPrefill)
  const editingTx = useEntryStore((s) => s.editingTx)
  const close = useEntryStore((s) => s.close)
  const openConfirm = useEntryStore((s) => s.openConfirm)
  const openForm = useEntryStore((s) => s.openForm)

  const categories = useBalancioStore((s) => s.categories)
  const addTransaction = useBalancioStore((s) => s.addTransaction)
  const toast = useToastStore((s) => s.show)

  return (
    <>
      {mode === 'quick' ? (
        <QuickSheet
          key="quick"
          onClose={close}
          onOpenImport={() => useEntryStore.getState().openImport()}
          onParsed={(parsed, raw) => openConfirm({ parsed, raw })}
        />
      ) : null}

      {mode === 'confirm' && confirm ? (
        <ConfirmSheet
          key="confirm"
          parsed={confirm.parsed}
          raw={confirm.raw}
          categories={categories}
          onClose={close}
          onAdjust={() => openForm(confirm.parsed)}
          onSave={(parsed) => {
            addTransaction({
              type: parsed.type,
              amountMinor: parsed.amountMinor,
              categoryId: parsed.categoryId,
              description: parsed.description,
              merchant: parsed.merchant,
              date: parsed.date ?? todayISO(),
              time: parsed.time ?? '',
              source: parsed.source,
              notes: undefined,
              goalId: null,
            })
            toast(
              parsed.type === 'income'
                ? `${formatMoney(parsed.amountMinor)} received`
                : parsed.type === 'savings'
                  ? `${formatMoney(parsed.amountMinor)} saved`
                  : `Logged ${formatMoney(parsed.amountMinor)}`,
            )
            close()
          }}
        />
      ) : null}

      {mode === 'import' ? (
        <ImportSheet
          key="import"
          onClose={close}
          onParsed={(parsed, raw) => openConfirm({ parsed, raw })}
        />
      ) : null}

      {mode === 'form' ? (
        <Sheet
          open
          onClose={close}
          title={editingTx ? 'Edit transaction' : 'Add transaction'}
          labelledBy="tx-form-title"
        >
          <TransactionForm key={editingTx?.id ?? 'new'} editing={editingTx} initial={prefill} />
        </Sheet>
      ) : null}

      {mode === 'none' ? null : null}
    </>
  )
}

interface QuickSheetProps {
  onClose: () => void
  onOpenImport: () => void
  onParsed: (parsed: ParsedTransaction, raw: string) => void
}

function QuickSheet({ onClose, onOpenImport, onParsed }: QuickSheetProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const openForm = useEntryStore((s) => s.openForm)

  function run(textValue: string) {
    const t = textValue.trim()
    if (!t) {
      setError('Enter something like “15 waakye”.')
      return
    }
    const result = parseExpenseText(t)
    if (result.parsed) {
      setError(null)
      onParsed(result.parsed, t)
    } else {
      setError(result.error ?? 'Couldn’t understand that. Try “15 waakye”.')
    }
  }

  function runExample(textValue: string) {
    setText(textValue)
    run(textValue)
  }

  return (
    <Sheet open onClose={onClose} title="Add expense" labelledBy="quick-title">
      <h3 id="quick-title" className="visually-hidden">
        Add expense
      </h3>
      <p className="ob-sub" style={{ marginBottom: 12 }}>
        What did you spend? Keep it natural.
      </p>
      <div className="field">
        <label className="field-label" htmlFor="qa-text">
          Describe it
        </label>
        <input
          id="qa-text"
          className="input"
          style={{ minHeight: 52 }}
          placeholder="e.g. 15 waakye"
          value={text}
          autoFocus
          autoComplete="off"
          onChange={(e) => {
            setText(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') run(text)
          }}
        />
      </div>

      <div className="filter-row" style={{ marginBottom: 16 }}>
        {QUICK_EXAMPLES.map((ex) => (
          <button key={ex.label} type="button" className="chip" onClick={() => runExample(ex.text)}>
            {ex.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" size="lg" block onClick={() => run(text)} disabled={!text.trim()}>
          Understand & continue
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 14 }}>
        <button className="link-btn" onClick={() => openForm({ type: 'expense' })}>
          <Icon name="expense" size={16} /> Log manually
        </button>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <button className="link-btn" onClick={onOpenImport}>
          <Icon name="import" size={16} /> Paste a message
        </button>
      </div>
    </Sheet>
  )
}

interface ConfirmSheetProps {
  parsed: ParsedTransaction
  raw: string
  categories: ReturnType<typeof useBalancioStore.getState>['categories']
  onClose: () => void
  onAdjust: () => void
  onSave: (parsed: ParsedTransaction) => void
}

function ConfirmSheet({ parsed, raw, categories, onClose, onAdjust, onSave }: ConfirmSheetProps) {
  const cat = categoryById(categories, parsed.categoryId)

  return (
    <Sheet open onClose={onClose} title="We read that as" labelledBy="confirm-title">
      <div className="parse-card" style={{ marginBottom: 14 }}>
        <span className={`confidence-dot ${parsed.confidence}`} title={`Confidence: ${parsed.confidence}`} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="form-hint" style={{ display: 'block' }}>
            From “{raw}”
          </span>
          {parsed.confidence !== 'high' ? (
            <span className="form-hint" style={{ color: 'var(--amber)' }}>
              Double-check this before saving.
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div
          className="tx-icon"
          style={{ width: 52, height: 52, fontSize: 26, background: 'var(--surface-elevated)' }}
        >
          {categoryIcon(parsed.categoryId)}
        </div>
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color:
                parsed.type === 'income'
                  ? 'var(--primary-soft)'
                  : parsed.type === 'savings'
                    ? 'var(--blue)'
                    : 'var(--text)',
            }}
          >
            {formatMoney(parsed.amountMinor)}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {parsed.type === 'income' ? 'Income' : parsed.type === 'savings' ? 'Savings' : 'Expense'}
            {' · '}
            {cat?.label ?? 'Other'}
            {parsed.description ? ` · ${parsed.description}` : ''}
            {parsed.merchant ? ` · ${parsed.merchant}` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" size="lg" onClick={onAdjust} block>
          Adjust
        </Button>
        <Button variant="primary" size="lg" onClick={() => onSave(parsed)} block>
          Save
        </Button>
      </div>
    </Sheet>
  )
}

interface ImportSheetProps {
  onClose: () => void
  onParsed: (parsed: ParsedTransaction, raw: string) => void
}

function ImportSheet({ onClose, onParsed }: ImportSheetProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function run() {
    const t = text.trim()
    if (!t) {
      setError('Paste a transaction message to begin.')
      return
    }
    const result = parseImportedTransaction(t)
    if (result.parsed) {
      setError(null)
      onParsed(result.parsed, t)
    } else {
      setError(result.error ?? 'Couldn’t find an amount or direction in that message.')
    }
  }

  return (
    <Sheet open onClose={onClose} title="Paste a message" labelledBy="import-title">
      <h3 id="import-title" className="visually-hidden">
        Paste a transaction message
      </h3>
      <p className="ob-sub" style={{ marginBottom: 12 }}>
        Copy a transaction SMS or notification and paste it here. Balancio will pull out the amount
        and type — you stay in control.
      </p>
      <div className="field">
        <label className="field-label" htmlFor="import-text">
          Transaction message
        </label>
        <textarea
          id="import-text"
          className="textarea"
          placeholder={"You have successfully sent GHS 25.00 to MOMO_USER_KOFI_1234…"}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError(null)
          }}
        />
      </div>
      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}
      <Button variant="primary" size="lg" block onClick={run} disabled={!text.trim()}>
        Understand message
      </Button>
      <p className="form-hint" style={{ marginTop: 10, textAlign: 'center' }}>
        Balancio never connects to your MoMo or bank. This only reads what you paste.
      </p>
    </Sheet>
  )
}

export function useQuickEntry() {
  return {
    openQuick: () => useEntryStore.getState().openQuick(),
  }
}