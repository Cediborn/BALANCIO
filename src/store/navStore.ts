import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Screen =
  | 'home'
  | 'transactions'
  | 'insights'
  | 'savings'
  | 'settings'
  | 'weekly'
  | 'onboarding'

interface NavState {
  screen: Screen
  go: (screen: Screen) => void
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      screen: 'home',
      go: (screen) => set({ screen }),
    }),
    {
      name: 'balancio-nav-v1',
      partialize: (state) => ({ screen: state.screen }),
    },
  ),
)

export function syncRouteToHash(screen: Screen): void {
  try {
    const hash = `#/${screen}`
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
    }
  } catch {
    // ignore
  }
}

export function screenFromHash(hash: string): Screen | null {
  const match = hash.match(/^#\/(\w+)/)
  if (!match) return null
  const value = match[1] as Screen
  const allowed: Screen[] = [
    'home', 'transactions', 'insights', 'savings', 'settings', 'weekly', 'onboarding',
  ]
  return allowed.includes(value) ? value : null
}