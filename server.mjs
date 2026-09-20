import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const port = Number(process.env.PORT || 3000);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

async function readJson(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 100_000) throw new Error('payload_too_large');
  }
  return JSON.parse(data || '{}');
}

function validate(body) {
  const errors = [];
  if (typeof body.submissionId !== 'string' || body.submissionId.trim().length < 8) errors.push('submissionId');
  if (typeof body.workEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.workEmail.trim())) errors.push('workEmail');
  if (typeof body.companyName !== 'string' || body.companyName.trim().length < 2) errors.push('companyName');

  try {
    const url = new URL(String(body.companyUrl || '').trim());
    if (url.protocol !== 'https:' || !url.hostname) errors.push('companyUrl');
  } catch {
    errors.push('companyUrl');
  }

  if (typeof body.category !== 'string' || body.category.trim().length < 2) errors.push('category');
  if (!Array.isArray(body.competitors) || body.competitors.length > 3) errors.push('competitors');
  if (!Array.isArray(body.buyerQuestions) || body.buyerQuestions.length < 1 || body.buyerQuestions.length > 3) errors.push('buyerQuestions');
  return errors;
}

async function handler(req, res) {
  if (req.url === '/api/intake' && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const errors = validate(body);
      if (errors.length) return send(res, 400, JSON.stringify({ ok: false, error: 'validation_failed', fields: errors }), 'application/json; charset=utf-8');

      const cleanId = String(body.submissionId).replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase();
      return send(
        res,
        200,
        JSON.stringify({ ok: true, receiptId: `CL-${cleanId}`, message: 'Your audit request is recorded for review.' }),
        'application/json; charset=utf-8',
      );
    } catch (error) {
      const message = error instanceof Error && error.message === 'payload_too_large'
        ? 'payload_too_large'
        : 'invalid_request';
      return send(res, 400, JSON.stringify({ ok: false, error: message }), 'application/json; charset=utf-8');
    }
  }

  const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = normalize(rawPath).replace(/^\/+/, '');
  const candidate = join(root, safePath || 'index.html');
  const file = candidate.startsWith(root) ? candidate : join(root, 'index.html');

  try {
    const data = await readFile(file);
    return send(res, 200, data, types[extname(file)] || 'application/octet-stream');
  } catch {
    const fallback = await readFile(join(root, 'index.html'));
    return send(res, 200, fallback, 'text/html; charset=utf-8');
  }
}

createServer(handler).listen(port, '0.0.0.0', () => {
  console.log(`CitationLens listening on ${port}`);
});
