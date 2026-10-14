export const WEI_DECIMALS = 18

const WEI = 10n ** BigInt(WEI_DECIMALS)
const pattern = /^(\d+)(?:\.(\d{1,18}))?$/

export function parseEth(value: string): bigint {
  const match = pattern.exec(value.trim())
  if (!match) throw new Error(`Valor em ETH inválido: ${value}`)
  const whole = match[1] ?? '0'
  const fraction = match[2] ?? ''
  return BigInt(whole) * WEI + BigInt(fraction.padEnd(WEI_DECIMALS, '0'))
}

export function formatEth(wei: bigint, maxDecimals = 4): string {
  const negative = wei < 0n
  const abs = negative ? -wei : wei
  const whole = abs / WEI
  let fraction = (abs % WEI)
    .toString()
    .padStart(WEI_DECIMALS, '0')
    .slice(0, Math.max(2, maxDecimals))
  fraction = fraction.replace(/0+$/, '')
  if (fraction.length < 2) fraction = fraction.padEnd(2, '0')
  return `${negative ? '-' : ''}${whole}.${fraction}`
}

export function addEth(...values: string[]): string {
  return formatEth(values.reduce((sum, value) => sum + parseEth(value), 0n))
}

export function subEth(a: string, b: string): string {
  const result = parseEth(a) - parseEth(b)
  return formatEth(result < 0n ? 0n : result)
}

export function mulEth(value: string, quantity: number): string {
  if (!Number.isInteger(quantity) || quantity < 0)
    throw new Error(`Quantidade inválida: ${quantity}`)
  return formatEth(parseEth(value) * BigInt(quantity))
}

export function percentOf(value: string, bps: number): string {
  if (!Number.isInteger(bps) || bps < 0) throw new Error(`Pontos-base inválidos: ${bps}`)
  return formatEth((parseEth(value) * BigInt(bps)) / 10000n)
}

export function compareEth(a: string, b: string): -1 | 0 | 1 {
  const left = parseEth(a)
  const right = parseEth(b)
  return left < right ? -1 : left > right ? 1 : 0
}
