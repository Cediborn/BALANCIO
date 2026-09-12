import { useMemo } from 'react'
import { useBalancioStore } from '../store/appStore'
import { buildWeeklyReview } from '../lib/insights'
import { formatMoney, formatMoneyCompact } from '../lib/money'
import { categoryById } from '../lib/categories'
import { dayName, formatISODateShort, startOfWeek, todayISO } from '../lib/date'
import { EmptyState } from '../components/ui/Widgets'
import { Icon } from '../components/ui/Icon'
import { spentByCategory } from '../lib/analytics'
import { useNavStore } from '../store/navStore'

export function WeeklyReviewScreen() {
  const transactions = useBalancioStore((s) => s.transactions)
  const goals = useBalancioStore((s) => s.goals)
  const categories = useBalancioStore((s) => s.categories)
  const settings = useBalancioStore((s) => s.settings)
  const go = useNavStore((s) => s.go)

  const review = useMemo(
    () =>
      buildWeeklyReview(
        transactions,
        goals,
        settings.weekStartDay,
        settings.smallThresholdMinor,
      ),
    [transactions, goals, settings.weekStartDay, settings.smallThresholdMinor],
  )

  const weekStart = useMemo(() => startOfWeek(todayISO(), settings.weekStartDay), [settings.weekStartDay])
  const topCats = useMemo(() => spentByCategory(transactions, weekStart, todayISO()).slice(0, 4), [transactions, weekStart])

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="insight" size={24} />}
        title="No week to review yet"
        desc="Log a few transactions and Balancio will show your week’s story here."
      />
    )
  }

  const remaining = review.current.incomeMinor - review.current.expenseMinor
  const comparison = review.comparison
  const changeAbs = Math.abs(comparison.spentChangeMinor)
  const hasBaseline = comparison.previous.count > 0
  const changeText =
    hasBaseline && changeAbs >= 100
      ? comparison.spentChangeMinor >= 0
        ? `Spending is ${formatMoneyCompact(changeAbs)} higher than this time last week.`
        : `Spending is ${formatMoneyCompact(changeAbs)} lower than this time last week.`
      : hasBaseline
        ? 'Spending is about the same as this time last week.'
        : `No data from last week to compare yet — every week from here gives you a clearer picture.`

  const small = review.small

  return (
    <div>
      <section className="card review-hero">
        <div className="review-hero-title">This week, so far</div>
        <div
          className="review-hero-remaining money-mono"
          style={{ color: remaining >= 0 ? 'var(--primary-soft)' : 'var(--amber)' }}
        >
          {formatMoney(remaining)}
        </div>
        <div className="form-hint">left after spending and saving</div>
      </section>

      <div className="metric-grid" style={{ marginTop: 12 }}>
        <div className="metric">
          <div className="metric-label">Received</div>
          <div className="metric-value money-mono">{formatMoneyCompact(review.current.incomeMinor)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Spent</div>
          <div className="metric-value money-mono">{formatMoneyCompact(review.current.expenseMinor)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Saved</div>
          <div className="metric-value money-mono" style={{ color: 'var(--blue)' }}>
            {formatMoneyCompact(review.current.savedMinor)}
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">Transactions</div>
          <div className="metric-value money-mono" style={{ fontSize: 20 }}>
            {review.current.count}
          </div>
        </div>
      </div>

      {topCats.length > 0 ? (
        <section className="section">
          <h2 className="section-title" style={{ marginBottom: 10 }}>
            Where your money went
          </h2>
          <div className="card spend-bar-row">
            {topCats.map((c, i) => {
              const cat = categoryById(categories, c.categoryId)
              return (
                <div className="spend-bar-item" key={c.categoryId}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)', minWidth: 16 }}>
                      {i + 1}
                    </span>
                    <span className="spend-bar-name">
                      {cat?.label ?? c.categoryId}
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 450 }}>
                        {' '}· {c.count} purchase{c.count === 1 ? '' : 's'}
                      </span>
                    </span>
                  </div>
                  <div className="spend-bar-track">
                    <div
                      className="spend-bar-fill"
                      style={{
                        width: `${Math.max(4, (c.minor / (topCats[0]?.minor ?? 1)) * 100)}%`,
                        background: i === 0 ? 'var(--primary)' : 'var(--surface-hover)',
                      }}
                    />
                  </div>
                  <span className="spend-bar-amount money-mono">{formatMoneyCompact(c.minor)}</span>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 10 }}>
          What changed
        </h2>
        <div className="card">
          <p className="observation">{changeText}</p>
          {review.biggestDay ? (
            <p className="observation" style={{ marginTop: 10 }}>
              {dayName(review.biggestDay.date)} was your biggest spending day so far (
              {formatMoney(review.biggestDay.minor)}).
            </p>
          ) : null}
          {small.count >= 3 ? (
            <p className="observation" style={{ marginTop: 10 }}>
              {small.count} purchases under {formatMoney(settings.smallThresholdMinor)} added up to{' '}
              {formatMoney(small.totalMinor)} this week. They looked tiny on their own.
            </p>
          ) : null}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 10 }}>
          Insights
        </h2>
        {review.insights.length > 0 ? (
          <div className="insight-list">
            {review.insights.map((insight) => (
              <article className="insight" key={insight.id}>
                <div className="insight-kicker">
                  <span
                    className="confidence-dot"
                    style={{
                      background:
                        insight.tone === 'warning'
                          ? 'var(--amber)'
                          : insight.tone === 'positive'
                            ? 'var(--primary)'
                            : 'var(--blue)',
                    }}
                  />
                  {insight.title}
                </div>
                <p className="insight-body" style={{ marginTop: 4 }}>{insight.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="card form-hint">
            Keep logging and the insights start arriving within a week or two.
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Largest expenses</h2>
          <button className="link-btn" onClick={() => go('insights')}>
            Analytics <Icon name="chevron-right" size={14} />
          </button>
        </div>
        <div className="card" style={{ padding: '4px 12px' }}>
          {review.largest.length === 0 ? (
            <p className="form-hint" style={{ padding: '12px 4px' }}>
              No expenses logged yet this week.
            </p>
          ) : (
            review.largest.map((tx) => {
              const cat = categoryById(categories, tx.categoryId)
              return (
                <div className="tx-row" style={{ cursor: 'default' }} key={tx.id}>
                  <div className="tx-icon">
                    {(tx.description || tx.merchant || cat?.label || '·').slice(0, 1)}
                  </div>
                  <div className="tx-main">
                    <div className="tx-title">{tx.description || tx.merchant || cat?.label}</div>
                    <div className="tx-sub">
                      {cat?.label} · {formatISODateShort(tx.date)}
                    </div>
                  </div>
                  <span className="tx-amount expense money-mono">{formatMoney(tx.amountMinor)}</span>
                </div>
              )
            })
          )}
        </div>
      </section>

      {review.savingsProgress.length > 0 ? (
        <section className="section">
          <h2 className="section-title" style={{ marginBottom: 10 }}>
            Savings
          </h2>
          <div className="insight-list">
            {review.savingsProgress.map((g) => (
              <div className="card insight" key={g.name}>
                <div className="insight-kicker">
                  <span className="confidence-dot" style={{ background: 'var(--primary)' }} />
                  {g.name}
                </div>
                <p className="insight-body" style={{ marginTop: 4 }}>
                  {g.pct}% funded — {g.remainingMinor > 0 ? `${formatMoney(g.remainingMinor)} to go` : 'fully funded'}.
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}