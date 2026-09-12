import { useMemo, useState } from 'react'
import { useBalancioStore } from '../store/appStore'
import { useToastStore } from '../components/ui/Toast'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { ProgressBar, EmptyState } from '../components/ui/Widgets'
import { Icon } from '../components/ui/Icon'
import { formatMoney, formatMoneyCompact, parseAmountToMinor } from '../lib/money'
import { todayISO } from '../lib/date'
import { goalContributions, goalPct, goalStatus, remainingMinor } from '../lib/savings'
import { CHALLENGE_DEFS, computeChallengeProgress } from '../lib/challenges'
import type { SavingsGoal } from '../lib/types'

export function SavingsScreen() {
  const goals = useBalancioStore((s) => s.goals)
  const transactions = useBalancioStore((s) => s.transactions)
  const activeChallenges = useBalancioStore((s) => s.activeChallenges)
  const startChallenge = useBalancioStore((s) => s.startChallenge)
  const abandonChallenge = useBalancioStore((s) => s.abandonChallenge)
  const [showNew, setShowNew] = useState(false)
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)
  const [contributeTo, setContributeTo] = useState<SavingsGoal | null>(null)

  const totalSavedTargets = goals.filter((g) => g.targetMinor > 0)
  const aggregatePct = totalSavedTargets.length
    ? Math.round(
        (totalSavedTargets.reduce((s, g) => s + g.currentMinor, 0) /
          totalSavedTargets.reduce((s, g) => s + g.targetMinor, 0)) *
          100,
      )
    : 0

  const allTimeSaved = useMemo(
    () => transactions.filter((t) => t.type === 'savings').reduce((s, t) => s + t.amountMinor, 0),
    [transactions],
  )

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div className="metric-label">Total saved</div>
            <div className="goal-current money-mono" style={{ fontSize: 26 }}>
              {formatMoney(allTimeSaved)}
            </div>
          </div>
          {totalSavedTargets.length > 0 ? (
            <span className="badge green money-mono">{aggregatePct}% of all goals</span>
          ) : null}
        </div>
        {totalSavedTargets.length > 0 ? (
          <ProgressBar fraction={aggregatePct / 100} />
        ) : null}
      </div>

      <div className="section-head" style={{ marginTop: 4 }}>
        <h2 className="section-title">Goals</h2>
        <button className="link-btn" onClick={() => setShowNew(true)}>
          <Icon name="plus" size={16} /> New goal
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<Icon name="savings" size={24} />}
          title="Nothing saved toward yet"
          desc="Goals make saving feel real. Create one for a laptop fund, rent, or anything you're working toward."
          action={
            <Button variant="soft" onClick={() => setShowNew(true)}>
              <Icon name="plus" size={18} /> Create a goal
            </Button>
          }
        />
      ) : (
        goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            txCount={goalContributions(transactions, goal.id).length}
            onContribute={() => setContributeTo(goal)}
            onEdit={() => setEditGoal(goal)}
          />
        ))
      )}

      <div className="section-head" style={{ marginTop: 26 }}>
        <h2 className="section-title">Challenges</h2>
      </div>
      <p className="form-hint" style={{ marginBottom: 12 }}>
        Optional. Pick one, and Balancio quietly tracks your progress.
      </p>

      {CHALLENGE_DEFS.map((def) => {
        const active = activeChallenges.find((c) => c.defId === def.id)
        const progress = active
          ? computeChallengeProgress(
              def.id,
              transactions,
              new Date(active.startedAt).toISOString().slice(0, 10),
              todayISO(),
              def.defaultParams,
            )
          : null

        return (
          <div className="card challenge-card" style={{ marginBottom: 10 }} key={def.id}>
            <div className="challenge-head">
              <div>
                <div className="challenge-title">{def.title}</div>
                <div className="challenge-desc" style={{ marginTop: 2 }}>{def.description}</div>
                <span className="badge" style={{ marginTop: 8 }}>{def.durationLabel}</span>
              </div>
            </div>
            {active && progress ? (
              <div>
                <ProgressBar
                  fraction={progress.fraction}
                  warn={progress.defId === 'reset3' && progress.fraction === 0}
                  done={progress.done}
                />
                <div className="challenge-progress-line" style={{ marginTop: 6 }}>
                  <span style={{ color: progress.done ? 'var(--primary-soft)' : 'var(--text-secondary)' }}>
                    {progress.done ? 'Completed' : progress.current}
                  </span>
                  <span>{progress.target}</span>
                </div>
                {progress.note ? <p className="form-hint" style={{ marginTop: 8 }}>{progress.note}</p> : null}
                <div style={{ marginTop: 10 }}>
                  <Button variant="ghost" size="sm" onClick={() => abandonChallenge(active.id)}>
                    Stop challenge
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Button variant="soft" size="sm" onClick={() => startChallenge(def.id)}>
                  Start challenge
                </Button>
              </div>
            )}
          </div>
        )
      })}

      {showNew ? (
        <GoalFormSheet
          onClose={() => setShowNew(false)}
          onDone={() => setShowNew(false)}
        />
      ) : null}
      {editGoal ? (
        <GoalFormSheet
          goal={editGoal}
          onClose={() => setEditGoal(null)}
          onDone={() => setEditGoal(null)}
        />
      ) : null}
      {contributeTo ? (
        <ContributeSheet goal={contributeTo} onClose={() => setContributeTo(null)} />
      ) : null}
    </div>
  )
}

function GoalCard({
  goal,
  txCount,
  onContribute,
  onEdit,
}: {
  goal: SavingsGoal
  txCount: number
  onContribute: () => void
  onEdit: () => void
}) {
  const status = goalStatus(goal)
  const pct = goalPct(goal)
  const remaining = remainingMinor(goal)

  return (
    <div className="card goal-card" style={{ marginBottom: 10 }}>
      <div className="goal-top">
        <div>
          <div className="goal-name">{goal.name}</div>
          <div className="goal-meta">
            {goal.deadline ? `Deadline ${goal.deadline} · ` : ''}
            {txCount} contribution{txCount === 1 ? '' : 's'}
          </div>
        </div>
        <span className={`badge ${status === 'completed' ? 'green' : status === 'missed' ? 'red' : 'blue'}`}>
          {status === 'completed' ? 'Done' : status === 'missed' ? 'Missed deadline' : `${pct}%`}
        </span>
      </div>
      <ProgressBar
        fraction={pct / 100}
        done={status === 'completed'}
        warn={goal.deadline ? goal.deadline <= todayISO() && status !== 'completed' : false}
      />
      <div className="goal-amounts">
        <span className="goal-current money-mono">{formatMoneyCompact(goal.currentMinor)}</span>
        <span className="goal-target">
          of {formatMoneyCompact(goal.targetMinor)}
          {remaining > 0 ? ` · ${formatMoneyCompact(remaining)} to go` : ''}
        </span>
      </div>
      <div className="goal-actions">
        <Button variant="primary" size="sm" block onClick={onContribute}>
          <Icon name="plus" size={16} /> Add money
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${goal.name}`}>
          <Icon name="edit" size={16} />
        </Button>
      </div>
    </div>
  )
}

function GoalFormSheet({
  goal,
  onClose,
  onDone,
}: {
  goal?: SavingsGoal
  onClose: () => void
  onDone: () => void
}) {
  const addGoal = useBalancioStore((s) => s.addGoal)
  const updateGoal = useBalancioStore((s) => s.updateGoal)
  const deleteGoal = useBalancioStore((s) => s.deleteGoal)
  const toast = useToastStore((s) => s.show)

  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(goal ? String(goal.targetMinor / 100) : '')
  const [current, setCurrent] = useState(goal ? String(goal.currentMinor / 100) : '')
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')
  const [error, setError] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)

  function submit() {
    if (!name.trim()) {
      setError('Give your goal a name, like “New laptop”.')
      return
    }
    const targetMinor = parseAmountToMinor(target)
    const currentMinor = parseAmountToMinor(current || '0')
    if (targetMinor === null || targetMinor <= 0) {
      setError('Set a target amount above 0.')
      return
    }
    if (goal) {
      updateGoal(goal.id, {
        name: name.trim(),
        targetMinor,
        currentMinor: currentMinor ?? goal.currentMinor,
        deadline: deadline || null,
      })
      toast('Goal updated')
    } else {
      addGoal({
        name: name.trim(),
        targetMinor,
        currentMinor: currentMinor ?? 0,
        deadline: deadline || null,
      })
      toast('Goal created')
    }
    onDone()
  }

  return (
    <Sheet open onClose={onClose} title={goal ? 'Edit goal' : 'New savings goal'}>
      {confirmDel ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <h3 style={{ fontSize: 17, fontWeight: 650, marginBottom: 6 }}>Delete “{goal?.name}”?</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
            Its contribution history stays, but the goal itself is removed.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" block onClick={() => setConfirmDel(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                if (goal) deleteGoal(goal.id)
                toast('Goal deleted')
                onDone()
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="field">
            <label className="field-label" htmlFor="goal-name">Name</label>
            <input id="goal-name" className="input" placeholder="e.g. New laptop" value={name} onChange={(e) => { setName(e.target.value); setError(null) }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label className="field-label" htmlFor="goal-target">Target (GH₵)</label>
              <input id="goal-target" className="input" inputMode="decimal" placeholder="2500" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="goal-current">Already saved (GH₵)</label>
              <input id="goal-current" className="input" inputMode="decimal" placeholder="0" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="goal-deadline">Deadline (optional)</label>
            <input id="goal-deadline" className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <Button variant="primary" size="lg" block onClick={submit}>
            {goal ? 'Save changes' : 'Create goal'}
          </Button>
          {goal ? (
            <Button variant="ghost" block onClick={() => setConfirmDel(true)} style={{ marginTop: 8 }}>
              Delete goal
            </Button>
          ) : null}
        </div>
      )}
    </Sheet>
  )
}

function ContributeSheet({ goal, onClose }: { goal: SavingsGoal; onClose: () => void }) {
  const contribute = useBalancioStore((s) => s.contribute)
  const toast = useToastStore((s) => s.show)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const pct = goalPct(goal)
  const remaining = remainingMinor(goal)

  function submit() {
    const minor = parseAmountToMinor(amount)
    if (minor === null || minor <= 0) {
      setError('Enter an amount to save.')
      return
    }
    if (minor > remaining && goal.targetMinor > 0) {
      if (!window.confirm(`${formatMoney(minor)} is more than the ${formatMoney(remaining)} you have left. Save it anyway?`)) {
        return
      }
    }
    contribute(goal.id, minor, note || undefined)
    toast(`${formatMoney(minor)} saved to ${goal.name}`)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={`Add to “${goal.name}”`}>
      <div className="card" style={{ marginBottom: 14 }}>
        <ProgressBar fraction={pct / 100} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span className="money-mono">{formatMoneyCompact(goal.currentMinor)} saved</span>
          <span className="money-mono">
            {remaining > 0 ? `${formatMoneyCompact(remaining)} to go` : 'Goal reached'}
          </span>
        </div>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="contrib-amount">Amount</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 650, color: 'var(--text-secondary)' }}>GH₵</span>
          <input id="contrib-amount" className="input input-amount" style={{ paddingLeft: 62 }} inputMode="decimal" placeholder="0.00" value={amount} autoFocus onChange={(e) => { setAmount(e.target.value); setError(null) }} />
        </div>
      </div>
      <div className="filter-row" style={{ marginBottom: 12 }}>
        {['5', '10', '20', '50'].map((a) => (
          <button key={a} type="button" className={`chip${amount === a ? ' active' : ''}`} onClick={() => { setAmount(a); setError(null) }}>
            GH₵{a}
          </button>
        ))}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="contrib-note">Note (optional)</label>
        <input id="contrib-note" className="input" placeholder="e.g. from my side hustle" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <Button variant="primary" size="lg" block onClick={submit}>
        <Icon name="savings" size={18} /> Save this amount
      </Button>
    </Sheet>
  )
}