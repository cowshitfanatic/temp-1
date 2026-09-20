type Intake = {
  submissionId?: unknown;
  workEmail?: unknown;
  companyName?: unknown;
  companyUrl?: unknown;
  category?: unknown;
  competitors?: unknown;
  buyerQuestions?: unknown;
};

function validEmail(value: unknown) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validHttpsUrl(value: unknown) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function list(value: unknown, min: number, max: number) {
  return Array.isArray(value) && value.length >= min && value.length <= max &&
    value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

export default async function handler(req: { method?: string; body?: Intake }, res: { status: (code: number) => { json: (body: unknown) => void } }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = req.body ?? {};
  const errors: string[] = [];

  if (typeof body.submissionId !== 'string' || body.submissionId.trim().length < 8) errors.push('submissionId');
  if (!validEmail(body.workEmail)) errors.push('workEmail');
  if (typeof body.companyName !== 'string' || body.companyName.trim().length < 2) errors.push('companyName');
  if (!validHttpsUrl(body.companyUrl)) errors.push('companyUrl');
  if (typeof body.category !== 'string' || body.category.trim().length < 2) errors.push('category');
  if (!list(body.competitors, 0, 3)) errors.push('competitors');
  if (!list(body.buyerQuestions, 1, 3)) errors.push('buyerQuestions');

  if (errors.length) {
    return res.status(400).json({ ok: false, error: 'validation_failed', fields: errors });
  }

  const receiptId = `CL-${String(body.submissionId).replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase()}`;

  return res.status(200).json({
    ok: true,
    receiptId,
    message: 'Your audit request is recorded for review.',
  });
}