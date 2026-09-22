const EVENT_NAMES = new Set([
  'intake_submitted',
  'free_snapshot_requested',
  'audit_requested',
  'audit_paid',
  'audit_delivered',
  'repeat_request',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeAcquisitionEvent(input) {
  const fields = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, fields: ['eventId', 'eventName', 'occurredAt', 'payload'] };
  }

  if (typeof input.eventId !== 'string' || input.eventId.trim().length < 8) fields.push('eventId');
  if (typeof input.eventName !== 'string' || !EVENT_NAMES.has(input.eventName)) fields.push('eventName');

  let occurredAt;
  if (typeof input.occurredAt !== 'string') {
    fields.push('occurredAt');
  } else {
    const parsed = new Date(input.occurredAt);
    if (Number.isNaN(parsed.getTime())) fields.push('occurredAt');
    else occurredAt = parsed.toISOString();
  }

  if (!isPlainObject(input.payload)) fields.push('payload');

  if (fields.length) return { ok: false, fields };

  return {
    ok: true,
    value: {
      eventId: input.eventId.trim(),
      eventName: input.eventName,
      occurredAt,
      payload: input.payload,
    },
  };
}
