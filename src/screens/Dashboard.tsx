import { useMemo } from 'react'
import { useBalancioStore, balanceBreakdown } from '../store/appStore'
import { useNavStore } from '../store/navStore'
import { useEntryStore } from '../store/entryStore'
import {
  currentWindow,
  rangeStats,
  compareWeeks,
  spentByCategory,
} from '../lib/analytics'
import { generateInsights } from '../lib/insights'
import { formatMoney, formatMoneyCompact } from '../lib/money'
import { categoryById, categoryColor } from '../lib/categories'
import { categoryIcon } from '../lib/categoryIcons'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Widgets'
import { goalPct, remainingMinor } from '../lib/savings'
import { formatISODateShort } from '../lib/date'
import type { Category } from '../lib/types'

function CategoryBar({
  categoryId,
  label,
  minor,
  max,
}: {
  categoryId: string
  label: string
  minor: number
  max: number
}) {
  const width = max > 0 ? Math.max(4, (minor / max) * 100) : 0
  return (
    <div className="spend-bar-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{categoryIcon(categoryId)}</span>
        <span className="spend-bar-name">{label}</span>
      </div>
      <div className="spend-bar-track">
        <div
          className="spend-bar-fill"
          style={{ width: `${width}%`, background: categoryColor(categoryId) }}
        />
      </div>
      <span className="spend-bar-amount money-mono">{formatMoneyCompact(minor)}</span>
    </div>
  )
}

export function Dashboard() {
  const startingBalanceMinor = useBalancioStore((s) => s.startingBalanceMinor)
  const transactions = useBalancioStore((s) => s.transactions)
  const categories = useBalancioStore((s) => s.categories)
  const goals = useBalancioStore((s) => s.goals)
  const settings = useBalancioStore((s) => s.settings)
  const go = useNavStore((s) => s.go)

  const breakdown = useMemo(
    () => balanceBreakdown(startingBalanceMinor, transactions),
    [startingBalanceMinor, transactions],
  )

  const week = useMemo(() => currentWindow(settings.weekStartDay), [settings.weekStartDay])
  const weekStats = useMemo(
    () => rangeStats(transactions, week.start, week.end),
    [transactions, week],
  )
  const comparison = useMemo(
    () => compareWeeks(transactions, settings.weekStartDay),
    [transactions, settings.weekStartDay],
  )

  const topCategories = useMemo(
    () => spentByCategory(transactions, week.start, week.end).slice(0, 4),
    [transactions, week],
  )
  const maxCat = topCategories[0]?.minor ?? 0

  const insights = useMemo(
    () =>
      generateInsights({
        transactions,
        goals,
        weekStartDay: settings.weekStartDay,
        smallThresholdMinor: settings.smallThresholdMinor,
        startingBalanceMinor,
      }).slice(0, 3),
    [transactions, goals, settings.weekStartDay, settings.smallThresholdMinor, startingBalanceMinor],
  )

  const nearestGoal = useMemo(() => {
    const active = goals.filter((g) => g.targetMinor > 0 && g.currentMinor < g.targetMinor)
    if (active.length === 0) return null
    return [...active].sort((a, b) => b.currentMinor / b.targetMinor - a.currentMinor / a.targetMinor)[0]
  }, [goals])

  const hasData = transactions.length > 0 || startingBalanceMinor > 0

  if (!hasData) {
    return <DashboardEmpty />
  }

  const spentChange = comparison.spentChangeMinor
  const showChange =
    comparison.previous.count > 0 &&
    spentChange !== 0 &&
    Math.abs(spentChange) >= 100

  return (
    <div>
      <section className="balance-hero" aria-label="Your balance">
        <div className="balance-label">Balance</div>
        <div className="balance-value money-mono">{formatMoney(breakdown.balanceMinor)}</div>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-label">Received</div>
            <div className="stat-value positive money-mono">{formatMoneyCompact(weekStats.incomeMinor)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Spent</div>
            <div className="stat-value negative money-mono">{formatMoneyCompact(weekStats.expenseMinor)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Saved</div>
            <div className="stat-value saved money-mono">{formatMoneyCompact(weekStats.savedMinor)}</div>
          </div>
        </div>
        <p className="form-hint" style={{ marginTop: 10 }}>
          This week · {formatISODateShort(week.start)} → {formatISODateShort(week.end)}
        </p>
      </section>

      {showChange ? (
        <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
          You spent{' '}
          <strong className="money-mono" style={{ color: spentChange > 0 ? 'var(--amber)' : 'var(--primary-soft)' }}>
            {formatMoneyCompact(Math.abs(spentChange))}
          </strong>{' '}
          {spentChange > 0 ? 'more' : 'less'} than this time last week.
        </p>
      ) : null}

      <QuickAddCard />

      <section className="section" aria-label="Where your money went">
        <div className="section-head">
          <h2 className="section-title">Where your money went</h2>
          <button className="link-btn" onClick={() => go('insights')}>
            This week <Icon name="chevron-right" size={14} />
          </button>
        </div>
        {topCategories.length > 0 ? (
          <div className="card spend-bar-row">
            {topCategories.map((c) => {
              const cat: Category | undefined = categoryById(categories, c.categoryId)
              return (
                <CategoryBar
                  key={c.categoryId}
                  categoryId={c.categoryId}
                  label={cat?.label ?? c.categoryId}
                  minor={c.minor}
                  max={maxCat}
                />
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Nothing spent yet this week. When you log an expense, it shows up here.
          </div>
        )}
      </section>

      {insights.length > 0 ? (
        <section className="section" aria-label="Insights">
          <div className="section-head">
            <h2 className="section-title">Things worth noticing</h2>
            <button className="link-btn" onClick={() => go('weekly')}>
              See week <Icon name="chevron-right" size={14} />
            </button>
          </div>
          <div className="insight-list">
            {insights.map((insight) => (
              <article className="insight" key={insight.id}>
                <div className="insight-kicker">
                  <span
                    className="confidence-dot"
                    style={{ background: insight.tone === 'warning' ? 'var(--amber)' : insight.tone === 'positive' ? 'var(--primary)' : 'var(--blue)' }}
                  />
                  {insight.kind === 'small_purchases' ? 'Hidden spending' :
                   insight.kind === 'spending_change' ? 'Trend' :
                   insight.kind === 'unusually_large' ? 'Check this' :
                   insight.kind === 'savings_progress' ? 'Savings' :
                   'Your week'}
                </div>
                <h3 className="insight-title">{insight.title}</h3>
                <p className="insight-body">{insight.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {nearestGoal ? (
        <section className="section" aria-label="Savings">
          <div className="section-head">
            <h2 className="section-title">Savings</h2>
            <button className="link-btn" onClick={() => go('savings')}>
              All goals <Icon name="chevron-right" size={14} />
            </button>
          </div>
          <div className="card goal-card">
            <div className="goal-top">
              <div>
                <div className="goal-name">{nearestGoal.name}</div>
                <div className="goal-meta">
                  {remainingMinor(nearestGoal)} to go
                </div>
              </div>
              <div className="badge blue money-mono">{goalPct(nearestGoal)}%</div>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={goalPct(nearestGoal)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-fill"
                style={{ width: `${goalPct(nearestGoal)}%` }}
              />
            </div>
            <div className="goal-amounts">
              <span className="goal-current money-mono">{formatMoneyCompact(nearestGoal.currentMinor)}</span>
              <span className="goal-target">of {formatMoneyCompact(nearestGoal.targetMinor)}</span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <button
          className="card card-press"
          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
          onClick={() => go('weekly')}
        >
          <div className="tx-icon" style={{ background: 'var(--primary-dim)', color: 'var(--primary-soft)' }}>
            <Icon name="insight" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 650 }}>Your week at a glance</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Full summary with what changed
            </div>
          </div>
          <Icon name="chevron-right" size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
      </section>
    </div>
  )
}

function QuickAddCard() {
  const openQuick = useEntryStore((s) => s.openQuick)
  return (
    <section className="section" aria-label="Quick add">
      <button
        className="quick-add"
        style={{ width: '100%', textAlign: 'left', minHeight: 56, display: 'flex', alignItems: 'center' }}
        onClick={openQuick}
      >
        <div className="qa-row" style={{ width: '100%' }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--primary-dim)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <Icon name="plus" size={18} />
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>What did you spend? e.g. 15 waakye</span>
          <Icon name="chevron-right" size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </div>
      </button>
    </section>
  )
}

function DashboardEmpty() {
  const openQuick = useEntryStore((s) => s.openQuick)
  const go = useNavStore((s) => s.go)
  return (
    <div>
      <section className="balance-hero" aria-label="Your balance">
        <div className="balance-label">Balance</div>
        <div className="balance-value money-mono">GH₵0.00</div>
      </section>
      <div style={{ height: 28 }} />
      <EmptyState
        icon={<Icon name="home" size={26} />}
        title="Your money story starts here."
        desc="Add your first expense and Balancio will show you where your money goes."
        action={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
            <Button variant="primary" size="lg" block onClick={openQuick}>
              <Icon name="plus" size={18} />
              Add your first expense
            </Button>
            <Button variant="ghost" size="lg" block onClick={() => go('settings')}>
              Set your starting balance
            </Button>
          </div>
        }
      />
    </div>
  )
}