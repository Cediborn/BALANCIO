import { useNavStore, type Screen } from '../../store/navStore'
import { Logo } from '../brand/Logo'
import { Icon } from '../ui/Icon'
import { balanceBreakdown } from '../../store/appStore'
import { useBalancioStore } from '../../store/appStore'
import { formatMoneyCompact } from '../../lib/money'
import { relativeDayLabel, todayISO } from '../../lib/date'

const TITLES: Record<Screen, string> = {
  home: '',
  transactions: 'Transactions',
  insights: 'Insights',
  savings: 'Savings',
  settings: 'Settings',
  weekly: 'Your week',
  onboarding: '',
}

export function TopBar() {
  const screen = useNavStore((s) => s.screen)
  const go = useNavStore((s) => s.go)
  const startingBalanceMinor = useBalancioStore((s) => s.startingBalanceMinor)
  const transactions = useBalancioStore((s) => s.transactions)

  if (screen === 'home') {
    const breakdown = balanceBreakdown(startingBalanceMinor, transactions)
    return (
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={30} />
          <div>
            <div className="topbar-title">Balancio</div>
            <div className="topbar-sub">{relativeDayLabel(todayISO())}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="badge green money-mono"
            style={{ fontSize: 13, marginRight: 2 }}
          >
            {formatMoneyCompact(breakdown.balanceMinor)}
          </span>
          <button className="btn-icon" onClick={() => go('settings')} aria-label="Settings">
            <Icon name="settings" size={20} />
          </button>
        </div>
      </header>
    )
  }

  const title = TITLES[screen]

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="btn-icon" onClick={() => go('home')} aria-label="Back">
          <Icon name="chevron-left" size={20} />
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {screen !== 'settings' ? (
          <button className="btn-icon" onClick={() => go('settings')} aria-label="Settings">
            <Icon name="settings" size={20} />
          </button>
        ) : null}
      </div>
    </header>
  )
}