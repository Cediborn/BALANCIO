const ICONS: Record<string, string> = {
  food: '🍛',
  transport: '🚌',
  data: '📶',
  school: '📚',
  housing: '🏠',
  personal: '💈',
  entertainment: '🎬',
  shopping: '🛍️',
  family: '🤝',
  health: '⚕️',
  other: '✦',
  allowance: '💰',
  salary: '💼',
  sidehustle: '🔨',
  business: '🏪',
  gift: '🎁',
  refund: '↩️',
  otherother: '➕',
  savings: '🐖',
}

export function categoryIcon(id: string): string {
  return ICONS[id] ?? '✦'
}