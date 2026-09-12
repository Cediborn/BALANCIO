import { describe, it, expect } from 'vitest'
import {
  toMinor,
  formatMoney,
  formatMoneyCompact,
  parseAmountToMinor,
} from './money'

describe('money', () => {
  it('converts to minor units exactly', () => {
    expect(toMinor(0)).toBe(0)
    expect(toMinor(1)).toBe(100)
    expect(toMinor(9.5)).toBe(950)
    expect(toMinor(10)).toBe(1000)
    expect(toMinor(100)).toBe(10000)
    expect(toMinor(1000)).toBe(100000)
    expect(toMinor(19.99)).toBe(1999)
    expect(toMinor(0.05)).toBe(5)
  })

  it('rounds half-pesewa safely', () => {
    expect(toMinor(20.005)).toBe(2001)
  })

  it('formats money', () => {
    expect(formatMoney(0)).toBe('GH₵0.00')
    expect(formatMoney(2000)).toBe('GH₵20.00')
    expect(formatMoney(950)).toBe('GH₵9.50')
    expect(formatMoney(1500)).toBe('GH₵15.00')
    expect(formatMoneyCompact(2000)).toBe('GH₵20')
    expect(formatMoneyCompact(950)).toBe('GH₵9.50')
  })

  it('parses amount strings', () => {
    expect(parseAmountToMinor('20')).toBe(2000)
    expect(parseAmountToMinor('20.00')).toBe(2000)
    expect(parseAmountToMinor('9.5')).toBe(950)
    expect(parseAmountToMinor('GH₵20')).toBe(2000)
    expect(parseAmountToMinor('GH₵ 20')).toBe(2000)
    expect(parseAmountToMinor('₵20')).toBe(2000)
    expect(parseAmountToMinor('GHS 20')).toBe(2000)
    expect(parseAmountToMinor('20 cedis')).toBe(2000)
    expect(parseAmountToMinor('1,000')).toBe(100000)
    expect(parseAmountToMinor('')).toBeNull()
    expect(parseAmountToMinor('abc')).toBeNull()
    expect(parseAmountToMinor('0')).toBe(0)
  })

  it('never produces floating point artifacts', () => {
    expect(formatMoney(toMinor(19.99))).toBe('GH₵19.99')
    expect(toMinor(0.1) + toMinor(0.2) + toMinor(0.7)).toBe(100)
  })
})