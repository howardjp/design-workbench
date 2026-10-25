import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { api, ApiError } from "./api";
import { UI } from "./family";
import {
  blankReview,
  reviewAreas,
  reviewOutcomes,
  validateReview,
  summarizeReview,
} from "./review.mjs";
import type { ComponentRecord, ReviewCheck, ReviewState } from "./types";
const {
  Button,
  Checkbox,
  Disclosure,
  ErrorSummary,
  Field,
  Fieldset,
  Notice,
  Radio,
  Select,
  Textarea,
} = UI;
type Props = {
  records: ComponentRecord[];
  record: ComponentRecord | null;
  onSelect: (record: ComponentRecord) => void;
  onUpdated: (record: ComponentRecord) => void;
  onEdit: () => void;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
  onGuard: (action: () => void) => void;
};
const stamp = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
export function ReadinessReviews(props: Props) {
  return (
    <section
      className="readiness-review stack"
      aria-labelledby="review-workspace-title"
    >
      <div className="section-heading">
        <h2 id="review-workspace-title">
          Record observations before a release decision
        </h2>
        <p>
          Review actual use, supporting results, and unresolved work for the
          same contract in both families.
        </p>
      </div>
      <Field label="Component to review">
        {(control) => (
          <Select
            {...control}
            value={props.record?.id ?? ""}
            disabled={!props.records.length}
            onChange={(event) => {
              const record = props.records.find(
                (item) => item.id === event.target.value,
              );
              if (record) props.onSelect(record);
            }}
          >
            {!props.records.length && (
              <option value="">No components recorded</option>
            )}
            {props.records.map((record) => (
              <option key={record.id} value={record.id}>
                {record.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {props.record ? (
        <ReviewEditor key={props.record.id} id={props.record.id} {...props} />
      ) : (
        <Notice>
          No component is available for review. Add a contract in the inventory
          first.
        </Notice>
      )}
    </section>
  );
}
function ReviewEditor({
  id,
  onUpdated,
  onEdit,
  onDirty,
  onBusy,
  onGuard,
}: Props & { id: string }) {
  const [loaded, setLoaded] = useState<ReviewState | null>(null);
  const [checks, setChecks] = useState<ReviewCheck[]>(
    blankReview() as ReviewCheck[],
  );
  const [baseline, setBaseline] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState(""),
    [message, setMessage] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [mustRefresh, setMustRefresh] = useState(false);
  const feedback = useRef<HTMLDivElement>(null),
    success = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null),
    mounted = useRef(true);
  const dirty = !!loaded && JSON.stringify(checks) !== baseline;
  useLayoutEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  useEffect(() => {
    mounted.current = true;
    void refresh(false);
    return () => {
      mounted.current = false;
      request.current?.abort();
      onDirty(false);
    };
  }, [id]);
  useLayoutEffect(() => {
    if (failure || Object.keys(fields).length) feedback.current?.focus();
    else if (message) success.current?.focus();
  }, [failure, fields, message]);
  function accept(result: ReviewState) {
    const next = result.record.review?.checks ?? blankReview();
    // Old observations remain available, but a changed contract requires deliberate new outcomes.
    const draft = result.current
      ? next
      : next.map((check) => ({ ...check, outcome: "not-reviewed" as const }));
    setLoaded(result);
    setChecks(draft as ReviewCheck[]);
    setBaseline(JSON.stringify(draft));
    setConfirmed(false);
    setMustRefresh(false);
    onUpdated(result.record);
  }
  async function refresh(notify = true) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setFailure("");
    setFields({});
    setMessage("");
    try {
      const result = await api.getReview(id, controller.signal);
      if (!controller.signal.aborted && mounted.current) {
        accept(result);
        if (notify)
          setMessage(
            `Loaded ${result.record.name} at revision ${result.record.revision}.`,
          );
      }
    } catch (error) {
      if (!controller.signal.aborted && mounted.current)
        setFailure(
          "The saved review could not be loaded. Any review draft and previously loaded specification remain here; retry when the local service is available.",
        );
    } finally {
      if (!controller.signal.aborted && mounted.current) setLoading(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!loaded || saving || loading || mustRefresh) return;
    const errors = validateReview(checks) as Record<string, string>;
    if (!confirmed)
      errors.confirmation =
        "Confirm that you reviewed these observations against the displayed specification and inventory.";
    setFields(errors);
    setFailure("");
    setMessage("");
    if (Object.keys(errors).length) return;
    setSaving(true);
    onBusy(true);
    try {
      const result = await api.saveReview(
        id,
        checks,
        loaded.record.revision,
        confirmed,
      );
      if (mounted.current) {
        accept(result);
        setMessage(
          `Readiness review saved. Revision ${result.record.revision} retains the specification and maturity.`,
        );
      }
    } catch (error) {
      if (mounted.current) {
        if (error instanceof ApiError) {
          setFields(error.fields);
          setMustRefresh(error.status === 409);
          setFailure(error.message);
        } else {
          setMustRefresh(true);
          setFailure(
            "The save result could not be confirmed. Your review draft remains here. Refresh the saved review before trying another save.",
          );
        }
        setConfirmed(false);
      }
    } finally {
      if (mounted.current) setSaving(false);
      onBusy(false);
    }
  }
  const counts = summarizeReview(checks),
    record = loaded?.record;
  return (
    <div className="stack" aria-busy={loading || saving}>
      <aside
        className="review-guidance stack compact"
        aria-label="Readiness review policy"
      >
        <h3>Observations inform a separate decision</h3>
        <p>
          These are locally recorded assertions, not independent certification.
          A pass needs concrete observations. Saving never changes maturity,
          implementation claims, package versions, or publication.
        </p>
        <p>
          A review covers the displayed specification and both implementation
          inventories. Changes to either require renewed outcomes. Package
          publication, manual verification, and support commitments remain
          deliberate work.
        </p>
      </aside>
      <div className="actions">
        <Button
          variant="secondary"
          disabled={loading || saving}
          onClick={() => onGuard(() => void refresh())}
        >
          {loaded ? "Refresh saved review" : "Retry loading review"}
        </Button>
        {loaded && (
          <Button variant="quiet" disabled={loading || saving} onClick={onEdit}>
            Edit specification
          </Button>
        )}
      </div>
      {loading && <Notice>Loading the saved specification and review…</Notice>}
      {(failure || Object.keys(fields).length > 0) && (
        <ErrorSummary
          ref={feedback}
          title={failure || "The readiness review needs a few changes."}
          errors={Object.entries(fields).map(([key, value]) => ({
            message: value,
            targetId:
              key === "confirmation"
                ? "review-confirmation"
                : reviewAreas.some((area) => area.id === key)
                  ? `review-area-${key}`
                  : undefined,
          }))}
        />
      )}
      {message && (
        <div ref={success} tabIndex={-1}>
          <Notice kind="success">{message}</Notice>
        </div>
      )}
      {record && loaded && (
        <>
          <section
            className="review-status stack compact"
            aria-labelledby="review-status-title"
          >
            <h3 id="review-status-title">Saved review position</h3>
            <p>
              {record.review
                ? loaded.current
                  ? "Review matches the displayed contract and implementation inventory."
                  : "Specification or inventory changed; the saved review needs renewal."
                : "No readiness review has been saved for this component."}
            </p>
            {record.review && (
              <p>
                Recorded {stamp(record.review.recordedAt)} against revision{" "}
                {record.review.basedOnRevision}. {loaded.summary.passed} passed
                · {loaded.summary.needsWork} needs work ·{" "}
                {loaded.summary.unreviewed} not reviewed.
              </p>
            )}
            {record.review && !loaded.current && (
              <p>
                Prior observations are retained below and copied into draft
                notes. Outcomes start Not reviewed; recheck each area before
                recording a new result.
              </p>
            )}
          </section>
          <Disclosure summary="Specification and implementation context" open>
            <div className="review-context stack compact">
              <h3>{record.name}</h3>
              <p>
                Revision {record.revision} · {record.maturity} · Targets:{" "}
                {record.targets.join(", ")}
              </p>
              <p>{record.summary}</p>
              <dl>
                {[
                  ["Acceptance criteria", record.acceptanceCriteria],
                  ["Existing usage evidence", record.evidence],
                  ["Martlet decisions", record.martletNotes],
                  ["Krigsvold decisions", record.krigsvoldNotes],
                  ["Migration guidance", record.migration],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "None recorded"}</dd>
                  </div>
                ))}
              </dl>
              <h4>Both implementation inventories</h4>
              {record.implementations.length ? (
                <ul>
                  {record.implementations.map((item, index) => (
                    <li key={index}>
                      {item.family} · {item.platform} · {item.package}{" "}
                      {item.version} · {item.state}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No implementation is recorded.</p>
              )}
            </div>
          </Disclosure>
          {record.review && !loaded.current && (
            <Disclosure summary="Previous saved observations">
              <ul className="review-prior">
                {record.review.checks.map((check) => (
                  <li key={check.id}>
                    <strong>
                      {reviewAreas.find((area) => area.id === check.id)?.label}:{" "}
                      {check.outcome}
                    </strong>
                    <p>{check.notes || "None recorded"}</p>
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}
          <form
            className="stack review-form"
            noValidate
            onSubmit={(event) => void save(event)}
          >
            <p className="review-progress">
              Draft outcomes: {counts.passed} passed · {counts.needsWork} needs
              work · {counts.unreviewed} not reviewed. Recording six passes
              still requires a separate stability and release decision.
            </p>
            {reviewAreas.map((area) => {
              const check = checks.find((item) => item.id === area.id)!;
              return (
                <Fieldset
                  key={area.id}
                  id={`review-area-${area.id}`}
                  tabIndex={-1}
                  legend={area.label}
                  hint={area.hint}
                  error={fields[area.id]}
                  disabled={loading || saving}
                >
                  <div className="review-outcomes">
                    {reviewOutcomes.map((outcome) => (
                      <Radio
                        key={outcome.value}
                        name={`review-${area.id}`}
                        label={outcome.label}
                        value={outcome.value}
                        checked={check.outcome === outcome.value}
                        onChange={() => {
                          setChecks((previous) =>
                            previous.map((item) =>
                              item.id === area.id
                                ? {
                                    ...item,
                                    outcome:
                                      outcome.value as ReviewCheck["outcome"],
                                  }
                                : item,
                            ),
                          );
                          setConfirmed(false);
                          setMessage("");
                        }}
                      />
                    ))}
                  </div>
                  <Field
                    id={`review-notes-${area.id}`}
                    label={`${area.label} observations`}
                    hint="Up to 2000 characters. Passed and Needs work require at least 20 characters of concrete observations."
                    error={fields[area.id]}
                  >
                    {(props) => (
                      <Textarea
                        {...props}
                        rows={3}
                        maxLength={2000}
                        value={check.notes}
                        onChange={(event) => {
                          setChecks((previous) =>
                            previous.map((item) =>
                              item.id === area.id
                                ? { ...item, notes: event.target.value }
                                : item,
                            ),
                          );
                          setConfirmed(false);
                          setMessage("");
                        }}
                      />
                    )}
                  </Field>
                </Fieldset>
              );
            })}
            <Checkbox
              id="review-confirmation"
              label="I reviewed these observations against the displayed specification and implementation inventory."
              checked={confirmed}
              disabled={loading || saving || mustRefresh}
              aria-describedby={
                fields.confirmation ? "review-confirmation-error" : undefined
              }
              aria-invalid={fields.confirmation ? true : undefined}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            {fields.confirmation && (
              <p
                id="review-confirmation-error"
                className="review-confirmation-error"
              >
                {fields.confirmation}
              </p>
            )}
            <div className="actions">
              <Button type="submit" disabled={loading || saving || mustRefresh}>
                {saving ? "Saving review…" : "Save readiness review"}
              </Button>
            </div>
            {dirty && (
              <p className="small muted">
                This review has unsaved observations.
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
