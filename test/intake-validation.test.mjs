import test from 'node:test';
import assert from 'node:assert/strict';
import { validateIntake } from '../lib/intake-validation.mjs';

test('accepts a complete intake and normalizes string fields', () => {
  const result = validateIntake({
    submissionId: 'sub-12345678',
    workEmail: ' owner@example.com ',
    companyName: ' Example Co ',
    companyUrl: 'https://example.com',
    category: ' B2B SaaS ',
    competitors: ['Acme'],
    buyerQuestions: ['best project management software for agencies'],
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      submissionId: 'sub-12345678',
      workEmail: 'owner@example.com',
      companyName: 'Example Co',
      companyUrl: 'https://example.com',
      category: 'B2B SaaS',
      competitors: ['Acme'],
      buyerQuestions: ['best project management software for agencies'],
    },
  });
});

test('rejects invalid intake fields without throwing', () => {
  const result = validateIntake({
    submissionId: 'x',
    workEmail: 'not-an-email',
    companyName: '',
    companyUrl: 'http://example.com',
    category: '',
    competitors: ['1', '2', '3', '4'],
    buyerQuestions: [],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.fields, [
    'submissionId',
    'workEmail',
    'companyName',
    'companyUrl',
    'category',
    'competitors',
    'buyerQuestions',
  ]);
});
