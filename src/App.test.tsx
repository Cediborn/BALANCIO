import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { act } from 'react'
import type { Root } from 'react-dom/client'

function persistPayload(state: Record<string, unknown>) {
  return JSON.stringify({ state, version: 0 })
}

function onboardedState() {
  return {
    startingBalanceMinor: 50000,
    transactions: [],
    goals: [],
    activeChallenges: [],
    categories: [],
    settings: {
      onboarded: true,
      smallThresholdMinor: 1000,
      weekStartDay: 1,
      reduceMotion: false,
      currencyLabel: 'GHS',
    },
  }
}

describe('App smoke', () => {
  let container: HTMLDivElement
  let root: Root

  beforeAll(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    root?.unmount()
    container.innerHTML = ''
  })

  it('renders onboarding when there is no persisted state', async () => {
    localStorage.clear()
    vi.resetModules()
    const { default: App } = await import('./App')
    const { createRoot } = await import('react-dom/client')
    root = createRoot(container)
    act(() => {
      root.render(<App />)
    })
    expect(container.textContent).toContain('Balancio')
    expect(container.textContent).toMatch(/Get started/i)
  })

  it('renders the dashboard after onboarding with a starting balance', async () => {
    localStorage.setItem('balancio-nav-v1', persistPayload({ screen: 'home' }))
    localStorage.setItem('balancio-store-v1', persistPayload(onboardedState()))
    vi.resetModules()
    const { default: App } = await import('./App')
    const { createRoot } = await import('react-dom/client')
    root = createRoot(container)
    act(() => {
      root.render(<App />)
    })
    expect(container.textContent).toContain('Balancio')
    expect(container.textContent).toContain('0.00')
  })

  it('renders the weekly review screen when navigated via hash', async () => {
    localStorage.setItem('balancio-nav-v1', persistPayload({ screen: 'weekly' }))
    localStorage.setItem('balancio-store-v1', persistPayload(onboardedState()))
    window.history.replaceState(null, '', '#/weekly')
    vi.resetModules()
    const { default: App } = await import('./App')
    const { createRoot } = await import('react-dom/client')
    root = createRoot(container)
    act(() => {
      root.render(<App />)
    })
    expect(container.textContent).toContain('No week to review yet')
    window.history.replaceState(null, '', '/')
  })
})