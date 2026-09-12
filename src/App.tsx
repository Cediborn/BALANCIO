import { useEffect } from 'react'
import { useNavStore, screenFromHash } from './store/navStore'
import { useBalancioStore } from './store/appStore'
import { TopBar } from './components/nav/TopBar'
import { NavBar } from './components/nav/NavBar'
import { EntryHost } from './components/tx/EntryHost'
import { ToastHost } from './components/ui/Toast'
import { Dashboard } from './screens/Dashboard'
import { TransactionsScreen } from './screens/Transactions'
import { InsightsScreen } from './screens/Insights'
import { SavingsScreen } from './screens/Savings'
import { SettingsScreen } from './screens/Settings'
import { WeeklyReviewScreen } from './screens/WeeklyReview'
import { OnboardingScreen } from './screens/Onboarding'

export default function App() {
  const screen = useNavStore((s) => s.screen)
  const go = useNavStore((s) => s.go)
  const onboarded = useBalancioStore((s) => s.settings.onboarded)
  const reduceMotion = useBalancioStore((s) => s.settings.reduceMotion)

  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', '')
    } else {
      document.documentElement.removeAttribute('data-reduce-motion')
    }
  }, [reduceMotion])

  useEffect(() => {
    if (!onboarded) return
    const fromHash = screenFromHash(window.location.hash)
    if (fromHash) go(fromHash)
    const onHash = () => {
      const h = screenFromHash(window.location.hash)
      if (h) go(h)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
    // go is stable from zustand
  }, [onboarded, go])

  if (!onboarded) {
    return (
      <div className="app">
        <div className="ob-bg">
          <OnboardingScreen />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <TopBar />
      <main className="app-main" key={screen}>
        {screen === 'home' ? <Dashboard /> : null}
        {screen === 'transactions' ? <TransactionsScreen /> : null}
        {screen === 'insights' ? <InsightsScreen /> : null}
        {screen === 'savings' ? <SavingsScreen /> : null}
        {screen === 'settings' ? <SettingsScreen /> : null}
        {screen === 'weekly' ? <WeeklyReviewScreen /> : null}
      </main>
      <NavBar />
      <EntryHost />
      <ToastHost />
    </div>
  )
}