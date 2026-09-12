export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="#171A20" />
      <rect width="48" height="48" rx="13" fill="url(#bgrad)" />
      <path d="M14 30.5c0-5 3-8.5 7-8.5s7 3.5 7 8.5" stroke="#35C98A" strokeWidth="4" strokeLinecap="round" />
      <path d="M17 30.5c0-3 1.6-5 4-5s4 2 4 5" stroke="#A5E8C7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="35.5" cy="13.5" r="4" fill="#35C98A" />
      <defs>
        <linearGradient id="bgrad" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#35C98A" stopOpacity="0.06" />
          <stop offset="1" stopColor="#35C98A" stopOpacity="0.14" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function LogoWord({ small = false }: { small?: boolean }) {
  return (
    <span className="brand-word" style={small ? { fontSize: 17 } : undefined}>
      Balancio
    </span>
  )
}