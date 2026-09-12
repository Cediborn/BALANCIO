# Balancio

A money notebook for Ghanaian students. Balancio helps you log expenses in seconds — type `15 waakye` and it figures out the rest — then shows you where your money actually goes, week after week.

Built to be fast, private, and offline-first. It never connects to a bank or mobile-money account, and all data stays on the device.

## Features

- **Natural-language entry** — `20 food`, `10 trotro`, `sent 100 to mum` all parse into typed, categorised transactions with a confidence rating and a confirm screen.
- **Weekly review & insights** — a real-week overview (received / spent / saved / remaining), spending changes vs the same days last week, biggest spending day, small-purchase leaks, and category breakdowns.
- **Savings goals & challenges** — create goals, mark saved money against them, and run three-day “no junk” resets, save-GH₵20 weeks, or food-budget checks.
- **Pastable imports** — paste a MoMo/bank/SMS-style message; Balancio pulls the amount and direction with no account connection.
- **Onboarding & settings** — set a starting balance, theme the small-purchase threshold, add custom categories, export JSON, or erase everything.
- **Offline PWA** — installable, no network required after load.

## Stack

- React 19 + TypeScript (strict) + Vite
- Zustand with `persist` (localStorage) for state
- Vitest + jsdom for unit tests (85 passing)
- `@fontsource-variable/inter` for offline typography
- Homegrown CSS design system (`src/styles/`)

## Commands

```bash
npm install
npm run dev        # local dev server
npm run test       # unit tests (vitest)
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build into dist/
```

## Project structure

```
src/
  lib/         types, money, dates, categories, parsing, analytics, insights, challenges
  store/       zustand stores (data, navigation, entry modals)
  components/  UI kit, navigation, transaction entry host
  screens/     Dashboard, Transactions, Insights, Savings, Weekly review, Settings, Onboarding
  styles/      tokens + global/component/screen CSS
```

## Data model

- Money is stored as integer pesewas (`amountMinor`). No floats.
- Transactions are one of `expense`, `income`, or `savings`; savings reduce balance and count as *saved*, not spent.
- Weeks run Monday–Sunday by default (configurable) and compare like-for-like day ranges.
- Persisted to localStorage under `balancio-store-v1` and `balancio-nav-v1`.

## Privacy

Balancio stores everything locally in your browser. There is no backend, no analytics SDK, no account, and no bank or MoMo integration — feature by design.