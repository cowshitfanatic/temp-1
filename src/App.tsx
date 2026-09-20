import { FormEvent, useMemo, useState } from 'react';

type FormState = {
  email: string;
  company: string;
  url: string;
  category: string;
  competitors: string;
  questions: string;
};

const examples = [
  'best project management software for agencies',
  'alternatives to Acme for mid-market teams',
  'best CRM for a small B2B SaaS company',
];

function splitList(value: string) {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}

function App() {
  const [form, setForm] = useState<FormState>({
    email: '',
    company: '',
    url: '',
    category: '',
    competitors: '',
    questions: '',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [receipt, setReceipt] = useState('');

  const ready = useMemo(
    () => Boolean(form.email && form.company && form.url && form.category && form.questions),
    [form],
  );

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setState('idle');
    setMessage('');
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || state === 'sending') return;

    setState('sending');
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
          workEmail: form.email,
          companyName: form.company,
          companyUrl: form.url,
          category: form.category,
          competitors: splitList(form.competitors).slice(0, 3),
          buyerQuestions: splitList(form.questions).slice(0, 3),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setState('error');
        setMessage(data.error === 'validation_failed'
          ? 'A few details need attention before we can start.'
          : 'The intake service is unavailable right now. Please try again.');
        return;
      }

      setReceipt(data.receiptId ?? '');
      setMessage(data.message ?? 'Your request is in the queue.');
      setState('success');
    } catch {
      setState('error');
      setMessage('The intake service is unavailable right now. Please try again.');
    }
  }

  return (
    <div className="shell">
      <header className="nav">
        <div className="brand"><span>CL</span> CitationLens <em>BETA</em></div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">AI BUYER VISIBILITY AUDIT</p>
            <h1>Know what AI says about your brand.</h1>
            <p className="lede">
              An evidence-first snapshot of how your company appears in buyer-intent AI answers —
              including who gets recommended instead and which sources are cited.
            </p>
            <div className="chips">
              <span>Buyer-intent prompts</span>
              <span>Competitor substitution</span>
              <span>Cited sources</span>
            </div>
          </div>
          <aside className="price">
            <p>BETA OFFER</p>
            <strong>$99</strong>
            <span>One documented AI Buyer Visibility Audit.</span>
            <small>A dated observation, not a ranking guarantee.</small>
          </aside>
        </section>

        <section className="signals">
          <p className="eyebrow">WHAT YOU GET</p>
          <h2>Evidence you can act on.</h2>
          <div className="grid">
            <article><b>01</b><h3>Presence</h3><p>Where your brand appeared, was absent, or was ambiguous across the questions that matter.</p></article>
            <article><b>02</b><h3>Substitution</h3><p>Which competitors appeared instead and what the answer context actually said.</p></article>
            <article><b>03</b><h3>Citations</h3><p>The pages and domains cited in observed answers, captured with the run date and environment.</p></article>
          </div>
        </section>

        <section className="request" id="request">
          <div>
            <p className="eyebrow">REQUEST YOUR AUDIT</p>
            <h2>Give us the buyer questions.</h2>
            <p className="copy">
              No account. No newsletter. Just the inputs needed to build a useful first snapshot.
            </p>
            <div className="examples">
              {examples.map((example) => <span key={example}>{example}</span>)}
            </div>
          </div>

          {state === 'success' ? (
            <div className="card success">
              <div className="check">✓</div>
              <p className="eyebrow">REQUEST RECEIVED</p>
              <h2>You’re in the queue.</h2>
              <p>{message}</p>
              {receipt && <code>{receipt}</code>}
              <small>Your result will be a dated evidence snapshot tied to the observed AI environment.</small>
            </div>
          ) : (
            <form className="card" onSubmit={submit}>
              <div className="fields">
                <label>Work email<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@company.com" required /></label>
                <label>Company name<input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Example Co" required /></label>
                <label>Company URL<input type="url" value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="https://example.com" required /></label>
                <label>Primary category<input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Project management software" required /></label>
                <label>Up to 3 competitors<textarea value={form.competitors} onChange={(e) => update('competitors', e.target.value)} placeholder={'Acme\nBeta\nGamma'} /></label>
                <label>1–3 buyer questions<textarea value={form.questions} onChange={(e) => update('questions', e.target.value)} placeholder={'best project management software for agencies\nalternatives to Acme'} required /></label>
              </div>
              {state === 'error' && <div className="error">{message}</div>}
              <button disabled={!ready || state === 'sending'}>{state === 'sending' ? 'Submitting…' : 'Request the $99 beta audit'}</button>
              <small>Submitting records a request for review. It does not guarantee a ranking, traffic increase, or revenue outcome.</small>
            </form>
          )}
        </section>

        <section className="note">
          <div><p className="eyebrow">THE IMPORTANT PART</p><h2>No magic “AI score.”</h2></div>
          <p>AI answers can change with the model, date, location, prompt wording, and other context. CitationLens documents observations and source evidence from a defined run.</p>
        </section>
      </main>

      <footer><span>CitationLens</span><span>Evidence first. Claims second.</span></footer>
    </div>
  );
}

export default App;