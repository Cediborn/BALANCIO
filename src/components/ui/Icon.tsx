import type { SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'list'
  | 'chart'
  | 'savings'
  | 'plus'
  | 'settings'
  | 'close'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'trash'
  | 'edit'
  | 'wallet'
  | 'income'
  | 'expense'
  | 'insight'
  | 'check'
  | 'calendar'
  | 'import'
  | 'person'
  | 'info'
  | 'arrow-up'
  | 'arrow-down'
  | 'outcome'
  | 'credit'

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  list: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <path d="M8 6v.01M8 12v.01M8 18v.01" strokeWidth="2.4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-8" />
      <path d="M4 20h16" />
    </>
  ),
  savings: (
    <>
      <path d="M12 3c-2.2 0-4 1.8-4 4v1.3c0 2.2 1.8 4 4 4s4-1.8 4-4V7c0-2.2-1.8-4-4-4Z" />
      <path d="M4 17.5c0-1.4.9-2.6 2.2-3l3.9-1.1 3.9 1.1c1.3.4 2.2 1.6 2.2 3V19H4v-1.5Z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5 14.2 4l2.8-.6 1 2.6 2.6 1-.6 2.8L21.5 12l-2.5 2.2.6 2.8-2.6 1-1 2.6-2.8-.6-2.2 2.5-2.2-2.5-2.8.6-1-2.6-2.6-1 .6-2.8L2.5 12l2.5-2.2-.6-2.8 2.6-1 1-2.6 2.8.6L12 2.5Z" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.5-4.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
      <path d="M6.5 7.5 7 19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l.5-11.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
    </>
  ),
  wallet: (
    <>
      <path d="M3.5 14V6.5A1.5 1.5 0 0 1 5 5h13A2.5 2.5 0 0 1 20.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-.5" />
      <path d="M3.5 14V14a2 2 0 0 0 2 2H14" />
      <path d="M14 11.5c0 .8.7 1.5 1.5 1.5H20a1 1 0 0 1 1 1v-5a1 1 0 0 0-1-1h-4.5A1.5 1.5 0 0 0 14 9.5Z" />
      <circle cx="17.5" cy="12.5" r="1" fill="currentColor" />
    </>
  ),
  income: <path d="M5 12h14M13 6l6 6-6 6" />,
  expense: <path d="M5 12h14M11 6l-6 6 6 6" />,
  insight: (
    <>
      <path d="M12 3v3M18.4 5.6l-2.1 2.1M21 12h-3M5.6 18.4l2.1-2.1M3 12h3M8.4 5.6 6.3 3.7" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
      <path d="M12 16.2V21" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 7.5" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 2.5V7M16 2.5V7" />
    </>
  ),
  import: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M5 15v4a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-4" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.2-3.5 4-5 7.5-5s6.3 1.5 7.5 5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.01" strokeWidth="2.2" />
    </>
  ),
  'arrow-up': <path d="M12 19V5M5 12l7-7 7 7" />,
  'arrow-down': <path d="M12 5v14M5 12l7 7 7-7" />,
  outcome: <path d="M5 12h14M13 6l6 6-6 6" />,
  credit: <path d="M5 12h14M11 6l-6 6 6 6" />,
}

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
  strokeWidth?: number
}

export function Icon({ name, size = 22, strokeWidth = 1.8, ...rest }: IconProps): React.ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}