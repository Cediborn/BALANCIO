import { useMemo, useState } from 'react'
import { useBalancioStore } from '../store/appStore'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { Segmented } from '../components/ui/Widgets'
import { Icon } from '../components/ui/Icon'
import { useToastStore } from '../components/ui/Toast'
import { formatMoney, parseAmountToMinor } from '../lib/money'
import { categoryColor } from '../lib/categories'

export function SettingsScreen() {
  const settings = useBalancioStore((s) => s.settings)
  const updateSettings = useBalancioStore((s) => s.updateSettings)
  const startingBalanceMinor = useBalancioStore((s) => s.startingBalanceMinor)
  const transactions = useBalancioStore((s) => s.transactions)
  const categories = useBalancioStore((s) => s.categories)
  const addCategory = useBalancioStore((s) => s.addCategory)
  const resetAll = useBalancioStore((s) => s.resetAll)
  const toast = useToastStore((s) => s.show)

  const [balanceOpen, setBalanceOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [dangerOpen, setDangerOpen] = useState(false)

  const customCats = useMemo(() => categories.filter((c) => !c.builtin), [categories])

  function exportData() {
    const payload = {
      app: 'balancio',
      version: 1,
      exportedAt: new Date().toISOString(),
      startingBalanceMinor,
      settings,
      transactions,
      categories,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `balancio-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('Export downloaded')
    setExportOpen(false)
  }

  return (
    <div>
      <section className="card" style={{ marginBottom: 12 }}>
        <div className="settings-item">
          <div>
            <div className="settings-item-label">Starting balance</div>
            <div className="settings-item-desc money-mono">{formatMoney(startingBalanceMinor)}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setBalanceOpen(true)}>
            Change
          </Button>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Preferences
        </h2>
        <div className="card" style={{ padding: '4px 14px' }}>
          <div className="settings-item">
            <div>
              <div className="settings-item-label">Small purchase limit</div>
              <div className="settings-item-desc">
                Purchases at or under this count as “small” in insights.
              </div>
            </div>
          </div>
          <div style={{ paddingBottom: 12 }}>
            <Segmented
              value={String(settings.smallThresholdMinor / 100)}
              onChange={(v) => updateSettings({ smallThresholdMinor: Number(v) * 100 })}
              options={[
                { value: '5', label: 'GH₵5' },
                { value: '10', label: 'GH₵10' },
                { value: '20', label: 'GH₵20' },
              ]}
              ariaLabel="Small purchase threshold"
            />
          </div>
          <div className="divider" />
          <div className="settings-item">
            <div>
              <div className="settings-item-label">Week starts on Monday</div>
              <div className="settings-item-desc">Aligns weekly summaries with the school week.</div>
            </div>
            <Switch
              on={settings.weekStartDay === 1}
              onToggle={() => updateSettings({ weekStartDay: settings.weekStartDay === 1 ? 0 : 1 })}
              label="Monday start"
            />
          </div>
          <div className="divider" />
          <div className="settings-item">
            <div>
              <div className="settings-item-label">Reduce motion</div>
              <div className="settings-item-desc">Minimise animations and transitions.</div>
            </div>
            <Switch
              on={settings.reduceMotion}
              onToggle={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
              label="Reduce motion"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Categories
        </h2>
        <div className="card" style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c) => (
              <span className="chip" key={c.id} style={{ cursor: 'default' }}>
                <span className="chip-dot" style={{ background: categoryColor(c.id) }} />
                {c.label}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Button variant="ghost" size="sm" onClick={() => setCatOpen(true)}>
              <Icon name="plus" size={16} /> Add a custom category
            </Button>
          </div>
          {customCats.length > 0 ? (
            <p className="form-hint" style={{ marginTop: 8 }}>
              {customCats.length} custom categor{customCats.length === 1 ? 'y' : 'ies'} added.
            </p>
          ) : null}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Data
        </h2>
        <div className="card" style={{ padding: '4px 14px' }}>
          <div className="section" style={{ marginTop: 0 }}>
            <button className="settings-item" onClick={() => setExportOpen(true)}>
              <div>
                <div className="settings-item-label">Export data</div>
                <div className="settings-item-desc">Download everything as a JSON file.</div>
              </div>
              <Icon name="chevron-right" size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <div className="divider" />
          <button className="settings-item" style={{ color: 'var(--red)' }} onClick={() => setDangerOpen(true)}>
            <div>
              <div className="settings-item-label" style={{ fontWeight: 550 }}>Erase all data</div>
              <div className="settings-item-desc">Removes transactions, goals, and settings.</div>
            </div>
            <Icon name="chevron-right" size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          About
        </h2>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span className="form-hint">Version</span>
            <span>1.0.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 8 }}>
            <span className="form-hint">Currency</span>
            <span className="money-mono">GHS (GH₵)</span>
          </div>
          <p className="form-hint" style={{ marginTop: 14, lineHeight: 1.6 }}>
            Balancio is a local-first money notebook. It never connects to your bank, MoMo, or
            mobile-money account — and it doesn’t need to. All your data stays on this device.
          </p>
        </div>
      </section>

      {balanceOpen ? (
        <BalanceSheet onClose={() => setBalanceOpen(false)} current={startingBalanceMinor} />
      ) : null}
      {catOpen ? (
        <CategorySheet
          onClose={() => setCatOpen(false)}
          onAdd={(category) => {
            addCategory(category)
            toast(`Added “${category.label}”`)
          }}
        />
      ) : null}

      <Sheet open={exportOpen} onClose={() => setExportOpen(false)}>
        <p className="ob-sub" style={{ marginBottom: 14 }}>
          Your data export is a collection of everything Balancio stores locally. It contains no
          passwords or PINs — that information is never collected.
        </p>
        <Button variant="primary" size="lg" block onClick={exportData}>
          <Icon name="import" size={18} /> Download JSON
        </Button>
      </Sheet>

      <Sheet open={dangerOpen} onClose={() => setDangerOpen(false)} center>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <h3 style={{ fontSize: 17, fontWeight: 650, marginBottom: 6 }}>Erase everything?</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
            This permanently removes all transactions, goals, and settings from this device.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" block onClick={() => setDangerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                resetAll()
                setDangerOpen(false)
                toast('All data erased')
              }}
            >
              Erase
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch${on ? ' on' : ''}`}
      onClick={onToggle}
    />
  )
}

function BalanceSheet({ onClose, current }: { onClose: () => void; current: number }) {
  const setBalance = useBalancioStore((s) => s.setBalance)
  const toast = useToastStore((s) => s.show)
  const [value, setValue] = useState(current > 0 ? String(current / 100) : '')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const minor = parseAmountToMinor(value)
    if (minor === null || minor < 0) {
      setError('That number doesn’t look right.')
      return
    }
    setBalance(minor)
    toast(`Balance set to ${formatMoney(minor)}`)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title="Starting balance">
      <p className="ob-sub" style={{ marginBottom: 12 }}>
        The money you have right now — in your wallet, MoMo, or bank. Balancio subtracts
        expenses and adds income from here.
      </p>
      <div className="field">
        <label className="field-label" htmlFor="bal-input">Amount</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 650, color: 'var(--text-secondary)' }}>GH₵</span>
            <input id="bal-input" className="input" style={{ minHeight: 52, paddingLeft: 56 }} inputMode="decimal" placeholder="0.00" value={value} autoFocus onChange={(e) => { setValue(e.target.value); setError(null) }} />
          </div>
          <Button variant="primary" onClick={submit}>
            Set
          </Button>
        </div>
      </div>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <p className="form-hint">
        If you’re not sure, you can change this later in Settings.
      </p>
    </Sheet>
  )
}

function CategorySheet({ onClose, onAdd }: { onClose: () => void; onAdd: (c: { id: string; label: string; kind: 'spend' | 'income'; builtin: boolean }) => void }) {
  const [label, setLabel] = useState('')
  const [kind, setKind] = useState<'spend' | 'income'>('spend')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const name = label.trim()
    if (!name) {
      setError('Give the category a name, like “Church”.')
      return
    }
    onAdd({
      id: `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      label: name,
      kind,
      builtin: false,
    })
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title="New category">
      <div className="field">
        <label className="field-label" htmlFor="cat-name">Name</label>
        <input id="cat-name" className="input" placeholder="e.g. Church offering" value={label} onChange={(e) => { setLabel(e.target.value); setError(null) }} />
      </div>
      <div className="field" style={{ marginBottom: 20 }}>
        <span className="field-label">Used for</span>
        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            { value: 'spend', label: 'Spending' },
            { value: 'income', label: 'Income' },
          ]}
          ariaLabel="Category kind"
        />
      </div>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <Button variant="primary" size="lg" block onClick={submit}>
        Add category
      </Button>
    </Sheet>
  )
}