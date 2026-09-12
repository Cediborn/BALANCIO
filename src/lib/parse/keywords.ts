export interface KeywordEntry {
  phrase: string
  categoryId: string
}

export const CATEGORY_KEYWORDS: KeywordEntry[] = [
  { phrase: 'school fees', categoryId: 'school' },
  { phrase: 'fried rice', categoryId: 'food' },
  { phrase: 'light soup', categoryId: 'food' },
  { phrase: 'grilled chicken', categoryId: 'food' },
  { phrase: 'ice cream', categoryId: 'food' },
  { phrase: 'pure water', categoryId: 'food' },
  { phrase: 'coconut', categoryId: 'food' },
  { phrase: 'phone credit', categoryId: 'data' },
  { phrase: 'pocket money', categoryId: 'allowance' },
  { phrase: 'side hustle', categoryId: 'sidehustle' },
  { phrase: 'water bill', categoryId: 'housing' },
  { phrase: 'electricity bill', categoryId: 'housing' },
  { phrase: 'light bill', categoryId: 'housing' },
  { phrase: 'utility bill', categoryId: 'housing' },
  { phrase: 'room rent', categoryId: 'housing' },
  { phrase: 'make up', categoryId: 'personal' },
  { phrase: 'school', categoryId: 'school' },

  { phrase: 'waakye', categoryId: 'food' },
  { phrase: 'food', categoryId: 'food' },
  { phrase: 'jollof', categoryId: 'food' },
  { phrase: 'banku', categoryId: 'food' },
  { phrase: 'kenkey', categoryId: 'food' },
  { phrase: 'fufu', categoryId: 'food' },
  { phrase: 'ampesi', categoryId: 'food' },
  { phrase: 'indomie', categoryId: 'food' },
  { phrase: 'noodles', categoryId: 'food' },
  { phrase: 'kelewele', categoryId: 'food' },
  { phrase: 'shawarma', categoryId: 'food' },
  { phrase: 'rice', categoryId: 'food' },
  { phrase: 'beans', categoryId: 'food' },
  { phrase: 'yam', categoryId: 'food' },
  { phrase: 'eggs', categoryId: 'food' },
  { phrase: 'chicken', categoryId: 'food' },
  { phrase: 'pizza', categoryId: 'food' },
  { phrase: 'burger', categoryId: 'food' },
  { phrase: 'gari', categoryId: 'food' },
  { phrase: 'bread', categoryId: 'food' },
  { phrase: 'tea', categoryId: 'food' },
  { phrase: 'coffee', categoryId: 'food' },
  { phrase: 'koko', categoryId: 'food' },
  { phrase: 'lunch', categoryId: 'food' },
  { phrase: 'breakfast', categoryId: 'food' },
  { phrase: 'dinner', categoryId: 'food' },
  { phrase: 'brunch', categoryId: 'food' },
  { phrase: 'chop', categoryId: 'food' },
  { phrase: 'snack', categoryId: 'food' },
  { phrase: 'snacks', categoryId: 'food' },
  { phrase: 'drink', categoryId: 'food' },
  { phrase: 'drinks', categoryId: 'food' },
  { phrase: 'water', categoryId: 'food' },
  { phrase: 'coke', categoryId: 'food' },
  { phrase: 'fanta', categoryId: 'food' },
  { phrase: 'milk', categoryId: 'food' },
  { phrase: 'juice', categoryId: 'food' },
  { phrase: 'biscuit', categoryId: 'food' },
  { phrase: 'meatpie', categoryId: 'food' },
  { phrase: 'pie', categoryId: 'food' },

  { phrase: 'trotro', categoryId: 'transport' },
  { phrase: 'taxi', categoryId: 'transport' },
  { phrase: 'uber', categoryId: 'transport' },
  { phrase: 'bolt', categoryId: 'transport' },
  { phrase: 'yango', categoryId: 'transport' },
  { phrase: 'indrive', categoryId: 'transport' },
  { phrase: 'indriver', categoryId: 'transport' },
  { phrase: 'glo', categoryId: 'transport' },
  { phrase: 'transport', categoryId: 'transport' },
  { phrase: 'fare', categoryId: 'transport' },
  { phrase: 'bus', categoryId: 'transport' },
  { phrase: 'okada', categoryId: 'transport' },
  { phrase: 'car', categoryId: 'transport' },
  { phrase: 'petrol', categoryId: 'transport' },
  { phrase: 'fuel', categoryId: 'transport' },
  { phrase: 'lyft', categoryId: 'transport' },

  { phrase: 'airtime', categoryId: 'data' },
  { phrase: 'bundle', categoryId: 'data' },
  { phrase: 'bundles', categoryId: 'data' },
  { phrase: 'data', categoryId: 'data' },
  { phrase: 'mtn', categoryId: 'data' },
  { phrase: 'telecel', categoryId: 'data' },
  { phrase: 'vodafone', categoryId: 'data' },
  { phrase: 'airteltigo', categoryId: 'data' },
  { phrase: 'wifi', categoryId: 'data' },
  { phrase: 'internet', categoryId: 'data' },
  { phrase: 'networks', categoryId: 'data' },
  { phrase: 'credit', categoryId: 'data' },

  { phrase: 'printing', categoryId: 'school' },
  { phrase: 'photocopy', categoryId: 'school' },
  { phrase: 'photocopies', categoryId: 'school' },
  { phrase: 'handout', categoryId: 'school' },
  { phrase: 'textbook', categoryId: 'school' },
  { phrase: 'textbooks', categoryId: 'school' },
  { phrase: 'book', categoryId: 'school' },
  { phrase: 'books', categoryId: 'school' },
  { phrase: 'assignment', categoryId: 'school' },
  { phrase: 'lab', categoryId: 'school' },
  { phrase: 'tuition', categoryId: 'school' },
  { phrase: 'registration', categoryId: 'school' },
  { phrase: 'exam', categoryId: 'school' },
  { phrase: 'exams', categoryId: 'school' },
  { phrase: 'stationery', categoryId: 'school' },
  { phrase: 'notebook', categoryId: 'school' },
  { phrase: 'pens', categoryId: 'school' },

  { phrase: 'rent', categoryId: 'housing' },
  { phrase: 'hostel', categoryId: 'housing' },
  { phrase: 'dorm', categoryId: 'housing' },
  { phrase: 'room', categoryId: 'housing' },
  { phrase: 'house', categoryId: 'housing' },
  { phrase: 'electricity', categoryId: 'housing' },
  { phrase: 'accommodation', categoryId: 'housing' },

  { phrase: 'haircut', categoryId: 'personal' },
  { phrase: 'barber', categoryId: 'personal' },
  { phrase: 'braids', categoryId: 'personal' },
  { phrase: 'hair', categoryId: 'personal' },
  { phrase: 'skincare', categoryId: 'personal' },
  { phrase: 'toiletries', categoryId: 'personal' },
  { phrase: 'soap', categoryId: 'personal' },
  { phrase: 'cream', categoryId: 'personal' },
  { phrase: 'lotion', categoryId: 'personal' },
  { phrase: 'perfume', categoryId: 'personal' },
  { phrase: 'cologne', categoryId: 'personal' },
  { phrase: 'deodorant', categoryId: 'personal' },
  { phrase: 'salon', categoryId: 'personal' },
  { phrase: 'shave', categoryId: 'personal' },
  { phrase: 'beard', categoryId: 'personal' },
  { phrase: 'nails', categoryId: 'personal' },
  { phrase: 'toothpaste', categoryId: 'personal' },
  { phrase: 'sanitary', categoryId: 'personal' },
  { phrase: 'body spray', categoryId: 'personal' },

  { phrase: 'movie', categoryId: 'entertainment' },
  { phrase: 'cinema', categoryId: 'entertainment' },
  { phrase: 'game', categoryId: 'entertainment' },
  { phrase: 'gaming', categoryId: 'entertainment' },
  { phrase: 'outing', categoryId: 'entertainment' },
  { phrase: 'party', categoryId: 'entertainment' },
  { phrase: 'chill', categoryId: 'entertainment' },
  { phrase: 'concert', categoryId: 'entertainment' },
  { phrase: 'festival', categoryId: 'entertainment' },
  { phrase: 'match', categoryId: 'entertainment' },
  { phrase: 'netflix', categoryId: 'entertainment' },
  { phrase: 'show', categoryId: 'entertainment' },
  { phrase: 'club', categoryId: 'entertainment' },

  { phrase: 'shopping', categoryId: 'shopping' },
  { phrase: 'clothes', categoryId: 'shopping' },
  { phrase: 'cloth', categoryId: 'shopping' },
  { phrase: 'shirt', categoryId: 'shopping' },
  { phrase: 'dress', categoryId: 'shopping' },
  { phrase: 'shoes', categoryId: 'shopping' },
  { phrase: 'sneakers', categoryId: 'shopping' },
  { phrase: 'bag', categoryId: 'shopping' },
  { phrase: 'watch', categoryId: 'shopping' },
  { phrase: 'charger', categoryId: 'shopping' },
  { phrase: 'earphones', categoryId: 'shopping' },
  { phrase: 'headphones', categoryId: 'shopping' },
  { phrase: 'phone case', categoryId: 'shopping' },
  { phrase: 'thrift', categoryId: 'shopping' },
  { phrase: 'market', categoryId: 'shopping' },
  { phrase: 'goods', categoryId: 'shopping' },
  { phrase: 'wallet', categoryId: 'shopping' },
  { phrase: 'bangle', categoryId: 'shopping' },
  { phrase: 'snickers', categoryId: 'shopping' },

  { phrase: 'mum', categoryId: 'family' },
  { phrase: 'mom', categoryId: 'family' },
  { phrase: 'mother', categoryId: 'family' },
  { phrase: 'mummy', categoryId: 'family' },
  { phrase: 'dad', categoryId: 'family' },
  { phrase: 'daddy', categoryId: 'family' },
  { phrase: 'father', categoryId: 'family' },
  { phrase: 'sister', categoryId: 'family' },
  { phrase: 'brother', categoryId: 'family' },
  { phrase: 'family', categoryId: 'family' },
  { phrase: 'church', categoryId: 'family' },
  { phrase: 'donation', categoryId: 'family' },
  { phrase: 'offering', categoryId: 'family' },
  { phrase: 'tithe', categoryId: 'family' },
  { phrase: 'gift', categoryId: 'family' },
  { phrase: 'aunt', categoryId: 'family' },
  { phrase: 'aunty', categoryId: 'family' },
  { phrase: 'auntie', categoryId: 'family' },
  { phrase: 'uncle', categoryId: 'family' },
  { phrase: 'grandma', categoryId: 'family' },
  { phrase: 'grandpa', categoryId: 'family' },
  { phrase: 'granny', categoryId: 'family' },
  { phrase: 'parents', categoryId: 'family' },
  { phrase: 'cousin', categoryId: 'family' },

  { phrase: 'hospital', categoryId: 'health' },
  { phrase: 'doctor', categoryId: 'health' },
  { phrase: 'chemist', categoryId: 'health' },
  { phrase: 'pharmacy', categoryId: 'health' },
  { phrase: 'drugs', categoryId: 'health' },
  { phrase: 'medicine', categoryId: 'health' },
  { phrase: 'medication', categoryId: 'health' },
  { phrase: 'clinic', categoryId: 'health' },
  { phrase: 'malaria', categoryId: 'health' },
  { phrase: 'paracetamol', categoryId: 'health' },
  { phrase: 'checkup', categoryId: 'health' },
  { phrase: 'nhis', categoryId: 'health' },
  { phrase: 'first aid', categoryId: 'health' },
  { phrase: 'vitamins', categoryId: 'health' },

  { phrase: 'allowance', categoryId: 'allowance' },
  { phrase: 'salary', categoryId: 'salary' },
  { phrase: 'wages', categoryId: 'salary' },
  { phrase: 'payday', categoryId: 'salary' },
  { phrase: 'hustle', categoryId: 'sidehustle' },
  { phrase: 'gig', categoryId: 'sidehustle' },
  { phrase: 'freelance', categoryId: 'sidehustle' },
  { phrase: 'business', categoryId: 'business' },
  { phrase: 'sales', categoryId: 'business' },
  { phrase: 'profit', categoryId: 'business' },
  { phrase: 'customer', categoryId: 'business' },
  { phrase: 'birthday money', categoryId: 'gift' },
  { phrase: 'present', categoryId: 'gift' },
  { phrase: 'refund', categoryId: 'refund' },
  { phrase: 'cashback', categoryId: 'refund' },
  { phrase: 'chargeback', categoryId: 'refund' },
]

export const BRAND_MERCHANTS: string[] = [
  'mtn', 'telecel', 'vodafone', 'airteltigo', 'glo', 'tigo',
  'uber', 'bolt', 'yango', 'indrive', 'indriver',
  'jumia', 'glovo', 'ipay', 'expresso',
]

const BRAND_DISPLAY: Record<string, string> = {
  mtn: 'MTN',
  telecel: 'Telecel',
  vodafone: 'Vodafone',
  airteltigo: 'AirtelTigo',
  glo: 'glo',
  tigo: 'Tigo',
  uber: 'Uber',
  bolt: 'Bolt',
  yango: 'Yango',
  indrive: 'inDrive',
  indriver: 'inDrive',
  jumia: 'Jumia',
  glovo: 'Glovo',
  ipay: 'iPay',
  expresso: 'Expresso',
}

export const PEOPLE: string[] = [
  'mum', 'mom', 'mother', 'mummy', 'mama',
  'dad', 'daddy', 'father', 'papa',
  'sister', 'brother', 'siblings',
  'aunt', 'aunty', 'auntie', 'uncle',
  'grandma', 'grandpa', 'granny', 'grandmother', 'grandfather',
  'family', 'parents', 'cousin',
  'girlfriend', 'boyfriend', 'friend', 'friends',
  'roommate', 'roomie', 'waakye queen',
]

export function findCategory(text: string): string | null {
  const lower = ` ${text.toLowerCase()} `
  const sorted = [...CATEGORY_KEYWORDS].sort((a, b) => b.phrase.length - a.phrase.length)
  for (const entry of sorted) {
    const phrase = ` ${entry.phrase} `
    if (lower.includes(phrase)) {
      return entry.categoryId
    }
  }
  for (const entry of sorted) {
    if (entry.phrase.length <= 6) {
      const re = new RegExp(`(^|[^a-z0-9])${entry.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i')
      if (re.test(lower)) return entry.categoryId
    }
  }
  return null
}

export function findBrand(text: string): string | null {
  const lower = text.toLowerCase()
  for (const brand of BRAND_MERCHANTS) {
    const re = new RegExp(`(^|[^a-z0-9])${brand}([^a-z0-9]|$)`, 'i')
    if (re.test(lower)) return BRAND_DISPLAY[brand] ?? (brand[0]!.toUpperCase() + brand.slice(1))
  }
  return null
}

export function findPerson(text: string): string | null {
  const lower = text.toLowerCase()
  for (const person of PEOPLE) {
    const re = new RegExp(`(^|[^a-z0-9])${person}([^a-z0-9]|$)`, 'i')
    if (re.test(lower)) return person[0]!.toUpperCase() + person.slice(1)
  }
  return null
}

export const STOPWORDS = new Set([
  'a', 'an', 'the', 'for', 'on', 'about', 'around', 'of', 'with', 'in', 'at',
  'to', 'i', 'we', 'you', 'he', 'she', 'it', 'they', 'me', 'my', 'for',
  'spent', 'spend', 'spends', 'paid', 'pay', 'pays', 'bought', 'buy', 'buys',
  'got', 'get', 'gets', 'gave', 'give', 'gives', 'sent', 'send', 'sends',
  'received', 'receive', 'receives', 'is', 'was', 'were', 'am', 'are',
  'do', 'did', 'does', 'went', 'go', 'going', 'food', 'approx', 'approximately',
  'about', 'some', 'little', 'small', 'slightly', 'also', 'and', 'just',
  'then', 'today', 'yesterday', 'this', 'that', 'these', 'those',
  'really', 'very', 'am', 'im', 'from', 'into', 'out', 'up', 'down',
  'today', 'today.', 'now', 'money', 'cash', 'cedis', 'cedi', 'ghs', 'gh¢',
  'the', 'then', 'than', 'more', 'much', 'only',
  'day', 'days', 'night', 'morning', 'afternoon', 'evening',
])