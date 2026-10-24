import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AppShell,
  Article,
  Button,
  Checkbox,
  ErrorSummary,
  Field,
  Notice,
  Select,
  TableOfContents,
  TextInput,
  type ContentsItem,
} from "@krigsvold/react";
import "@krigsvold/react/styles.css";
import "@krigsvold/theme/fonts.css";
import "./field-guide.css";

const contents: readonly ContentsItem[] = [
  { id: "retry-boundary", label: "Choose a retry boundary", depth: 2 },
  { id: "retry-budget", label: "Keep a bounded budget", depth: 3 },
  { id: "reading-preferences", label: "Reading preferences", depth: 2 },
];

type Preferences = { size: string; minutes: string; annotations: boolean };
const initial: Preferences = { size: "standard", minutes: "15", annotations: true };

function samePreferences(a: Preferences, b: Preferences) {
  return a.size === b.size && a.minutes === b.minutes && a.annotations === b.annotations;
}

/** Standalone page: render once, outside any other main/AppShell landmark. */
export default function FieldGuide() {
  const [draft, setDraft] = useState<Preferences>(initial);
  const [applied, setApplied] = useState<Preferences>(initial);
  const [minutesError, setMinutesError] = useState<string>();
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [saved, setSaved] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const minutesInput = useRef<HTMLInputElement>(null);
  const dirty = !samePreferences(draft, applied);

  useEffect(() => {
    if (validationAttempt > 0 && minutesError) errorSummary.current?.focus();
  }, [validationAttempt, minutesError]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
    if (key === "minutes") setMinutesError(undefined);
  }

  function applyPreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const control = minutesInput.current;
    if (!control || !control.validity.valid) {
      setMinutesError("Enter a whole number of minutes from 5 to 90.");
      setValidationAttempt((attempt) => attempt + 1);
      setSaved(false);
      return;
    }
    const next = { ...draft, minutes: String(control.valueAsNumber) };
    setDraft(next);
    setApplied(next);
    setMinutesError(undefined);
    setSaved(true);
  }

  return (
    <div className="krigsvold field-guide" data-krigsvold="light" data-reading-size={applied.size}>
      <AppShell
        navigationPlacement="none"
        brand="Technical field guide"
        navigation={null}
        utilities={<a href="#reading-preferences">Reading preferences</a>}
      >
        <Article
          title="Retry deliberately"
          eyebrow="Distributed systems / Field note 04"
          summary="A short guide to making repeated work safe, bounded, and observable."
          metadata={<p>Practice passage · 3 minute read · Original demonstration content</p>}
          contents={<TableOfContents label="Section index" variant="index" items={contents} />}
          footer={<p>Field note 04 · Preferences apply to this page until it is reloaded.</p>}
        >
          <section className="field-guide-passage" aria-labelledby="retry-boundary">
            <h2 id="retry-boundary" tabIndex={-1}>Choose a retry boundary</h2>
            <p>
              A timed-out request leaves an unanswered question: did the operation
              fail, or did its response arrive too late? Before repeating a write,
              define how the receiver recognizes work it has already accepted.
              A stable <code>operation_id</code> can identify the same intended
              operation across attempts.
              {applied.annotations && <> <a id="annotation-reference" href="#annotation-1" aria-label="Read annotation 1">[1]</a></>}
            </p>
            <h3 id="retry-budget" tabIndex={-1}>Keep a bounded budget</h3>
            <p>
              Give the operation a deadline and an attempt limit. Stop when either
              budget is exhausted, preserve the last useful outcome, and report
              what remains uncertain. Record the operation identifier and attempt
              number together so that one request can be traced across retries.
            </p>
            <pre aria-label="Illustrative retry limits"><code>{"operation_id: same value for every attempt\nmax_attempts: 3\ndeadline: 10 seconds"}</code></pre>
            {applied.annotations && (
              <aside className="field-guide-annotation" aria-labelledby="annotation-heading">
                <h3 id="annotation-heading">Reading annotation</h3>
                <p id="annotation-1" tabIndex={-1}>
                  <strong>1. Identity needs a receiver contract.</strong> A client
                  identifier alone does not prevent duplicate work. The receiver
                  must recognize repeated identifiers and define their lifetime
                  and response behavior. <a href="#annotation-reference">Return to passage</a>
                </p>
              </aside>
            )}
          </section>

          <section className="field-guide-preferences" aria-labelledby="reading-preferences">
            <h2 id="reading-preferences" tabIndex={-1}>Reading preferences</h2>
            <p>Choose how to read this page. Apply changes to update the passage.</p>
            <form noValidate onSubmit={applyPreferences} aria-labelledby="reading-preferences">
              {minutesError && (
                <ErrorSummary
                  ref={errorSummary}
                  title="Check your reading preferences"
                  errors={[{ message: minutesError, targetId: "reading-minutes" }]}
                />
              )}
              <Field id="reading-size" label="Passage text size" hint="Changes the passage and its annotation, including code.">
                {(props) => (
                  <Select {...props} name="reading-size" value={draft.size} onChange={(event) => update("size", event.target.value)}>
                    <option value="standard">Standard</option>
                    <option value="large">Large</option>
                  </Select>
                )}
              </Field>
              <Field
                id="reading-minutes"
                label="Session goal in minutes (required)"
                hint="Use a whole number from 5 to 90. This is a planning goal, not a timer."
                error={minutesError}
              >
                {(props) => (
                  <TextInput
                    {...props}
                    ref={minutesInput}
                    type="number"
                    name="reading-minutes"
                    min={5}
                    max={90}
                    step={1}
                    required
                    value={draft.minutes}
                    onChange={(event) => update("minutes", event.target.value)}
                  />
                )}
              </Field>
              <Checkbox
                name="show-annotations"
                label="Show reading annotations"
                checked={draft.annotations}
                onChange={(event) => update("annotations", event.target.checked)}
              />
              <div className="field-guide-actions">
                <Button type="submit">Apply preferences</Button>
                <p>{dirty ? "Unapplied changes" : `Current session goal: ${applied.minutes} minutes`}</p>
              </div>
              {saved && <Notice kind="success">Preferences applied for this page. Session goal: {applied.minutes} minutes.</Notice>}
              <p className="krigsvold-hint">Reloading restores the defaults. Section links keep your draft intact.</p>
            </form>
          </section>
        </Article>
      </AppShell>
    </div>
  );
}
