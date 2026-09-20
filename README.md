# CitationLens

CitationLens is an evidence-first AI Buyer Visibility Audit for B2B SaaS and agencies.

The first offer is a $99 beta audit. The public site collects a work email, company, HTTPS company URL, primary category, up to three competitors, and one to three buyer-intent questions.

## Local development

```bash
npm install
npm run dev
```

## Deployment

This repository is the canonical CitationLens source. The current public deployment runs on Render and auto-deploys from main. The same repo can be imported into Vercel later without changing the application code.

The intake endpoint validates submissions and returns a receipt. Durable persistence and workspace integrations can be added independently without coupling the public site to a specific provider.
