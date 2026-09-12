import { describe, it, expect } from 'vitest'
import { parseExpenseText } from './parser'

describe('parser — expense handling', () => {
  const cases: [string, number, string][] = [
    ['20 food', 2000, 'food'],
    ['20 for food', 2000, 'food'],
    ['spent 20 on food', 2000, 'food'],
    ['15 waakye', 1500, 'food'],
    ['10 trotro', 1000, 'transport'],
    ['25 uber', 2500, 'transport'],
    ['30 data', 3000, 'data'],
    ['20 airtime', 2000, 'data'],
    ['50 haircut', 5000, 'personal'],
    ['40 lunch', 4000, 'food'],
    ['12 coke', 1200, 'food'],
    ['100 school fees', 10000, 'school'],
    ['30 printing', 3000, 'school'],
    ['12 snacks', 1200, 'food'],
    ['25 movie', 2500, 'entertainment'],
    ['30 for printing', 3000, 'school'],
    ['paid 25 for data', 2500, 'data'],
    ['I spent about 20 on lunch', 2000, 'food'],
    ['15 waakye today', 1500, 'food'],
    ['GH₵30 for mtn data', 3000, 'data'],
    ['30 ghs data', 3000, 'data'],
  ]

  it.each(cases)('parses %s → GH₵%d, %s', (input, minor, cat) => {
    const res = parseExpenseText(input)
    expect(res.parsed).not.toBeNull()
    expect(res.parsed?.type).toBe('expense')
    expect(res.parsed?.amountMinor).toBe(minor)
    expect(res.parsed?.categoryId).toBe(cat)
  })

  it('rescues description', () => {
    const res = parseExpenseText('15 waakye')
    expect(res.parsed?.description).toBe('waakye')
  })

  it('detects merchant brand', () => {
    const res = parseExpenseText('30 MTN data')
    expect(res.parsed?.merchant).toBe('MTN')
    expect(res.parsed?.categoryId).toBe('data')
  })

  it('detects uber as transport merchant', () => {
    const res = parseExpenseText('25 uber')
    expect(res.parsed?.merchant).toBe('Uber')
    expect(res.parsed?.categoryId).toBe('transport')
  })
})

describe('parser — income handling', () => {
  it.each([
    '50 from mom',
    'got 200 from mum',
    'mum sent me 100',
    '200 allowance',
    'received 300 from my father',
    'salary 1200',
    'side hustle 80',
    'gift 50',
  ])('parses %s as income', (input) => {
    const res = parseExpenseText(input)
    expect(res.parsed).not.toBeNull()
    expect(res.parsed?.type).toBe('income')
    expect(res.parsed?.amountMinor).toBeGreaterThan(0)
  })

  it('treats money from mum as allowance', () => {
    const res = parseExpenseText('50 from mom')
    expect(res.parsed?.categoryId).toBe('allowance')
    expect(res.parsed?.merchant).toBe('Mom')
  })

  it('parses Mum sent me 100', () => {
    const res = parseExpenseText('Mum sent me 100')
    expect(res.parsed?.type).toBe('income')
    expect(res.parsed?.amountMinor).toBe(10000)
  })
})

describe('parser — savings handling', () => {
  it.each(['save 20', 'put 50 into my savings', 'set aside 30 for rent'])(
    'parses %s as savings',
    (input) => {
      const res = parseExpenseText(input)
      expect(res.parsed?.type).toBe('savings')
      expect(res.parsed?.amountMinor).toBeGreaterThan(0)
    },
  )
})

describe('parser — edge cases & errors', () => {
  it('returns error when no amount', () => {
    const res = parseExpenseText('lunch')
    expect(res.parsed).toBeNull()
    expect(res.error).toBeTruthy()
  })

  it('returns error on empty input', () => {
    expect(parseExpenseText('').parsed).toBeNull()
    expect(parseExpenseText('   ').error).toBeTruthy()
  })

  it('handles decimal amounts', () => {
    const res = parseExpenseText('9.50 snacks')
    expect(res.parsed?.amountMinor).toBe(950)
  })

  it('handles small amounts', () => {
    const res = parseExpenseText('1 water')
    expect(res.parsed?.amountMinor).toBe(100)
    expect(res.parsed?.categoryId).toBe('food')
  })

  it('handles 0 gracefully as amount', () => {
    const res = parseExpenseText('0 food')
    expect(res.parsed?.amountMinor).toBe(0)
  })

  it('strips currency symbols', () => {
    expect(parseExpenseText('GH₵20 food')?.parsed?.amountMinor).toBe(2000)
    expect(parseExpenseText('₵15 waakye')?.parsed?.amountMinor).toBe(1500)
    expect(parseExpenseText('GHS 10 trotro')?.parsed?.amountMinor).toBe(1000)
  })
})