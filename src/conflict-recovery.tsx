import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { UI } from "./family";
import { api } from "./api";
import { recoveryFields, resolveRecovery, draftLabels } from "./recovery.mjs";
import { ImplementationList } from "./implementations";
import { implementationsDiffer } from "./contract.mjs";
import type { ComponentRecord, Draft } from "./types";
const {
  Button,
  Fieldset,
  Radio,
  Notice,
  ErrorSummary,
  DefinitionList,
  Disclosure,
} = UI;
const display = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value || "None recorded");
export function ConflictRecovery({
  base,
  draft,
  onAccept,
  onReturn,
}: {
  base: ComponentRecord;
  draft: Draft;
  onAccept: (latest: ComponentRecord, resolved: Draft) => void;
  onReturn: () => void;
}) {
  const [latest, setLatest] = useState<ComponentRecord | null>(null);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const errors = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    heading.current?.focus();
  }, []);
  useLayoutEffect(() => {
    if (failure || missing.length) errors.current?.focus();
  }, [failure, missing]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setFailure("");
    setMessage("");
    api
      .get(base.id, controller.signal)
      .then((record) => {
        recoveryFields(base, draft, record); // Reject wrong-identity/older responses before accepting context.
        if (active) {
          setLatest(record);
          setChoices({});
          setMissing([]);
          setMessage(
            `Loaded saved revision ${record.revision}. Choose a source for every difference; no changes have been saved.`,
          );
        }
      })
      .catch((error) => {
        if (active)
          setFailure(
            `The latest saved specification could not be compared. Your original draft and any loaded comparison choices are still here. ${error instanceof Error && error.message.startsWith("The loaded record") ? error.message : "Check the local server and retry."}`,
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [base.id, attempt]);
  const fields = latest ? recoveryFields(base, draft, latest) : [];
  function accept() {
    if (!latest || loading || failure) return;
    const absent = fields
      .filter((field) => !choices[field.key])
      .map((field) => field.key);
    setMissing(absent);
    if (!absent.length)
      onAccept(latest, resolveRecovery(base, draft, latest, choices) as Draft);
  }
  return (
    <section
      className="conflict-recovery stack"
      aria-labelledby="recovery-title"
      aria-busy={loading}
    >
      <h3 id="recovery-title" tabIndex={-1} ref={heading}>
        Compare retained draft
      </h3>
      <p>
        Your editing base is revision {base.revision}. Compare its values, your
        retained draft, and the latest saved specification. Every difference
        requires a choice. This only prepares an editing draft; the normal Save
        still checks its revision.
      </p>
      <p>
        Comparison uses stored-value rules: outer text whitespace and target
        order do not count as contract changes. Your original draft remains
        available until you apply choices or leave editing.
      </p>
      <div className="actions">
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => setAttempt((a) => a + 1)}
        >
          {loading
            ? "Loading latest specification…"
            : "Refresh comparison and clear choices"}
        </Button>
        <Button variant="quiet" onClick={onReturn}>
          Discard choices and return to my draft
        </Button>
      </div>
      <p className="small muted">
        A successful refresh clears comparison choices for the newly loaded
        revision. A failed refresh retains them and requires a successful retry
        before applying.
      </p>
      {message && <Notice>{message}</Notice>}
      {(failure || missing.length > 0) && (
        <ErrorSummary
          ref={errors}
          title={failure || "Choose a source for each differing field."}
          errors={missing.map((key) => ({
            message: `${draftLabels[key as keyof Draft]}: choose your draft or the saved value.`,
            targetId: `recover-${key}`,
          }))}
        >
          {failure && (
            <Button onClick={() => setAttempt((a) => a + 1)}>
              Retry comparison
            </Button>
          )}
        </ErrorSummary>
      )}
      {latest && (
        <>
          <p className="recovery-position">
            Comparing saved revision {latest.revision} with your draft from
            revision {base.revision}. Further saves in other windows can make
            this comparison old.
          </p>
          {fields.length ? (
            fields.map((field) => (
              <Fieldset
                key={field.key}
                id={`recover-${field.key}`}
                tabIndex={-1}
                className="recovery-field"
                legend={draftLabels[field.key as keyof Draft]}
                disabled={loading}
                error={
                  missing.includes(field.key)
                    ? "Choose one source for this field."
                    : undefined
                }
              >
                <p className="small muted">
                  {field.localChanged
                    ? "Changed in your draft."
                    : "Unchanged in your draft."}{" "}
                  {field.savedChanged
                    ? "Changed in the saved record."
                    : "Unchanged in the saved record."}
                </p>
                <DefinitionList
                  className="recovery-values"
                  items={[
                    {
                      id: "base",
                      term: `Editing base · Revision ${base.revision}`,
                      description: display(field.base),
                    },
                    {
                      id: "draft",
                      term: "Your retained draft",
                      description: display(field.draft),
                    },
                    {
                      id: "saved",
                      term: `Saved now · Revision ${latest.revision}`,
                      description: display(field.saved),
                    },
                  ]}
                />
                <div className="recovery-choices">
                  {[
                    ["draft", "Use my draft"],
                    ["saved", `Use saved revision ${latest.revision}`],
                  ].map(([value, label]) => (
                    <Radio
                      key={value}
                      label={label}
                      name={`recover-${field.key}`}
                      value={value}
                      checked={choices[field.key] === value}
                      onChange={() => {
                        setChoices((previous) => ({
                          ...previous,
                          [field.key]: value,
                        }));
                        setMissing((previous) =>
                          previous.filter((key) => key !== field.key),
                        );
                      }}
                    />
                  ))}
                </div>
              </Fieldset>
            ))
          ) : (
            <Notice>
              Your draft matches the latest saved contract. Return to that saved
              revision without writing another revision.
            </Notice>
          )}
          <Disclosure summary="Implementation and review context retained from the latest record">
            <div className="stack compact">
              <ImplementationList items={latest.implementations} />
              <p>
                {implementationsDiffer(
                  base.implementations,
                  latest.implementations,
                )
                  ? "Implementation inventory changed since editing began."
                  : "Implementation inventory matches the editing base."}{" "}
                Applying choices keeps the latest inventory and local readiness
                metadata. Specification choices never import implementation
                claims or promote a review.
              </p>
            </div>
          </Disclosure>
          <Button disabled={loading || !!failure} onClick={accept}>
            {fields.length
              ? "Use choices as editing draft"
              : "Return to matching saved record"}
          </Button>
        </>
      )}
    </section>
  );
}
