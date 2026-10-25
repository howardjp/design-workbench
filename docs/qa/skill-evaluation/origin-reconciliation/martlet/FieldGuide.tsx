import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  Article, Button, Checkbox, ErrorSummary, Field, Notice,
  Select, TableOfContents, TextInput,
} from '@martlet/react';
import '@martlet/react/styles.css';
import '@martlet/theme/fonts.css';
import './field-guide.css';

type Preferences = { size: 'standard' | 'large'; annotations: boolean; minutes: string };
const defaults: Preferences = { size: 'standard', annotations: true, minutes: '20' };
function validate(value: Preferences): string | undefined {
  const minutes = Number(value.minutes);
  return value.minutes.trim() === '' || !Number.isInteger(minutes) || minutes < 5 || minutes > 90
    ? 'Enter a whole number from 5 to 90 minutes.' : undefined;
}

/** A standalone, session-only reading page; mount once as the document's main landmark. */
export default function FieldGuide() {
  const uid = useId().replaceAll(':', '');
  const id = (name: string) => `field-guide-${uid}-${name}`;
  const [draft, setDraft] = useState<Preferences>(defaults);
  const [applied, setApplied] = useState<Preferences>(defaults);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const error = attempts > 0 ? validate(draft) : undefined;
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  useEffect(() => {
    if (attempts > 0 && summaryRef.current) summaryRef.current.focus();
  }, [attempts]);
  useEffect(() => {
    if (!dirty) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [dirty]);

  function update(patch: Partial<Preferences>) {
    setDraft(previous => ({ ...previous, ...patch }));
    setMessage('');
  }
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempts(previous => previous + 1);
    if (validate(draft)) { setMessage(''); return; }
    setApplied({ ...draft, minutes: String(Number(draft.minutes)) });
    setDraft({ ...draft, minutes: String(Number(draft.minutes)) });
    setMessage('Reading preferences applied for this visit.');
  }
  function cancel() {
    setDraft({ ...applied });
    setAttempts(0);
    setMessage('Changes cancelled. Your applied preferences are unchanged.');
  }

  return (
    <div className="martlet field-guide" data-martlet="light" data-text-size={applied.size}>
      <a className="martlet-skip" href={`#${id('main')}`}>Skip to field guide</a>
      <main id={id('main')} tabIndex={-1} className="field-guide-main">
        <Article
          title="Observe before you intervene"
          eyebrow="Technical field guide / Troubleshooting"
          summary="A short method for investigating an intermittent service failure while preserving useful evidence."
          metadata="Practice note · 3 minute read"
          contents={<TableOfContents label="Section index" variant="index" items={[
            { id: id('evidence'), label: 'Start with evidence', depth: 2 },
            { id: id('baseline'), label: 'Record a baseline', depth: 3 },
            { id: id('variable'), label: 'Change one variable', depth: 3 },
            { id: id('preferences'), label: 'Reading preferences', depth: 2 },
          ]} />}
        >
          <h2 id={id('evidence')} tabIndex={-1}>Start with evidence</h2>
          <p>
            Treat a failure report as a starting point. Record the affected operation,
            the observation time, and the result you expected before changing the system.
            A useful note lets another person repeat the observation.
          </p>
          <h3 id={id('baseline')} tabIndex={-1}>Record a baseline</h3>
          <p>
            Compare a failed request with a successful request made under similar conditions
            {applied.annotations && <> <sup><a id={id('reference')} href={`#${id('annotation')}`} aria-label="Read annotation: comparable conditions">[a]</a></sup></>}.
            Keep the request identifier and elapsed time together. A single slow request
            describes an event; a small series helps you decide what to investigate next.
          </p>
          {applied.annotations && (
            <aside id={id('annotation')} tabIndex={-1} aria-labelledby={id('annotation-label')} className="field-guide-annotation">
              <strong id={id('annotation-label')}>Annotation a · Comparable conditions</strong>
              <p>Write down the client, endpoint, and test interval. Differences in those conditions may explain the comparison before any server change does.</p>
              <a href={`#${id('reference')}`}>Return to passage</a>
            </aside>
          )}
          <h3 id={id('variable')} tabIndex={-1}>Change one variable</h3>
          <p>
            State the question a change will answer, keep a copy of the previous setting,
            and repeat the same observation afterward. Record an inconclusive result as
            inconclusive so the next reader can distinguish evidence from expectation.
          </p>
          <h2 id={id('preferences')} tabIndex={-1}>Reading preferences</h2>
          <form noValidate onSubmit={apply} className="field-guide-form" aria-labelledby={id('preferences')}>
            <p id={id('scope')}>Apply changes to this page for this visit. Reloading restores the defaults.</p>
            {error && <ErrorSummary ref={summaryRef} title="Check your reading preferences" errors={[{ message: error, targetId: id('minutes') }]} />}
            <div className="field-guide-fields">
              <Field id={id('size')} label="Text size" hint="Choose a comfortable size for the reading passage.">
                {control => <Select {...control} name="textSize" value={draft.size} onChange={event => update({ size: event.target.value as Preferences['size'] })}>
                  <option value="standard">Standard</option><option value="large">Large</option>
                </Select>}
              </Field>
              <Field id={id('minutes')} label="Reading time per session (required)" hint="Choose a whole number from 5 to 90 minutes. This records a goal; it does not start a timer." error={error}>
                {control => <TextInput {...control} name="minutes" type="number" inputMode="numeric" required min={5} max={90} step={1} value={draft.minutes} onChange={event => update({ minutes: event.target.value })} />}
              </Field>
              <Checkbox name="annotations" checked={draft.annotations} onChange={event => update({ annotations: event.target.checked })} label="Show passage annotations" />
            </div>
            <p className="martlet-hint" aria-live="polite">{dirty ? 'You have unapplied changes.' : `Current reading goal: ${applied.minutes} minutes per session.`}</p>
            <div className="field-guide-actions">
              <Button type="submit">Apply reading preferences</Button>
              <Button type="button" variant="secondary" onClick={cancel} disabled={!dirty && !error}>Cancel changes</Button>
            </div>
            {message && <Notice kind="success">{message}</Notice>}
          </form>
        </Article>
      </main>
    </div>
  );
}
