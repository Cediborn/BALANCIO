import { useNavStore, type Screen } from '../../store/navStore'
import { Icon, type IconName } from '../ui/Icon'

const TABS: { screen: Screen; label: string; icon: IconName }[] = [
  { screen: 'home', label: 'Home', icon: 'home' },
  { screen: 'transactions', label: 'Transactions', icon: 'list' },
  { screen: 'insights', label: 'Insights', icon: 'chart' },
  { screen: 'savings', label: 'Savings', icon: 'savings' },
]

export function NavBar() {
  const screen = useNavStore((s) => s.screen)
  const go = useNavStore((s) => s.go)
  const activeTab = screen === 'settings' || screen === 'weekly' ? 'home' : screen

  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="nav-inner">
        {TABS.map((tab) => (
          <button
            key={tab.screen}
            type="button"
            className={`nav-btn${activeTab === tab.screen ? ' active' : ''}`}
            aria-current={activeTab === tab.screen ? 'page' : undefined}
            onClick={() => go(tab.screen)}
          >
            <span className="nav-icon">
              <Icon name={tab.icon} size={21} />
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}