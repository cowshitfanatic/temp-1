const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

function validHttpsUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function validStringList(value, min, max) {
  return Array.isArray(value)
    && value.length >= min
    && value.length <= max
    && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

export function validateIntake(body) {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const fields = [];

  if (typeof input.submissionId !== 'string' || input.submissionId.trim().length < 8) fields.push('submissionId');
  if (!validEmail(input.workEmail)) fields.push('workEmail');
  if (typeof input.companyName !== 'string' || input.companyName.trim().length < 2) fields.push('companyName');
  if (!validHttpsUrl(input.companyUrl)) fields.push('companyUrl');
  if (typeof input.category !== 'string' || input.category.trim().length < 2) fields.push('category');
  if (!validStringList(input.competitors, 0, 3)) fields.push('competitors');
  if (!validStringList(input.buyerQuestions, 1, 3)) fields.push('buyerQuestions');

  if (fields.length) {
    return { ok: false, fields };
  }

  return {
    ok: true,
    value: {
      submissionId: input.submissionId.trim(),
      workEmail: input.workEmail.trim(),
      companyName: input.companyName.trim(),
      companyUrl: input.companyUrl.trim(),
      category: input.category.trim(),
      competitors: input.competitors.map((item) => item.trim()),
      buyerQuestions: input.buyerQuestions.map((item) => item.trim()),
    },
  };
}
