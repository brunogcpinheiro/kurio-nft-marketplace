import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createEventDeduper, isNewerVersion } from './version-guard.ts'

test('applies when there is no current state', () => {
  assert.equal(isNewerVersion(undefined, { version: 1 }), true)
})

test('applies when the incoming version is newer', () => {
  assert.equal(isNewerVersion({ version: 3 }, { version: 4 }), true)
})

test('ignores an equal version', () => {
  assert.equal(isNewerVersion({ version: 4 }, { version: 4 }), false)
})

test('ignores an older version', () => {
  assert.equal(isNewerVersion({ version: 9 }, { version: 2 }), false)
})

test('processes an event the first time it is seen', () => {
  const accept = createEventDeduper()
  assert.equal(accept('evt_1'), true)
})

test('drops a repeated event', () => {
  const accept = createEventDeduper()
  accept('evt_1')
  assert.equal(accept('evt_1'), false)
  assert.equal(accept('evt_2'), true)
  assert.equal(accept('evt_2'), false)
})

test('forgets the oldest events beyond the limit', () => {
  const accept = createEventDeduper(3)
  accept('a')
  accept('b')
  accept('c')
  accept('d')
  assert.equal(accept('a'), true)
  assert.equal(accept('d'), false)
})

test('default limit keeps five hundred events', () => {
  const accept = createEventDeduper()
  for (let i = 0; i < 600; i += 1) accept(`evt_${i}`)
  assert.equal(accept('evt_599'), false)
  assert.equal(accept('evt_0'), true)
})
