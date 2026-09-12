export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y as number, (m as number) - 1, d as number)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(aISO: string, bISO: string): number {
  const a = parseISODate(aISO).getTime()
  const b = parseISODate(bISO).getTime()
  return Math.round((b - a) / 86400000)
}

export function startOfWeek(iso: string, weekStartDay: 0 | 1 = 1): string {
  const d = parseISODate(iso)
  let dow = d.getDay()
  if (weekStartDay === 1) {
    dow = (dow + 6) % 7
  }
  d.setDate(d.getDate() - dow)
  return toISODate(d)
}

export function endOfWeek(iso: string, weekStartDay: 0 | 1 = 1): string {
  return addDays(startOfWeek(iso, weekStartDay), 6)
}

export function weekNumber(iso: string): number {
  const start = parseISODate(startOfWeek(iso))
  const yearStart = new Date(start.getFullYear(), 0, 1)
  return Math.floor((start.getTime() - yearStart.getTime()) / 604800000) + 1
}

export function isSameDay(aISO: string, bISO: string): boolean {
  return aISO === bISO
}

export function compareDates(aISO: string, bISO: string): number {
  if (aISO < bISO) return -1
  if (aISO > bISO) return 1
  return 0
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function dayName(iso: string): string {
  return DAY_NAMES[parseISODate(iso).getDay()] ?? ''
}

export function shortDayName(iso: string): string {
  return (DAY_NAMES[parseISODate(iso).getDay()] ?? '').slice(0, 3)
}

export function formatISODate(iso: string): string {
  const d = parseISODate(iso)
  return `${shortDayName(iso)} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

export function formatISODateLong(iso: string): string {
  const d = parseISODate(iso)
  return `${dayName(iso)}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatISODateShort(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

export function relativeDayLabel(iso: string): string {
  const today = todayISO()
  const diff = daysBetween(iso, today)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff === 2) return '2 days ago'
  return formatISODate(iso)
}

export function getDayOfMonth(iso: string): string {
  return String(parseISODate(iso).getDate())
}

export function isWithinRange(iso: string, startISO: string, endISO: string): boolean {
  return compareDates(iso, startISO) >= 0 && compareDates(iso, endISO) <= 0
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function currentMonthKey(): string {
  return todayISO().slice(0, 7)
}

export function previousMonthKey(): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  return toISODate(d).slice(0, 7)
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`
}

export function endOfMonth(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  const lastDay = new Date(y as number, m as number, 0).getDate()
  return `${iso.slice(0, 7)}-${String(lastDay).padStart(2, '0')}`
}

export function parseTime(time: string): string {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return '00:00'
  const h = Math.max(0, Math.min(23, Number(match[1])))
  const mn = Math.max(0, Math.min(59, Number(match[2])))
  return `${String(h).padStart(2, '0')}:${String(mn).padStart(2, '0')}`
}