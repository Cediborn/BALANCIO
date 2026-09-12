import { useMemo, useState } from 'react'
import { useBalancioStore } from '../store/appStore'
import { useEntryStore } from '../store/entryStore'
import { sortedTransactions } from '../lib/analytics'
import { categoryById, categoryColor } from '../lib/categories'
import { categoryIcon } from '../lib/categoryIcons'
import { formatMoney, formatMoneyCompact } from '../lib/money'
import { relativeDayLabel, formatISODate, } from '../lib/date'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { Segmented, EmptyState } from '../components/ui/Widgets'
import { useToastStore } from '../components/ui/Toast'
import type { Transaction, TxType } from '../lib/types'
import { balanceBreakdown } from '../store/appStore'

type TypeFilter = 'all' | TxType

export function TransactionsScreen() {
  const transactions = useBalancioStore((s) => s.transactions)
  const categories = useBalancioStore((s) => s.categories)
  const startingBalanceMinor = useBalancioStore((s) => s.startingBalanceMinor)
  const deleteTransaction = useBalancioStore((s) => s.deleteTransaction)
  const edit = useEntryStore((s) => s.edit)
  const toast = useToastStore((s) => s.show)

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [catFilter, setCatFilter] = useState<string>('all')
  const [detail, setDetail] = useState<Transaction | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const breakdown = useMemo(
    () => balanceBreakdown(startingBalanceMinor, transactions),
    [startingBalanceMinor, transactions],
  )

  const filtered = useMemo(() => {
    let list = sortedTransactions(transactions)
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter)
    if (catFilter !== 'all') list = list.filter((t) => t.categoryId === catFilter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((t) =>
        [t.description, t.merchant, categoryById(categories, t.categoryId)?.label ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    return list
  }, [transactions, typeFilter, catFilter, query, categories])

  const grouped = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = []
    for (const tx of filtered) {
      const last = groups[groups.length - 1]
      if (last && last.date === tx.date) last.items.push(tx)
      else groups.push({ date: tx.date, items: [tx] })
    }
    return groups
  }, [filtered])

  const spendCats = useMemo(
    () => categories.filter((c) => c.kind === 'spend' || c.kind === 'transfer'),
    [categories],
  )

  function confirmAndDelete() {
    if (!detail) return
    deleteTransaction(detail.id)
    toast('Transaction deleted')
    setConfirmDelete(false)
    setDetail(null)
  }

  return (
    <div>
      <div className="metric-grid" style={{ marginBottom: 14 }}>
        <div className="metric">
          <div className="metric-label">Balance</div>
          <div className="metric-value money-mono">{formatMoneyCompact(breakdown.balanceMinor)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total spent</div>
          <div className="metric-value money-mono">{formatMoneyCompact(breakdown.spentMinor)}</div>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 10 }}>
        <Icon name="search" size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          aria-label="Search transactions"
          placeholder="Search expenses, income, people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query ? (
          <button className="btn-icon" style={{ width: 30, height: 30 }} onClick={() => setQuery('')} aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        ) : null}
      </div>

      <Segmented
        value={typeFilter}
        onChange={setTypeFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'expense', label: 'Expenses' },
          { value: 'income', label: 'Income' },
          { value: 'savings', label: 'Savings' },
        ]}
        ariaLabel="Filter by type"
      />

      <div style={{ height: 10 }} />

      <div className="filter-row" aria-label="Filter by category">
        <button
          type="button"
          className={`chip${catFilter === 'all' ? ' active' : ''}`}
          onClick={() => setCatFilter('all')}
        >
          All categories
        </button>
        {spendCats.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`chip${catFilter === c.id ? ' active' : ''}`}
            onClick={() => setCatFilter(c.id)}
          >
            <span className="chip-dot" style={{ background: categoryColor(c.id) }} />
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ height: 10 }} />

      {grouped.length === 0 ? (
        <EmptyState
          icon={<Icon name="list" size={24} />}
          title={transactions.length === 0 ? 'No transactions yet' : 'Nothing matches'}
          desc={
            transactions.length === 0
              ? 'Tap “Add expense” and your history will start building itself.'
              : 'Try a different search or filter.'
          }
        />
      ) : (
        grouped.map((group) => (
          <section key={group.date} className="history-group" aria-label={relativeDayLabel(group.date)}>
            <div className="history-group-label">
              <span style={{ float: 'right', fontWeight: 550 }}>
                <span className="money-mono" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {formatMoneyCompact(
                    group.items
                      .filter((t) => t.type === 'expense')
                      .reduce((s, t) => s + t.amountMinor, 0),
                  )}
                </span>
              </span>
              {relativeDayLabel(group.date)} · {formatISODate(group.date)}
            </div>
            <div className="card" style={{ padding: '4px 12px' }}>
              {group.items.map((tx) => (
                <TxRow key={tx.id} tx={tx} categoryLabel={categoryById(categories, tx.categoryId)?.label ?? ''} onOpen={() => setDetail(tx)} />
              ))}
            </div>
          </section>
        ))
      )}

      <Button
        variant="soft"
        block
        icon={<Icon name="plus" size={18} />}
        onClick={() => useEntryStore.getState().openQuick()}
        style={{ marginTop: 16 }}
      >
        Add expense
      </Button>

      <Sheet open={!!detail} onClose={() => setDetail(null)} title="Transaction" labelledBy="tx-detail-title">
        {detail ? (
          <div>
            <h3 id="tx-detail-title" className="visually-hidden">
              Transaction details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 20px' }}>
              <span className={`tx-amount ${detail.type} money-mono`} style={{ fontSize: 34 }}>
                {formatMoney(detail.amountMinor)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {detail.type === 'income' ? 'Income' : detail.type === 'savings' ? 'Savings' : 'Expense'}
              </span>
            </div>

            <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Category</dt>
                <dd style={{ margin: 0, fontWeight: 550 }}>
                  {categoryIcon(detail.categoryId)}&nbsp;
                  {categoryById(categories, detail.categoryId)?.label ?? 'Other'}
                </dd>
              </div>
              {detail.description ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>What</dt>
                  <dd style={{ margin: 0, fontWeight: 550, textAlign: 'right' }}>{detail.description}</dd>
                </div>
              ) : null}
              {detail.merchant ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {detail.type === 'income' ? 'From' : 'Paid to'}
                  </dt>
                  <dd style={{ margin: 0, fontWeight: 550 }}>{detail.merchant}</dd>
                </div>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Date</dt>
                <dd style={{ margin: 0, fontWeight: 550 }}>
                  {formatISODate(detail.date)}
                  {detail.time ? ` · ${detail.time}` : ''}
                </dd>
              </div>
              {detail.notes ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Notes</dt>
                  <dd style={{ margin: 0, fontWeight: 550, textAlign: 'right' }}>{detail.notes}</dd>
                </div>
              ) : null}
            </dl>

            <div className="divider" />

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="danger"
                onClick={() => setConfirmDelete(true)}
                icon={<Icon name="trash" size={16} />}
              >
                Delete
              </Button>
              <Button
                variant="primary"
                block
                onClick={() => {
                  setDetail(null)
                  edit(detail)
                }}
              >
                <Icon name="edit" size={16} />
                Edit
              </Button>
            </div>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} center>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <h3 style={{ fontSize: 17, fontWeight: 650, marginBottom: 6 }}>Delete this transaction?</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
            {detail ? `${formatMoney(detail.amountMinor)} will be removed from your balances and history.` : ''}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" block onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" block onClick={confirmAndDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

function TxRow({
  tx,
  categoryLabel,
  onOpen,
}: {
  tx: Transaction
  categoryLabel: string
  onOpen: () => void
}) {
  const title = tx.description || tx.merchant || categoryLabel
  const sub = [categoryLabel, tx.merchant ? tx.merchant : null, tx.time]
    .filter(Boolean)
    .join(' · ')

  return (
    <button type="button" className="tx-row" onClick={onOpen} aria-label={`${title}, ${formatMoney(tx.amountMinor)}`}>
      <div className="tx-icon">{categoryIcon(tx.categoryId)}</div>
      <div className="tx-main">
        <div className="tx-title">{title || 'Unknown'}</div>
        <div className="tx-sub">{sub}</div>
      </div>
      <span className={`tx-amount ${tx.type} money-mono`}>
        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
        {formatMoney(tx.amountMinor)}
      </span>
    </button>
  )
}