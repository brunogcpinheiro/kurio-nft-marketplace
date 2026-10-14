import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addEth, compareEth, formatEth, mulEth, parseEth, percentOf, subEth } from './eth.ts'

test('parseEth converte string decimal em wei', () => {
  assert.equal(parseEth('1.19'), 1190000000000000000n)
  assert.equal(parseEth('0.016'), 16000000000000000n)
  assert.equal(parseEth('12'), 12000000000000000000n)
  assert.equal(parseEth('0.000000000000000001'), 1n)
})

test('parseEth rejeita entradas inválidas', () => {
  assert.throws(() => parseEth('1,5'))
  assert.throws(() => parseEth('abc'))
  assert.throws(() => parseEth(''))
  assert.throws(() => parseEth('1.1234567890123456789'))
})

test('formatEth mantém no mínimo duas casas e remove zeros sobrando', () => {
  assert.equal(formatEth(parseEth('26.846')), '26.846')
  assert.equal(formatEth(parseEth('2')), '2.00')
  assert.equal(formatEth(parseEth('0.016')), '0.016')
  assert.equal(formatEth(parseEth('1.10')), '1.10')
  assert.equal(formatEth(parseEth('0.5')), '0.50')
})

test('formatEth respeita o limite de casas decimais sem arredondar para cima', () => {
  assert.equal(formatEth(parseEth('1.23456789'), 4), '1.2345')
  assert.equal(formatEth(parseEth('1.23456789'), 2), '1.23')
  assert.equal(formatEth(parseEth('1.2'), 2), '1.20')
})

test('addEth soma com precisão exata', () => {
  assert.equal(addEth('2.38', '8.34', '16.11'), '26.83')
  assert.equal(addEth('0.1', '0.2'), '0.30')
  assert.equal(addEth('26.83', '0.016'), '26.846')
  assert.equal(addEth(), '0.00')
})

test('subEth subtrai e nunca fica negativo', () => {
  assert.equal(subEth('26.83', '2.683'), '24.147')
  assert.equal(subEth('1.00', '1.00'), '0.00')
  assert.equal(subEth('1.00', '2.00'), '0.00')
})

test('mulEth multiplica por quantidade inteira', () => {
  assert.equal(mulEth('1.19', 2), '2.38')
  assert.equal(mulEth('1.39', 6), '8.34')
  assert.equal(mulEth('1.79', 9), '16.11')
  assert.equal(mulEth('0.39', 0), '0.00')
  assert.throws(() => mulEth('1.00', 1.5))
})

test('percentOf aplica pontos-base', () => {
  assert.equal(percentOf('26.83', 1000), '2.683')
  assert.equal(percentOf('10', 2000), '2.00')
  assert.equal(percentOf('1', 0), '0.00')
})

test('compareEth ordena por valor numérico', () => {
  assert.equal(compareEth('0.39', '1.19'), -1)
  assert.equal(compareEth('1.19', '1.19'), 0)
  assert.equal(compareEth('12.30', '0.02'), 1)
  assert.equal(compareEth('1.10', '1.1'), 0)
})
