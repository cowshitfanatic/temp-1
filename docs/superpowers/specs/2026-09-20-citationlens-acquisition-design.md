# CitationLens Acquisition System Design

**Date:** 2026-09-20  
**Status:** Design approved in conversation; written spec awaiting user review  
**Primary repository:** `cowshitfanatic/temp-1`

## 1. Product goal

CitationLens needs a repeatable, low-cost acquisition system that finds people experiencing the exact problem the product solves, demonstrates useful evidence publicly, converts a small subset into free snapshots and $99 paid audits, and turns completed work into additional research and acquisition material.

The immediate commercial objective is not scale. It is to create the smallest reliable loop that can produce the first stranger-paid audit and then learn from the result.

The system must optimize for evidence of demand rather than vanity activity.

### Success path

`buyer pain found -> prospect qualified -> useful response/content -> free snapshot or audit request -> paid audit -> completed evidence -> learning/content -> new prospects`

The system should support that loop without requiring a large CRM, paid advertising, complex billing infrastructure, or a large outbound team.

## 2. Scope

### In scope

1. Buyer-intent prospect discovery from public web discussions and other permitted public sources.
2. Structured prospect records with source, evidence, relevance, and suggested human response.
3. Acquisition experiment tracking.
4. Evidence-driven content planning and production queue.
5. Free one-question CitationLens snapshot as a future conversion surface.
6. Human-approved outreach queue.
7. Customer-to-content/research feedback loop.
8. Acquisition metrics focused on meaningful funnel events.
9. Notion operational views and Neon durable product data where appropriate.
10. Daily/weekly automation for research and review.

### Explicitly out of scope

1. Automated unsolicited DMs, chats, or mass comments.
2. Automated posting to communities without human approval.
3. Purchased or scraped email lists.
4. Paid advertising before organic demand is demonstrated.
5. Fake testimonials, synthetic customer counts, invented case studies, or unsupported performance claims.
6. AI visibility scores presented as deterministic rankings.
7. Complex marketing automation, lead scoring models, or CRM replacement before repeated demand justifies them.

## 3. Acquisition channels

CitationLens should use a channel portfolio rather than depend on one source.

### A. Public problem discovery

Primary purpose: discover active buyer pain.

Search for discussions involving:
- ChatGPT or other AI recommendation behavior
- AI search visibility
- GEO/AEO measurement
- prompt tracking
- citations and source attribution
- competitor substitutions
- AI referral measurement
- requests for tools, pricing, audits, or agency help

The first priority is explicit problem/solution intent, followed by repeated pain signals, followed by general educational interest.

Reddit is a research/discovery source, not an automated outbound channel. Reddit's current spam policy prohibits repeated or unsolicited mass engagement and specifically calls out automated tools used to facilitate spam; Reddit also states that bots/apps must not use automation for unsolicited outreach. citeturn937944search0turn937944search4

The acquisition system may collect and summarize permitted public discussion references for research, but it must not automatically contact the author.

### B. Evidence-led public content

The primary content format is an observed experiment, teardown, comparison, or research note.

Examples:
- buyer-intent prompt experiments
- observed brand-vs-competitor substitutions
- cited-domain analyses
- changes between dated AI-answer runs
- common evidence gaps found across audits

Claims must be explicitly bounded by the observed run. Content should state model/environment/date where material and avoid implying universal rankings.

### C. Free snapshot

A visitor should eventually be able to submit one company URL and one buyer question and receive a genuinely useful, limited evidence snapshot.

The free snapshot is not merely an email gate. Its job is to demonstrate the product's value and generate qualified demand for the $99 audit.

### D. Human-approved direct outreach

The system may identify a specific person or company, summarize why the prospect is relevant, and draft a personalized message.

The message enters a queue requiring explicit human approval before sending.

The system must preserve source context so a human can see why the message was drafted.

### E. Product Hunt / launch communities

Product Hunt is a later-stage distribution channel, not the first acquisition dependency. Product Hunt currently allows makers to self-hunt and explicitly advises against asking for upvotes, mass-messaging users, or coordinated/incentivized voting. citeturn948837search0turn948837search1turn948837search8

When CitationLens is launched there, the operating rule is authentic participation and feedback-seeking, not vote manipulation.

## 4. Acquisition operating model

The system is composed of five queues.

### Prospect queue

Each prospect contains:
- prospect/company name when available
- source platform
- source URL
- captured discussion or evidence summary
- pain/problem statement
- buyer-intent classification
- relevance rationale
- category
- potential product fit
- suggested response angle
- outreach status
- human notes

The system must distinguish between:
- research-only signals
- plausible prospects
- high-intent prospects
- existing customers

### Experiment queue

Each experiment contains:
- hypothesis
- target audience
- artifact/action
- start date
- success metric
- observed result
- conclusion
- next action

An experiment must have a measurable decision rule. Examples include:
- free snapshot completion rate
- audit-request conversion
- qualified-prospect reply rate
- content-driven visits
- number of repeated buyer questions discovered

### Content queue

Each content item contains:
- source evidence
- premise
- target audience/problem
- format
- draft
- publication channel
- publication status
- observed engagement
- reuse candidates

The content system should favor repurposing high-value evidence rather than generating unrelated content volume.

### Outreach queue

Each outreach candidate contains:
- prospect reference
- original source
- proposed message
- reason for contact
- human approval state
- sent state
- response state
- outcome

No automatic send state exists. The only outbound transition is human-approved.

### Customer queue

Each paid audit is linked to:
- customer
- requested questions
- observed findings
- delivered report
- recurring pain
- case-study permission state
- reusable anonymized insights

A completed audit should generate follow-on acquisition inputs only after the evidence has been reviewed and appropriately anonymized.

## 5. Funnel and measurement

The core dashboard should use these stages:

`research signal -> qualified prospect -> meaningful interaction -> free snapshot -> audit request -> paid audit -> completed audit -> repeat demand`

Primary metrics:
- qualified prospects found
- meaningful interactions
- free snapshots completed
- audit requests
- paid audits
- completed audits
- repeat requests
- time from signal to first response
- acquisition source by completed audit

Secondary metrics:
- content visits
- content engagement
- source/category frequency
- buyer-question frequency
- prospect-to-audit conversion
- audit completion time

Metrics intentionally excluded from the primary scoreboard:
- raw impressions
- follower count
- likes
- upvotes
- generic website sessions without downstream behavior

## 6. Data architecture

### Notion

Notion remains the operator-facing workspace.

Existing databases:
- CitationLens Leads
- CitationLens Audit Queue
- CitationLens Business HQ

Extend or add operator-facing records for:
- Acquisition Experiments
- Content Queue
- Outreach Queue

Notion is used for review and workflow, not as the sole source of durable application state.

### Neon

Neon stores the product's durable intake/audit state.

The acquisition subsystem should use Neon only where durable application state or event history materially benefits the product. It should not turn Neon into a duplicate of every Notion research note.

Potential product-side event data:
- intake submissions
- free snapshot submissions
- audit requests
- delivery events
- conversion events

### Source evidence

Source URLs must be retained for traceability. Public excerpts should be minimized to what is needed for context, and the system must respect source/platform terms and access restrictions.

## 7. Automation boundaries

### Daily

Prospect Radar:
- discover current high-intent discussions
- extract evidence
- deduplicate against prior prospects
- create/update prospect records
- return a compact review list

### Weekly

Market Review:
- inspect competing tools and positioning
- identify meaningful category changes
- suggest changes to messaging, offer, or targeting

Acquisition Review:
- summarize funnel movement
- identify the strongest acquisition signal
- identify the weakest funnel step
- propose one experiment for the next week

### Human-only actions

The following require explicit human approval:
- sending a direct message or email
- publishing to external communities
- publishing a customer-derived case study
- making a claim that is not directly supported by the underlying evidence
- turning a prospect into a paid commercial commitment

## 8. Free snapshot design

The free snapshot is deliberately small.

Input:
- company URL
- one buyer-intent question
- optional company name

Output:
- observed answer
- whether the target brand appeared
- competitor substitutions observed
- cited sources
- run date/environment
- concise limitations note

The output should avoid a single synthetic score. The same evidence model should power the paid audit.

The paid audit expands breadth and depth:
- several buyer-intent questions
- competitor set
- prioritized evidence gaps
- action recommendations
- dated report suitable for internal use

## 9. Messaging principles

Core positioning:
- evidence first
- buyer questions, not vanity scores
- documented observations, not guarantees
- competitors and citations are part of the evidence
- useful output over generic AI-search advice

Avoid:
- "rank #1 in ChatGPT"
- "guaranteed AI visibility"
- "we will increase traffic"
- unsupported market-size/customer claims
- fake scarcity
- fear-based claims that cannot be evidenced

## 10. Acquisition experiments

The initial experiment backlog should cover multiple acquisition mechanisms without overbuilding.

Experiment 1: high-intent discussion response
- identify a small set of explicit buyer-intent discussions
- write highly contextual responses
- measure meaningful replies and visits

Experiment 2: evidence post
- publish one compact AI-answer experiment
- measure visits and free-snapshot/audit behavior

Experiment 3: free snapshot
- launch one-question snapshot
- measure completion and upgrade intent

Experiment 4: niche focus
- compare one or two narrow B2B categories
- measure prospect quality and audit demand

Experiment 5: completed-audit content
- publish an anonymized finding if permission and evidence support it
- measure downstream interest

One experiment should be changed at a time where practical so the result can be interpreted.

## 11. Guardrails

1. No automated unsolicited outreach.
2. No automated community participation that substitutes for a human.
3. No fabricated evidence.
4. No unsupported claims in prospecting or content.
5. No false testimonials or fabricated social proof.
6. No publication of private customer information.
7. Preserve source URL and context for every prospecting lead.
8. Mark uncertain inferences as uncertain.
9. Allow human dismissal of poor prospects and record the reason so the scout improves.
10. Prefer the smallest data collection necessary for the acquisition purpose.

## 12. Implementation sequence

Phase 1: operator foundation
- acquisition experiment database
- outreach queue
- prospect schema improvements
- metrics definitions
- acquisition HQ documentation

Phase 2: discovery automation
- upgrade Prospect Scout into Buyer-Intent Radar
- deduplication
- evidence capture
- prioritization
- human review view

Phase 3: free conversion surface
- one-question snapshot intake
- durable event tracking
- result display
- upgrade path to $99 audit

Phase 4: content and outreach workflow
- evidence-to-content templates
- prospect-specific outreach drafts
- approval states
- response/outcome logging

Phase 5: optimization
- weekly acquisition review
- experiment recommendations
- source/category analysis
- customer-derived research loop

## 13. Definition of success for the first commercial slice

The subsystem is considered useful when it can reliably demonstrate this complete loop:

1. Find a real, relevant buyer-intent signal.
2. Preserve the evidence/source.
3. Generate a useful human-reviewable response or content angle.
4. Drive a visitor to CitationLens.
5. Let the visitor obtain a useful free snapshot or request the $99 audit.
6. Persist the resulting commercial event.
7. Deliver the paid audit.
8. Capture the learning.
9. Turn supported learning into another acquisition artifact.

The system does not need high volume to pass this bar. It needs a real, traceable loop that can be repeated and improved.
