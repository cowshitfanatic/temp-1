import { validateIntake, type Intake } from '../lib/intake-validation.mjs';

export default async function handler(req: { method?: string; body?: Intake }, res: { status: (code: number) => { json: (body: unknown) => void } }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const result = validateIntake(req.body ?? {});

  if (!result.ok) {
    return res.status(400).json({
      ok: false,
      error: 'validation_failed',
      fields: result.fields,
    });
  }

  const receiptId = `CL-${result.value.submissionId.replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase()}`;

  return res.status(200).json({
    ok: true,
    receiptId,
    message: 'Your audit request is recorded for review.',
  });
}
