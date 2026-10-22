import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import { ImplementationList } from "./implementations";
import { UI } from "./family";
import type { ComponentRecord, InventoryPreview } from "./types";
const { Button, Checkbox, Disclosure, ErrorSummary, Notice } = UI;
export function InventoryUpdates({
  onApplied,
  onBusy,
}: {
  onApplied: (records: ComponentRecord[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [preview, setPreview] = useState<InventoryPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const feedback = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (failure || message) feedback.current?.focus();
  }, [failure, message]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setPreview(null);
    setReviewed(false);
    setFailure("");
    setMessage("");
    api
      .previewInventory()
      .then((result) => {
        if (active) setPreview(result);
      })
      .catch(() => {
        if (active)
          setFailure(
            "The inventory preview could not be loaded. Retry when the local server is available.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  async function apply() {
    if (
      !preview ||
      !reviewed ||
      applying ||
      loading ||
      failure ||
      preview.conflicts.length ||
      !preview.changes.length
    )
      return;
    setApplying(true);
    onBusy(true);
    setFailure("");
    setMessage("");
    try {
      const result = await api.applyInventory(preview.token);
      onApplied(result.components);
      setPreview(result.preview);
      setReviewed(false);
      setMessage(
        `${result.applied} component updates saved. Specifications and earlier revisions were preserved.`,
      );
    } catch (error) {
      setReviewed(false);
      setFailure(
        error instanceof ApiError
          ? error.message
          : "The result could not be confirmed. Refresh the preview to see what is saved before trying again.",
      );
    } finally {
      setApplying(false);
      onBusy(false);
    }
  }
  return (
    <section
      className="inventory-updates stack"
      aria-labelledby="updates-title"
      aria-busy={loading || applying}
    >
      <div className="section-heading">
        <h2 id="updates-title">Review the bundled inventory</h2>
        <p>
          Bring this registry up to date with the component inventory included
          in this workbench.
        </p>
      </div>
      <aside
        className="update-guidance stack compact"
        aria-label="What an update changes"
      >
        <h3>A deliberate update</h3>
        <p>
          New components receive initial experimental specifications. Existing
          components keep their names, requirements, targets, maturity,
          evidence, and family decisions. Only matching implementation metadata
          is refreshed; other recorded implementations remain.
        </p>
        <p>
          Review both families below. Availability remains separate from
          maturity. These updates record the bundled package inventory and
          create revisions for changed records.
        </p>
      </aside>
      {loading && <Notice>Loading the inventory preview…</Notice>}
      {failure && <ErrorSummary ref={feedback} title={failure} />}
      {message && (
        <div ref={feedback} tabIndex={-1}>
          <Notice kind="success">{message}</Notice>
        </div>
      )}
      <div className="actions">
        <Button
          variant="secondary"
          disabled={loading || applying}
          onClick={() => setRetry((value) => value + 1)}
        >
          {failure && !preview ? "Retry preview" : "Refresh preview"}
        </Button>
      </div>
      {preview && (
        <>
          <p className="small muted">
            {preview.source} · Snapshot{" "}
            <code>{preview.inventoryVersion.slice(0, 12)}</code>
          </p>
          <p>
            {preview.changes.filter((item) => item.kind === "add").length} new
            components ·{" "}
            {
              preview.changes.filter((item) => item.kind === "implementations")
                .length
            }{" "}
            implementation{" "}
            {preview.changes.filter((item) => item.kind === "implementations")
              .length === 1
              ? "update"
              : "updates"}{" "}
            · {preview.unchanged} saved components unchanged
          </p>
          {preview.conflicts.length > 0 && (
            <ErrorSummary
              title="Resolve name conflicts before applying"
              errors={preview.conflicts.map((item) => ({
                message: `${item.name}: ${item.message}`,
              }))}
            />
          )}
          {preview.retained.length > 0 && (
            <Disclosure
              summary={`Other saved implementations (${preview.retained.length} ${preview.retained.length === 1 ? "component" : "components"})`}
            >
              <div className="stack compact">
                <p>
                  These entries are retained as recorded. The bundled inventory
                  does not confirm their availability.
                </p>
                {preview.retained.map((entry) => (
                  <section key={entry.id} className="stack compact">
                    <h3>{entry.name}</h3>
                    <ImplementationList items={entry.implementations} />
                  </section>
                ))}
              </div>
            </Disclosure>
          )}
          {preview.changes.length ? (
            <ol className="inventory-changes">
              {preview.changes.map((change) => (
                <li key={change.id} className="stack compact">
                  <div className="section-heading">
                    <h3>{change.name}</h3>
                    <p>
                      {change.kind === "add"
                        ? "New experimental component"
                        : `Implementation metadata · saved revision ${change.revision}`}
                    </p>
                  </div>
                  <div className="update-comparison">
                    <section
                      className="stack compact"
                      aria-label={`Saved implementations for ${change.name}`}
                    >
                      <h4>Saved implementations</h4>
                      <ImplementationList items={change.before} />
                    </section>
                    <section
                      className="stack compact"
                      aria-label={`Proposed implementations for ${change.name}`}
                    >
                      <h4>After this update</h4>
                      <ImplementationList items={change.after} />
                    </section>
                  </div>
                  {change.record && (
                    <Disclosure
                      summary={`Review initial specification for ${change.name}`}
                    >
                      <dl className="initial-specification">
                        {Object.entries(change.record)
                          .filter(
                            ([key]) => !["id", "implementations"].includes(key),
                          )
                          .map(([key, value]) => (
                            <div key={key}>
                              <dt>
                                {(
                                  {
                                    name: "Name",
                                    summary: "Summary",
                                    category: "Category",
                                    maturity: "Maturity",
                                    targets: "Targets",
                                    acceptanceCriteria: "Acceptance criteria",
                                    evidence: "Evidence",
                                    martletNotes: "Martlet decisions",
                                    krigsvoldNotes: "Krigsvold decisions",
                                    migration: "Migration guidance",
                                  } as Record<string, string>
                                )[key] ?? key}
                              </dt>
                              <dd>
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : String(value || "None recorded")}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </Disclosure>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            !preview.conflicts.length && (
              <Notice>
                The bundled inventory is already reflected in this registry.
              </Notice>
            )
          )}
          {preview.changes.length > 0 && (
            <div className="stack compact">
              <Checkbox
                label="I have reviewed these inventory changes."
                checked={reviewed}
                disabled={applying || !!failure || preview.conflicts.length > 0}
                onChange={(event) => setReviewed(event.target.checked)}
              />
              <div className="actions">
                <Button
                  disabled={
                    !reviewed ||
                    applying ||
                    !!failure ||
                    preview.conflicts.length > 0
                  }
                  onClick={() => void apply()}
                >
                  {applying
                    ? "Applying updates…"
                    : `Apply ${preview.changes.length} component updates`}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
