import { describe, it, expect } from 'vitest'
import { parseImportedTransaction } from './importParser'
import { parseAmountToMinor } from '../money'

describe('import parser — pasted transaction messages', () => {
  it('parses a sent MoMo message as an expense', () => {
    const raw = 'You have successfully sent GHS 25.00 to MOMO_USER_KOFI_1234. Procedure: send money'
    const res = parseImportedTransaction(raw)
    expect(res.parsed).not.toBeNull()
    expect(res.parsed?.type).toBe('expense')
    expect(res.parsed?.amountMinor).toBe(2500)
  })

  it('parses a received message as income', () => {
    const raw = 'You have successfully received GHS 100.00 from MOMO_USER_MUM. Procedure: receive money'
    const res = parseImportedTransaction(raw)
    expect(res.parsed?.type).toBe('income')
    expect(res.parsed?.amountMinor).toBe(10000)
  })

  it('extracts merchant from recipient text', () => {
    const raw = 'You have successfully sent GHS 30.00 to MTN MOBILETOGETHER TIKO BOOSTER Top up'
    const res = parseImportedTransaction(raw)
    expect(res.parsed?.merchant).toBe('MTN')
    expect(res.parsed?.categoryId).toBe('data')
  })

  it('handles GHS with GH¢ symbol', () => {
    const raw = 'Payment of GH¢ 9.50 sent to AB Kay grocery'
    const res = parseImportedTransaction(raw)
    expect(res.parsed?.amountMinor).toBe(950)
  })

  it('returns error when no amount', () => {
    const res = parseImportedTransaction('Hello, how are you today?')
    expect(res.parsed).toBeNull()
    expect(res.error).toBeTruthy()
  })

  it('returns error on empty input', () => {
    expect(parseImportedTransaction('').parsed).toBeNull()
  })

  it('uses exact money amount', () => {
    const raw = 'You have successfully sent GHS 25.00 to MOMO_USER'
    expect(resMinor(raw)).toBe(2500)
    const raw2 = 'GHS 1000.50 sent to someone'
    expect(resMinor(raw2)).toBe(100050)
  })

  it('detects transfer-like messages as expense by default', () => {
    const raw = 'Airtime purchase of GHS 15.00 with Esika'
    const res = parseImportedTransaction(raw)
    expect(res.parsed?.type).toBe('expense')
  })
})

function resMinor(raw: string): number | null | undefined {
  const { parsed } = parseImportedTransaction(raw)
  return parsed?.amountMinor
}

describe('amount parsing cross-check', () => {
  it('agrees with money parse helper', () => {
    expect(parseAmountToMinor('25.00')).toBe(2500)
    expect(parseAmountToMinor('9.50')).toBe(950)
    expect(parseAmountToMinor('1000.50')).toBe(100050)
    expect(parseAmountToMinor('1')).toBe(100)
    expect(parseAmountToMinor('0')).toBe(0)
  })
})