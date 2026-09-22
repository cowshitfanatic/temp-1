import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAcquisitionEvent } from '../lib/acquisition-events.mjs';

test('normalizes a valid acquisition event', () => {
  const result = normalizeAcquisitionEvent({
    eventId: 'evt-12345678',
    eventName: 'intake_submitted',
    occurredAt: '2026-09-21T18:00:00.000Z',
    payload: { submissionId: 'sub-12345678' },
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    eventId: 'evt-12345678',
    eventName: 'intake_submitted',
    occurredAt: '2026-09-21T18:00:00.000Z',
    payload: { submissionId: 'sub-12345678' },
  });
});

test('rejects unknown event names', () => {
  const result = normalizeAcquisitionEvent({
    eventId: 'evt-12345678',
    eventName: 'made_up_event',
    occurredAt: '2026-09-21T18:00:00.000Z',
    payload: {},
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.fields, ['eventName']);
});
