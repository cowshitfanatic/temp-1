# CitationLens Acquisition System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Turn CitationLens from a lead-intake landing page into a durable, evidence-first acquisition system that can capture prospects, commercial intake, experiments, and the first measurable conversion loop without overbuilding.

**Architecture:** Notion is the human operator workspace for prospects, experiments, content, and outreach review. Neon is durable application state for intake/audit records and acquisition events. The public site stays thin: it collects qualified requests and, later, a one-question free snapshot; outbound actions remain human-approved.

**Tech Stack:** React 19, TypeScript, Vite, Node HTTP server, Neon/Postgres, Notion, GitHub, Render, Node's built-in test runner.

**Spec:** docs/superpowers/specs/2026-09-20-citationlens-acquisition-design.md

## Global Constraints

- The immediate commercial objective is the first stranger-paid audit, not scale.
- No automated unsolicited DMs, chats, or mass comments.
- No automated community participation that substitutes for a human.
- No purchased or scraped email lists.
- No fake testimonials, synthetic customer counts, invented case studies, or unsupported performance claims.
- AI visibility observations are dated and scoped to the observed environment; never present a deterministic visibility score.
- Notion is the operator-facing workspace, not the sole durable application state.
- Neon stores durable application state and funnel events without duplicating every Notion research note.
- Source URLs and enough context to verify prospect relevance are retained.
- Direct outbound messages require explicit human approval before sending.

## Review Focus

- Duplicate form submissions with the same submission ID must not create duplicate durable intake records.
- Malformed or partial JSON requests must return a controlled 4xx response rather than crash the server.
- Acquisition events with unknown names or malformed payloads must be rejected rather than silently stored.
- Missing Neon configuration must fail clearly and must not cause the public intake endpoint to claim persistence.
- Sensitive/private prospect material must never leak into a public product response or an automated outbound draft.

---

### Task 1: Establish shared contracts and tests

**Files:**
- Create: lib/intake-validation.mjs
- Create: lib/acquisition-events.mjs
- Create: test/intake-validation.test.mjs
- Create: test/acquisition-events.test.mjs
- Modify: api/intake.ts
- Modify: server.mjs
- Modify: package.json

**Interfaces:**
- validateIntake(body) returns { ok: true, value } or { ok: false, fields }.
- normalizeAcquisitionEvent(input) returns { ok: true, value } or { ok: false, fields }.
- npm test runs the complete Node test suite.

- [ ] **Step 1: Write the failing intake-validation test

Create test/intake-validation.test.mjs:

- [ ] **~js
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
- [ ] **~

- [ ] **Step 2: Run the intake test to verify it fails

Run: npm test -- test/intake-validation.test.mjs

Expected: FAIL because the validation module and test script do not yet exist.

- [ ] **Step 3: Write the failing event-contract test

Create test/acquisition-events.test.mjs:

- [ ] **~js
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
- [ ] **~

- [ ] **Step 4: Run the event test to verify it fails

Run: npm test -- test/acquisition-events.test.mjs

Expected: FAIL because the event module does not yet exist.

- [ ] **Step 5: Implement the minimal contracts

Implement validateIntake and normalizeAcquisitionEvent. Preserve the current intake validation rules. The only allowed acquisition event names are:
- [ ] **~text
intake_submitted
free_snapshot_requested
audit_requested
audit_paid
audit_delivered
repeat_request
- [ ] **~

Normalize timestamps to ISO strings only after validating them as parseable dates.

- [ ] **Step 6: Replace duplicated validation

Update api/intake.ts and server.mjs to use the shared intake contract while preserving their existing HTTP response shapes.

- [ ] **Step 7: Add the test script and verify the suite

Add "test": "node --test test/*.test.mjs" to package.json.

Run: npm test

Expected: all contract tests PASS with exit code 0.

- [ ] **Step 8: Commit

- [ ] **~bash
git add lib test api/intake.ts server.mjs package.json
git commit -m "feat: add shared acquisition contracts"
- [ ] **~

---

### Task 2: Persist intake and funnel events in Neon

**Files:**
- Create: lib/neon.mjs
- Create: lib/acquisition-store.mjs
- Create: test/acquisition-store.test.mjs
- Modify: package.json
- Modify: api/intake.ts
- Modify: server.mjs

**Interfaces:**
- createAcquisitionStore({ sql }) creates the application store.
- store.recordIntake(intake) is idempotent on submissionId/intake_id.
- store.recordEvent(event) is idempotent on eventId/event_id.
- getSql() reads DATABASE_URL and throws a clear configuration error when absent.

- [ ] **Step 1: Write failing store tests

Use an in-memory fake SQL adapter. Prove duplicate intake and duplicate event calls return the existing record and do not create a second row:

- [ ] **~js
test('recordEvent is idempotent by eventId', async () => {
  const store = createAcquisitionStore({ sql: fakeSql });
  const event = validEvent();

  const first = await store.recordEvent(event);
  const second = await store.recordEvent(event);

  assert.equal(first.eventId, second.eventId);
  assert.equal(fakeSql.events.length, 1);
});

test('recordIntake is idempotent by submissionId', async () => {
  const store = createAcquisitionStore({ sql: fakeSql });
  const intake = validIntake();

  await store.recordIntake(intake);
  await store.recordIntake(intake);

  assert.equal(fakeSql.intakes.length, 1);
});
- [ ] **~

- [ ] **Step 2: Run the store test and watch it fail

Run: npm test -- test/acquisition-store.test.mjs

Expected: FAIL because the store module does not yet exist.

- [ ] **Step 3: Add the Neon dependency and adapter

Add @neondatabase/serverless. Create lib/neon.mjs with getSql() that reads DATABASE_URL and throws exactly:

DATABASE_URL is required for durable CitationLens persistence

when it is missing.

- [ ] **Step 4: Implement the minimal acquisition store

Create lib/acquisition-store.mjs. Use parameterized SQL against leads, audits, and a new acquisition_events table. recordIntake must upsert by intake_id. recordEvent must insert by event_id and on conflict return the existing event.

- [ ] **Step 5: Create the acquisition_events table in Neon

Run this schema against the CitationLens Neon database:

- [ ] **~sql
CREATE TABLE IF NOT EXISTS acquisition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'intake_submitted',
    'free_snapshot_requested',
    'audit_requested',
    'audit_paid',
    'audit_delivered',
    'repeat_request'
  )),
  occurred_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acquisition_events_name_time
  ON acquisition_events (event_name, occurred_at DESC);
- [ ] **~

- [ ] **Step 6: Wire intake persistence

After successful validation, record the lead/audit intake and an intake_submitted event before returning success. A persistence failure must return HTTP 503 with error persistence_unavailable. Never return a success receipt when durable storage failed.

- [ ] **Step 7: Run the full suite

Run: npm test

Expected: all tests PASS with exit code 0.

- [ ] **Step 8: Commit

- [ ] **~bash
git add lib test package.json api/intake.ts server.mjs
git commit -m "feat: persist acquisition events in Neon"
- [ ] **~

---

### Task 3: Build the Notion operator foundation

**Files:**
- Create: docs/acquisition-operator-runbook.md

**External changes:**
- Create CitationLens Acquisition Experiments.
- Create CitationLens Outreach Queue.
- Create CitationLens Content Queue.
- Extend CitationLens Leads only with fields required for buyer-intent review and source traceability.
- Add operator views for high-intent prospects, outreach awaiting approval, active experiments, and content needing review.

**Interfaces:**
- Prospects stay in CitationLens Leads.
- Experiments own hypotheses and decision rules.
- Outreach records include an approval state; there is no automatic-sent transition.
- Content records retain evidence source and publication state.

- [ ] **Step 1: Define the operator contract

Create docs/acquisition-operator-runbook.md with these required fields:

- [ ] **~text
Prospect:
source, source_url, evidence_summary, pain_statement,
buyer_intent, relevance, category, outreach_angle,
human_review, outreach_status

Experiment:
hypothesis, audience, artifact, start_date,
success_metric, result, conclusion, next_action, status

Outreach:
prospect, source, reason, draft_message,
approval_state, sent_state, response_state, outcome

Content:
evidence_source, premise, audience, format,
draft, channel, publication_status, observed_engagement, reuse_candidates
- [ ] **~

- [ ] **Step 2: Create the three Notion data sources

Use those exact concepts with appropriate text, URL, select/status, date, and relation fields. Keep the data model small; this is not a CRM replacement.

- [ ] **Step 3: Add operator views

Create:
- [ ] **~text
Buyer-intent prospects: buyer_intent = High, newest first
Outreach approval: approval_state = Needs Review
Experiments: status != Complete, oldest active first
Content review: publication_status = Draft or Needs Review
- [ ] **~

- [ ] **Step 4: Seed the five initial experiments

Create:
- [ ] **~text
High-intent discussion response
Evidence-led AI-answer experiment
One-question free snapshot
Niche focus test
Completed-audit content
- [ ] **~

Each record must have a concrete hypothesis and measurable success metric.

- [ ] **Step 5: Commit the runbook

- [ ] **~bash
git add docs/acquisition-operator-runbook.md
git commit -m "docs: define acquisition operator workflow"
- [ ] **~

---

### Task 4: Run the first acquisition campaign

**Files:**
- Create: docs/acquisition-first-campaign.md

**External actions:**
- Research current public buyer-intent discussions using permitted search/index access.
- Create qualified prospect records with source URLs and bounded evidence.
- Draft contextual, human-reviewable outreach responses without sending automatically.
- Create one evidence-led content draft.

**Interfaces:**
- Consumes Prospect, Outreach, and Content queues from Task 3.
- Every prospect preserves the original source URL and a relevance rationale.
- Every outbound draft remains in a non-sent approval state.

- [ ] **Step 1: Capture the campaign hypothesis

Write:

- [ ] **~text
Explicit complaints about inconsistent AI recommendations,
competitor substitution, or difficulty measuring AI visibility
should produce higher-quality acquisition signals than broad
GEO/AEO educational discussion.
- [ ] **~

- [ ] **Step 2: Research and record a small batch

Research at least five current public signals across more than one search surface. Record only evidence necessary to establish relevance. For Reddit, use public search/index results for discovery only; do not scrape Reddit and do not contact authors automatically.

- [ ] **Step 3: Draft contextual responses

For each qualified signal, write a concise response that solves or clarifies the stated problem first and mentions CitationLens only where naturally relevant. Do not use generic promotion.

- [ ] **Step 4: Create one evidence-led research note

Draft a compact public note about the distinction between brand recommendation, citation, and competitor substitution. Bound claims to the observed sample, date, and research environment.

- [ ] **Step 5: Review funnel movement

Record:
- [ ] **~text
signals_found
qualified_prospects
meaningful_interactions
free_snapshot_requests
audit_requests
paid_audits
- [ ] **~

Do not substitute impressions, followers, likes, or upvotes for these funnel measures.

- [ ] **Step 6: Commit the campaign artifact

- [ ] **~bash
git add docs/acquisition-first-campaign.md
git commit -m "docs: capture first acquisition campaign"
- [ ] **~

---

### Task 5: Add the one-question free snapshot

**Files:**
- Create: lib/free-snapshot.mjs
- Create: test/free-snapshot.test.mjs
- Create: api/snapshot.ts
- Modify: src/App.tsx
- Modify: src/index.css
- Modify: server.mjs

**Interfaces:**
- validateFreeSnapshotRequest(input) accepts one HTTPS company URL and exactly one buyer-intent question.
- buildSnapshotResult(observation) requires an observation, run date, and environment and never emits a numeric visibility score.
- A snapshot event is stored in Neon with a stable event ID.

- [ ] **Step 1: Write failing snapshot tests

Create test/free-snapshot.test.mjs:

~~~js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFreeSnapshotRequest, buildSnapshotResult } from '../lib/free-snapshot.mjs';

test('accepts exactly one buyer question', () => {
  const result = validateFreeSnapshotRequest({
    companyUrl: 'https://example.com',
    buyerQuestion: 'best project management software for agencies',
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      companyUrl: 'https://example.com',
      buyerQuestion: 'best project management software for agencies',
    },
  });
});

test('rejects zero buyer questions', () => {
  const result = validateFreeSnapshotRequest({
    companyUrl: 'https://example.com',
    buyerQuestion: '',
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.fields, ['buyerQuestion']);
});

test('builds a bounded observation with date and environment', () => {
  const result = buildSnapshotResult({
    answer: 'Example answer',
    brandStatus: 'absent',
    competitors: ['Acme'],
    citations: [{ title: 'Source', url: 'https://source.example/article' }],
    runDate: '2026-09-21',
    environment: 'manual-research',
  });

  assert.deepEqual(result, {
    answer: 'Example answer',
    brandStatus: 'absent',
    competitors: ['Acme'],
    citations: [{ title: 'Source', url: 'https://source.example/article' }],
    runDate: '2026-09-21',
    environment: 'manual-research',
    limitations: 'AI answers vary by model, date, location, prompt wording, and other context.',
  });
});
~~~

- [ ] **Step 2: Run the snapshot tests and watch them fail

Run: npm test -- test/free-snapshot.test.mjs

Expected: FAIL because the snapshot module does not yet exist.

- [ ] **Step 3: Implement the minimal snapshot contracts

Reject malformed URLs and anything other than one buyer question. Require run date and environment in result construction. Do not create a score.

- [ ] **Step 4: Add the public snapshot form and upgrade path

The UI asks for one company URL and one buyer-intent question and then displays the useful limited observation plus a dated-environment disclaimer and the $99 audit CTA. Do not gate the snapshot result behind email.

- [ ] **Step 5: Record the snapshot event

Store free_snapshot_requested with the minimum payload needed for funnel measurement and idempotency.

- [ ] **Step 6: Verify

Run:
- [ ] **~bash
npm test
npm run build
- [ ] **~

Expected: both commands exit 0.

- [ ] **Step 7: Commit

- [ ] **~bash
git add lib test api/snapshot.ts src/App.tsx src/index.css server.mjs
git commit -m "feat: add free buyer visibility snapshot"
- [ ] **~

---

### Task 6: Final verification and deployment readiness

**Files:**
- Modify only files required by review findings.

- [ ] **Step 1: Run the full suite

Run: npm test

Expected: 0 failures.

- [ ] **Step 2: Run the production build

Run: npm run build

Expected: exit 0.

- [ ] **Step 3: Review the whole branch against the spec

Check the complete diff against:
- docs/superpowers/specs/2026-09-20-citationlens-acquisition-design.md
- this plan
- every Review Focus item

Pay particular attention to unsupported claims and accidental automation of outbound actions.

- [ ] **Step 4: Verify deployed intake behavior

On the Render deployment, verify:
- valid intake returns a receipt only when persistence succeeds
- invalid intake returns 400
- malformed JSON returns 400
- free snapshot requests create durable acquisition events once Task 5 is complete

- [ ] **Step 5: Update the operator handoff

Record in docs/acquisition-operator-runbook.md:
- [ ] **~text
current public URL
current branch/commit
current funnel stages
human-only actions
next experiment
- [ ] **~

- [ ] **Step 6: Commit the verified handoff

- [ ] **~bash
git add docs/acquisition-operator-runbook.md
git commit -m "chore: verify acquisition system readiness"
- [ ] **~
