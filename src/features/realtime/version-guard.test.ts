import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createEventDeduper, isNewerVersion } from './version-guard.ts'

test('aplica quando não há estado atual', () => {
  assert.equal(isNewerVersion(undefined, { version: 1 }), true)
})

test('aplica quando a versão recebida é maior', () => {
  assert.equal(isNewerVersion({ version: 3 }, { version: 4 }), true)
})

test('ignora versão igual', () => {
  assert.equal(isNewerVersion({ version: 4 }, { version: 4 }), false)
})

test('ignora versão antiga', () => {
  assert.equal(isNewerVersion({ version: 9 }, { version: 2 }), false)
})

test('primeira vez que vê um evento, processa', () => {
  const accept = createEventDeduper()
  assert.equal(accept('evt_1'), true)
})

test('evento repetido é descartado', () => {
  const accept = createEventDeduper()
  accept('evt_1')
  assert.equal(accept('evt_1'), false)
  assert.equal(accept('evt_2'), true)
  assert.equal(accept('evt_2'), false)
})

test('esquece os eventos mais antigos além do limite', () => {
  const accept = createEventDeduper(3)
  accept('a')
  accept('b')
  accept('c')
  accept('d')
  assert.equal(accept('a'), true)
  assert.equal(accept('d'), false)
})

test('limite padrão segura quinhentos eventos', () => {
  const accept = createEventDeduper()
  for (let i = 0; i < 600; i += 1) accept(`evt_${i}`)
  assert.equal(accept('evt_599'), false)
  assert.equal(accept('evt_0'), true)
})
