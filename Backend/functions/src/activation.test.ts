import test from 'node:test';
import assert from 'node:assert/strict';
import { hashValue } from './activation';

test('hashValue produces a deterministic sha256 digest', () => {
  assert.equal(hashValue('ACT-TEST-123'), 'fefe4fbd698ba5944c19af3c0838256f138bf6adc8d87f8e7f89a97d5d4decc9');
});
