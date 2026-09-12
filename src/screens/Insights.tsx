import { useMemo, useState } from 'react'
import { useBalancioStore } from '../store/appStore'
import {
  rangeStats,
  spentByCategory,
  smallPurchaseStats,
  biggestSpendingDay,
  largestTransactions,
  weekSeries,
  fullCurrentWeek,
} from '../lib/analytics'
import { formatMoney, formatMoneyCompact } from '../lib/money'
import { categoryById, categoryColor } from '../lib/categories'
import { categoryIcon } from '../lib/categoryIcons'
import {
  addDays,
  dayName,
  formatISODateShort,
  endOfMonth,
  monthKey,
  currentMonthKey,
  previousMonthKey,
  startOfMonth,
  todayISO,
} from '../lib/date'
import { Icon } from '../components/ui/Icon'
import { EmptyState, Segmented } from '../components/ui/Widgets'

type Period = 'week' | 'month' | 'all'

interface Range {
  start: string
  end: string
  label: string
}

function periodRange(period: Period, weekStartDay: 0 | 1): Range {
  const today = todayISO()
  if (period === 'week') {
    const fw = fullCurrentWeek(weekStartDay)
    return { start: fw.start, end: today, label: 'This week' }
  }
  if (period === 'month') {
    return {
      start: startOfMonth(currentMonthKey()),
      end: today,
      label: `This month (${monthKey(today)})`,
    }
  }
  return { start: '2000-01-01', end: today, label: 'All time' }
}

export function InsightsScreen() {
  const transactions = useBalancioStore((s) => s.transactions)
  const categories = useBalancioStore((s) => s.categories)
  const settings = useBalancioStore((s) => s.settings)
  const [period, setPeriod] = useState<Period>('week')

  const range = useMemo(() => periodRange(period, settings.weekStartDay), [period, settings.weekStartDay])

  const stats = useMemo(
    () => rangeStats(transactions, range.start, range.end),
    [transactions, range],
  )

  const cats = useMemo(
    () => spentByCategory(transactions, range.start, range.end),
    [transactions, range],
  )
  const maxCat = cats[0]?.minor ?? 0

  const small = useMemo(
    () => smallPurchaseStats(transactions, range.start, range.end, settings.smallThresholdMinor),
    [transactions, range, settings.smallThresholdMinor],
  )

  const topCat = cats[0]
  const biggestDay = useMemo(
    () => biggestSpendingDay(transactions, range.start, range.end),
    [transactions, range],
  )

  const largest = useMemo(
    () => largestTransactions(transactions, range.start, range.end, 5),
    [transactions, range],
  )

  const weekly = useMemo(() => weekSeries(transactions, 6, settings.weekStartDay), [transactions, settings.weekStartDay])
  const maxWeek = Math.max(...weekly.map((w) => w.spentMinor), 1)

  const canCompare = period === 'week'
  const prevRange =
    period === 'week'
      ? { start: addDays(range.start, -7), end: addDays(range.start, -1) }
      : { start: startOfMonth(previousMonthKey()), end: endOfMonth(previousMonthKey()) }
  const prevStats = useMemo(
    () => rangeStats(transactions, prevRange.start, prevRange.end),
    [transactions, prevRange],
  )

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="chart" size={24} />}
        title="No insights yet"
        desc="Analytics build themselves as you log real expenses and income."
      />
    )
  }

  return (
    <div>
      <Segmented
        value={period}
        onChange={(v) => setPeriod(v as Period)}
        options={[
          { value: 'week', label: 'This week' },
          { value: 'month', label: 'This month' },
          { value: 'all', label: 'All time' },
        ]}
        ariaLabel="Insight period"
      />

      <div style={{ height: 8 }} />

      <div className="metric-grid" style={{ marginBottom: 14 }}>
        <div className="metric">
          <div className="metric-label">Spent</div>
          <div className="metric-value money-mono">{formatMoneyCompact(stats.expenseMinor)}</div>
          <div className="metric-note">{range.label}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Received</div>
          <div className="metric-value money-mono" style={{ color: 'var(--primary-soft)' }}>
            {formatMoneyCompact(stats.incomeMinor)}
          </div>
          <div className="metric-note">{range.label}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Saved</div>
          <div className="metric-value money-mono" style={{ color: 'var(--blue)' }}>
            {formatMoneyCompact(stats.savedMinor)}
          </div>
          <div className="metric-note">savings contributions</div>
        </div>
        <div className="metric">
          <div className="metric-label">Net</div>
          <div className="metric-value money-mono" style={{ color: stats.incomeMinor - stats.expenseMinor >= 0 ? 'var(--primary-soft)' : 'var(--amber)' }}>
            {formatMoneyCompact(stats.incomeMinor - stats.expenseMinor)}
          </div>
          <div className="metric-note">received − spent</div>
        </div>
      </div>

      {canCompare && prevStats.count > 0 ? (
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14 }}>
          vs this time last week:{' '}
          <strong className="money-mono">
            {Math.abs(stats.expenseMinor - prevStats.expenseMinor) >= 100
              ? `${formatMoneyCompact(Math.abs(stats.expenseMinor - prevStats.expenseMinor))} ${stats.expenseMinor >= prevStats.expenseMinor ? 'more' : 'less'}`
              : 'about the same'}
          </strong>{' '}
          in spending.
        </p>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Spending trend</h2>
        </div>
        <div className="card chart-card">
          <p className="form-hint" style={{ marginBottom: 6 }}>
            Last 6 weeks · {formatMoneyCompact(Math.max(...weekly.map((w) => w.spentMinor), 0))} peak
          </p>
          <div className="chart-bars" role="img" aria-label="Weekly spending trend">
            {weekly.map((w, i) => (
              <div className="chart-col" key={w.weekStart}>
                <div
                  className="chart-bar spend"
                  style={{ height: `${Math.max(6, (w.spentMinor / maxWeek) * 100)}%` }}
                  title={`${formatISODateShort(w.weekStart)}: ${formatMoney(w.spentMinor)}`}
                >
                  {i === weekly.length - 1 ? (
                    <span className="chart-bar-value">{formatMoneyCompact(w.spentMinor)}</span>
                  ) : null}
                </div>
                <span className="chart-bar-label">{formatISODateShort(w.weekStart)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">By category</h2>
          {topCat ? (
            <span className="form-hint">
              Biggest: {categoryById(categories, topCat.categoryId)?.label}
            </span>
          ) : null}
        </div>
        {cats.length === 0 ? (
          <div className="card form-hint">No expenses in this period.</div>
        ) : (
          <div className="card spend-bar-row">
            {cats.map((c) => {
              const cat = categoryById(categories, c.categoryId)
              return (
                <div className="spend-bar-item" key={c.categoryId}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{categoryIcon(c.categoryId)}</span>
                    <span className="spend-bar-name">
                      {cat?.label ?? c.categoryId} ({c.count})
                    </span>
                  </div>
                  <div className="spend-bar-track">
                    <div
                      className="spend-bar-fill"
                      style={{ width: `${Math.max(4, (c.minor / maxCat) * 100)}%`, background: categoryColor(c.categoryId) }}
                    />
                  </div>
                  <span className="spend-bar-amount money-mono">{formatMoneyCompact(c.minor)}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {small.count >= 5 ? (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Small purchases</h2>
          </div>
          <div className="card insight">
            <div className="insight-kicker">
              <span className="confidence-dot" style={{ background: 'var(--amber)' }} />
              Hidden spending
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {small.count} purchases under {formatMoney(settings.smallThresholdMinor)} added up to{' '}
              <strong className="money-mono" style={{ color: 'var(--amber)' }}>
                {formatMoney(small.totalMinor)}
              </strong>{' '}
              in this period.
            </p>
          </div>
        </section>
      ) : null}

      {biggestDay ? (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Biggest spending day</h2>
          </div>
          <div className="card">
            <p style={{ fontSize: 15 }}>
              <strong>{dayName(biggestDay.date)}</strong> — {formatMoney(biggestDay.minor)} across{' '}
              {biggestDay.count} purchase{biggestDay.count === 1 ? '' : 's'}.
            </p>
          </div>
        </section>
      ) : null}

      {largest.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Largest transactions</h2>
          </div>
          <div className="card" style={{ padding: '4px 12px' }}>
            {largest.map((tx) => {
              const cat = categoryById(categories, tx.categoryId)
              return (
                <div className="tx-row" style={{ cursor: 'default' }} key={tx.id}>
                  <div className="tx-icon">{categoryIcon(tx.categoryId)}</div>
                  <div className="tx-main">
                    <div className="tx-title">{tx.description || tx.merchant || cat?.label}</div>
                    <div className="tx-sub">
                      {cat?.label} · {formatISODateShort(tx.date)}
                    </div>
                  </div>
                  <span className="tx-amount expense money-mono">{formatMoney(tx.amountMinor)}</span>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}