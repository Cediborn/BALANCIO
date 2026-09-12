import { useState } from 'react'
import { useBalancioStore } from '../store/appStore'
import { useNavStore } from '../store/navStore'
import { Button } from '../components/ui/Button'
import { Logo } from '../components/brand/Logo'
import { Icon } from '../components/ui/Icon'
import { parseAmountToMinor, formatMoney } from '../lib/money'
import { parseExpenseText } from '../lib/parse/parser'
import { todayISO, nowTime } from '../lib/date'

type Step = 0 | 1 | 2 | 3 | 4

export function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0)

  return (
    <div className="ob-wrap" style={{ maxWidth: 480, margin: '0 auto', padding: '32px 0 40px' }}>
      <div className="ob-brand">
        <Logo size={40} />
        <span style={{ fontSize: 22, fontWeight: 750 }}>Balancio</span>
      </div>

      {step === 0 ? (
        <Welcome onNext={() => setStep(1)} />
      ) : null}
      {step === 1 ? (
        <ObStep step={step} total={3} onBack={() => setStep(0)}>
          <BalanceStep onNext={() => setStep(2)} onSkip={() => setStep(2)} />
        </ObStep>
      ) : null}
      {step === 2 ? (
        <ObStep step={step} total={3} onBack={() => setStep(1)}>
          <FirstTxStep onNext={() => setStep(3)} onSkip={() => setStep(3)} />
        </ObStep>
      ) : null}
      {step === 3 ? (
        <ObStep step={step} total={3} onBack={() => setStep(2)}>
          <GoalStep onNext={() => setStep(4)} onSkip={() => setStep(4)} />
        </ObStep>
      ) : null}
      {step === 4 ? <Done /> : null}
    </div>
  )
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <>
      <h1 className="ob-title">
        Know where your
        <br />
        money went.
      </h1>
      <p className="ob-sub" style={{ marginTop: 14 }}>
        Balancio is a money notebook for students in Ghana. Log expenses in seconds — like
        “15 waakye” — and let Balancio show what’s actually eating your money.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 28 }}>
        <Button variant="primary" size="lg" block onClick={onNext}>
          Get started
        </Button>
      </div>
      <ul style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          'Natural-language entry — type “10 trotro”, not forms',
          'Weekly insights built from your real data',
          'Works offline. Your data stays on your phone',
          'No bank or MoMo connection. Ever.',
        ].map((item) => (
          <li key={item} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
            <Icon name="check" size={16} style={{ color: 'var(--primary)', flex: 'none', marginTop: 3 }} />
            {item}
          </li>
        ))}
      </ul>
    </>
  )
}

function ObStep({
  step,
  total,
  onBack,
  children,
}: {
  step: Step
  total: number
  onBack: () => void
  children: React.ReactNode
}) {
  const idx = step - 1
  return (
    <>
      <div className="ob-steps" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`ob-step${i <= idx ? ' done' : ''}`} />
        ))}
      </div>
      <button className="link-btn" onClick={onBack} style={{ marginBottom: 18 }}>
        <Icon name="chevron-left" size={16} /> Back
      </button>
      {children}
    </>
  )
}

function BalanceStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const completeOnboarding = useBalancioStore((s) => s.completeOnboarding)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const minor = parseAmountToMinor(value)
    if (minor === null) {
      setError('Enter a number, like 150 or 120.50.')
      return
    }
    completeOnboarding(minor)
    onNext()
  }

  return (
    <>
      <h1 className="ob-title" style={{ fontSize: 22 }}>What’s your current balance?</h1>
      <p className="ob-sub" style={{ marginTop: 8 }}>
        Check your wallet or MoMo. This is your starting point — Balancio subtracts expenses
        and adds income from here.
      </p>
      <div style={{ marginTop: 20 }}>
        <label className="field-label" htmlFor="ob-bal">Amount</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 650, color: 'var(--text-secondary)' }}>GH₵</span>
            <input
              id="ob-bal"
              className="input"
              style={{ minHeight: 56, paddingLeft: 58 }}
              inputMode="decimal"
              placeholder="0.00"
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            />
          </div>
        </div>
      </div>
      {error ? <div className="form-error" role="alert" style={{ marginTop: 10 }}>{error}</div> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        <Button variant="primary" size="lg" block onClick={submit}>
          {value.trim() ? `Start with ${formatMoney(parseAmountToMinor(value) ?? 0)}` : 'Start with GH₵0.00'}
        </Button>
        <Button variant="ghost" size="lg" block onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </>
  )
}

function FirstTxStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const addTransaction = useBalancioStore((s) => s.addTransaction)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  function run() {
    const t = text.trim()
    if (!t) {
      setError('Try typing something like “15 waakye”.')
      return
    }
    const result = parseExpenseText(t)
    if (result.parsed) {
      addTransaction({
        type: result.parsed.type,
        amountMinor: result.parsed.amountMinor,
        categoryId: result.parsed.categoryId,
        description: result.parsed.description,
        merchant: result.parsed.merchant,
        date: result.parsed.date ?? todayISO(),
        time: result.parsed.time ?? nowTime(),
        source: result.parsed.source,
        goalId: null,
      })
      setSaved(`${formatMoney(result.parsed.amountMinor)} logged`)
      setText('')
      setError(null)
    } else {
      setError(result.error ?? 'Couldn’t understand that one.')
    }
  }

  return (
    <>
      <h1 className="ob-title" style={{ fontSize: 22 }}>What did you spend today?</h1>
      <p className="ob-sub" style={{ marginTop: 8 }}>
        Describe it like you’d tell a friend. Balancio figures out the rest.
      </p>

      {saved ? (
        <div className="card" style={{ marginTop: 20, borderColor: 'var(--primary)', background: 'var(--primary-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="check" size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600 }}>{saved}. Nice and fast, right?</span>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <label className="field-label" htmlFor="ob-tx">Describe the expense</label>
        <input
          id="ob-tx"
          className="input"
          style={{ minHeight: 52 }}
          placeholder="e.g. 15 waakye"
          autoFocus
          value={text}
          onChange={(e) => { setText(e.target.value); setError(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter') run() }}
        />
      </div>
      <div className="filter-row" style={{ marginTop: 10 }}>
        {['15 waakye', '10 trotro', '30 data'].map((ex) => (
          <button key={ex} type="button" className="chip" onClick={() => { setText(ex); setSaved(null); setError(null) }}>
            {ex}
          </button>
        ))}
      </div>
      {error ? <div className="form-error" role="alert" style={{ marginTop: 10 }}>{error}</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        <Button variant="primary" size="lg" block onClick={run} disabled={!text.trim()}>
          Add it
        </Button>
        {saved ? (
          <Button variant="soft" size="lg" block onClick={onNext}>
            Looks good, continue →
          </Button>
        ) : (
          <Button variant="ghost" size="lg" block onClick={onSkip}>
            Skip
          </Button>
        )}
      </div>
    </>
  )
}

function GoalStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const addGoal = useBalancioStore((s) => s.addGoal)
  const goals = useBalancioStore((s) => s.goals)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const minor = parseAmountToMinor(target)
    if (!name.trim()) {
      setError('Name the thing you’re saving for.')
      return
    }
    if (minor === null || minor <= 0) {
      setError('Set a target above 0.')
      return
    }
    addGoal({ name: name.trim(), targetMinor: minor, currentMinor: 0, deadline: null })
    onNext()
  }

  return (
    <>
      <h1 className="ob-title" style={{ fontSize: 22 }}>
        Something you’re saving toward?
      </h1>
      <p className="ob-sub" style={{ marginTop: 8 }}>
        Optional, but it makes saving feel real. A laptop, rent, a trip home…
      </p>
      <div className="field" style={{ marginTop: 20 }}>
        <label className="field-label" htmlFor="ob-name">Goal name</label>
        <input id="ob-name" className="input" placeholder="e.g. New laptop" value={name} onChange={(e) => { setName(e.target.value); setError(null) }} />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="ob-target">Target amount (GH₵)</label>
        <input id="ob-target" className="input" inputMode="decimal" placeholder="2500" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <Button variant="primary" size="lg" block onClick={submit}>
          Create goal
        </Button>
        <Button variant="ghost" size="lg" block onClick={onSkip}>
          Skip
        </Button>
      </div>
      {goals.length > 0 ? (
        <p className="form-hint" style={{ marginTop: 14, textAlign: 'center' }}>
          You already have {goals.length} goal{goals.length === 1 ? '' : 's'}.
        </p>
      ) : null}
    </>
  )
}

function Done() {
  const go = useNavStore((s) => s.go)
  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          background: 'var(--primary-dim)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <Icon name="check" size={34} />
      </div>
      <h1 className="ob-title" style={{ fontSize: 24 }}>You’re set.</h1>
      <p className="ob-sub" style={{ marginTop: 10 }}>
        Log your next expense like “20 food” and watch the dashboard start explaining
        your money.
      </p>
      <Button variant="primary" size="lg" block onClick={() => go('home')} style={{ marginTop: 28 }}>
        Open Balancio
      </Button>
    </div>
  )
}