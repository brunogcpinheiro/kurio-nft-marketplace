import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canonicalJson, resolveIdempotentOrder } from './idempotency.ts'

const records = [{ key: 'k1', userId: 'ana', bodyHash: 'h1', orderId: 'ord_1' }]

test('unknown key creates a new order', () => {
  assert.deepEqual(resolveIdempotentOrder(records, 'k2', 'ana', 'h1'), { kind: 'new' })
})

test('same key, user and body replays the existing order', () => {
  assert.deepEqual(resolveIdempotentOrder(records, 'k1', 'ana', 'h1'), {
    kind: 'replay',
    orderId: 'ord_1',
  })
})

test('same key with a different body is a conflict', () => {
  assert.deepEqual(resolveIdempotentOrder(records, 'k1', 'ana', 'h2'), { kind: 'mismatch' })
})

test('keys are scoped per user', () => {
  assert.deepEqual(resolveIdempotentOrder(records, 'k1', 'bruno', 'h1'), { kind: 'new' })
})

test('canonicalJson ignores key order and undefined fields', () => {
  assert.equal(
    canonicalJson({ b: 1, a: [{ d: 2, c: 3 }], e: undefined }),
    canonicalJson({ a: [{ c: 3, d: 2 }], b: 1 }),
  )
})
