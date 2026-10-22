import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { api, ApiError } from "./api";
import { UI } from "./family";
import type { ComponentRecord, ImportPreview } from "./types";
const { Button, Checkbox, Disclosure, ErrorSummary, Field, FileInput, Notice } =
  UI;
const maxBytes = 1024 * 1024;
const labels: Record<string, string> = {
  name: "Name",
  summary: "Summary",
  category: "Category",
  maturity: "Maturity",
  targets: "Target platforms",
  acceptanceCriteria: "Acceptance criteria",
  evidence: "Usage and verification evidence",
  martletNotes: "Martlet decisions",
  krigsvoldNotes: "Krigsvold decisions",
  migration: "Migration guidance",
};
const display = (value: unknown) =>
  value === null
    ? "New record"
    : Array.isArray(value)
      ? value.join(", ")
      : String(value || "None recorded");
export function ImportRegistry({
  onApplied,
  onBusy,
}: {
  onApplied: (records: ComponentRecord[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [selection, setSelection] = useState<{
    source: string;
    name: string;
    size: number;
  } | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [working, setWorking] = useState<"" | "reading" | "preview" | "apply">(
    "",
  );
  const [failure, setFailure] = useState("");
  const [fileError, setFileError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [stale, setStale] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLElement>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, []);
  useLayoutEffect(() => {
    if (failure) errorRef.current?.focus();
    else if (message) successRef.current?.focus();
    else if (preview) reviewRef.current?.focus();
  }, [failure, message, preview]);
  function clearFeedback() {
    setFailure("");
    setFileError("");
    setFields({});
    setMessage("");
    setReviewed(false);
    setStale(false);
  }
  function reset() {
    generation.current++;
    setSelection(null);
    setFileLabel("");
    setPreview(null);
    setWorking("");
    clearFeedback();
    if (fileInput.current) fileInput.current.value = "";
    fileInput.current?.focus();
  }
  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const ticket = ++generation.current;
    setWorking("");
    setSelection(null);
    setFileLabel(file?.name ?? "");
    setPreview(null);
    clearFeedback();
    if (!file) {
      setWorking("");
      return;
    }
    if (file.size > maxBytes) {
      setFailure("Choose a JSON export no larger than 1 MiB.");
      setFileError("Choose a JSON export no larger than 1 MiB.");
      return;
    }
    setWorking("reading");
    try {
      const bytes = await file.arrayBuffer();
      const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (mounted.current && ticket === generation.current)
        setSelection({ source, name: file.name, size: file.size });
    } catch {
      if (mounted.current && ticket === generation.current) {
        setFailure(
          "The selected file could not be read as UTF-8. Choose a UTF-8 JSON export.",
        );
        setFileError("Choose a UTF-8 JSON export.");
      }
    } finally {
      if (mounted.current && ticket === generation.current) setWorking("");
    }
  }
  async function review() {
    if (!selection || working) return;
    const ticket = ++generation.current;
    setWorking("preview");
    setPreview(null);
    clearFeedback();
    try {
      const result = await api.previewImport(selection.source, selection.name);
      if (mounted.current && ticket === generation.current) setPreview(result);
    } catch (error) {
      if (mounted.current && ticket === generation.current) {
        setFailure(
          error instanceof ApiError
            ? error.message
            : "The import preview could not be loaded. Your selected file is still here; retry Preview import.",
        );
        if (error instanceof ApiError) {
          setFields(error.fields);
          if (error.status === 422)
            setFileError("Correct the selected export, then preview it again.");
        }
      }
    } finally {
      if (mounted.current && ticket === generation.current) setWorking("");
    }
  }
  async function apply() {
    if (
      !selection ||
      !preview ||
      !reviewed ||
      working ||
      stale ||
      preview.conflicts.length ||
      !preview.changes.length
    )
      return;
    const ticket = ++generation.current;
    setWorking("apply");
    setFailure("");
    setMessage("");
    onBusy(true);
    try {
      const result = await api.applyImport(
        selection.source,
        selection.name,
        preview.token,
      );
      if (mounted.current && ticket === generation.current) {
        onApplied(result.components);
        setPreview(result.preview);
        setReviewed(false);
        setMessage(
          `${result.applied} component ${result.applied === 1 ? "contract" : "contracts"} imported. Earlier revisions were retained.`,
        );
      }
    } catch (error) {
      if (mounted.current && ticket === generation.current) {
        setReviewed(false);
        setStale(true);
        setFailure(
          error instanceof ApiError
            ? error.message
            : "The import result could not be confirmed. Preview the same file again to see what is saved before trying another import.",
        );
      }
    } finally {
      if (mounted.current && ticket === generation.current) setWorking("");
      onBusy(false);
    }
  }
  return (
    <section
      className="registry-import stack"
      aria-labelledby="import-title"
      aria-busy={!!working}
    >
      <div className="section-heading">
        <h2 id="import-title">Review an exported registry</h2>
        <p>
          Bring component specifications from a JSON export into this registry
          after reviewing the exact changes.
        </p>
      </div>
      <aside
        className="update-guidance stack compact"
        aria-label="Import policy"
      >
        <h3>Keep review decisions deliberate</h3>
        <p>
          Existing contracts keep their maturity and implementation inventory.
          New contracts start proposed, with no implementation claims. The file
          can supply specification text, targets, evidence, and migration
          guidance.
        </p>
        <p>
          Unchanged records are left alone. Missing records are retained. Name
          conflicts and stale source revisions block the entire import. This
          imports current specifications, not database backups or revision
          history.
        </p>
      </aside>
      <Field
        id="import-file"
        label="Registry JSON export"
        error={fileError}
        hint="One UTF-8 schema 1 export, up to 1 MiB and 500 components. A file extension alone does not establish a valid export."
      >
        {(props) => (
          <FileInput
            {...props}
            ref={fileInput}
            accept=".json,application/json"
            disabled={working === "preview" || working === "apply"}
            onChange={(event) => void chooseFile(event)}
          />
        )}
      </Field>
      {working && (
        <Notice>
          {working === "reading"
            ? "Reading the selected file…"
            : working === "preview"
              ? "Validating and preparing the import preview…"
              : "Applying the reviewed import…"}
        </Notice>
      )}
      {failure && (
        <ErrorSummary
          ref={errorRef}
          title={failure}
          errors={[
            ...(fileError
              ? [{ message: fileError, targetId: "import-file" }]
              : []),
            ...Object.values(fields).map((value) => ({ message: value })),
          ]}
        />
      )}
      {message && (
        <div ref={successRef} tabIndex={-1}>
          <Notice kind="success">{message}</Notice>
        </div>
      )}
      {selection && !working && (
        <p className="small muted">
          {selection.name} · {selection.size.toLocaleString("en-US")} bytes
          ready for preview
        </p>
      )}
      <div className="actions">
        <Button
          variant="secondary"
          disabled={!selection || !!working}
          onClick={() => void review()}
        >
          Preview import
        </Button>
        <Button
          variant="quiet"
          disabled={!fileLabel || !!working}
          onClick={reset}
        >
          Clear selected file
        </Button>
      </div>
      {preview && (
        <section
          className="import-review stack"
          ref={reviewRef}
          tabIndex={-1}
          aria-labelledby="import-review-title"
        >
          <h3 id="import-review-title">Import review</h3>
          <dl className="import-source">
            <div>
              <dt>Selected file label</dt>
              <dd>{preview.fileName}</dd>
            </div>
            <div>
              <dt>Export time stated in file</dt>
              <dd>
                {new Date(preview.exportedAt).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                  timeZoneName: "short",
                })}
              </dd>
            </div>
            <div>
              <dt>Submitted text fingerprint</dt>
              <dd>
                <code>{preview.documentHash}</code>
              </dd>
            </div>
          </dl>
          <p className="small muted">
            The file label and stated export time are source descriptions. This
            fingerprint identifies submitted text; it does not verify
            authorship.
          </p>
          <p>
            {`${preview.changes.filter((item) => item.kind === "add").length} new ${preview.changes.filter((item) => item.kind === "add").length === 1 ? "contract" : "contracts"} · ${preview.changes.filter((item) => item.kind === "update").length} ${preview.changes.filter((item) => item.kind === "update").length === 1 ? "update" : "updates"} · ${preview.unchanged} unchanged in this file`}
          </p>
          {preview.conflicts.length > 0 && (
            <ErrorSummary
              title="Resolve import conflicts"
              errors={preview.conflicts.map((item) => ({
                message: `${item.name}: ${item.message}`,
              }))}
            />
          )}
          {preview.retainedMaturity.length > 0 && (
            <Disclosure summary="Lifecycle decisions retained">
              <ul>
                {preview.retainedMaturity.map((item) => (
                  <li key={item.id}>
                    {item.name}: file states {item.requested}; import keeps{" "}
                    {item.applied}.
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}
          {preview.changes.length ? (
            <ol className="inventory-changes">
              {preview.changes.map((change) => (
                <li key={change.id} className="stack compact">
                  <h4>{change.name}</h4>
                  <p className="small muted">
                    {change.kind === "add"
                      ? "New proposed contract; no implementation claims"
                      : `Update saved revision ${change.revision}; maturity and implementations retained`}
                  </p>
                  <Disclosure
                    summary={`Review ${change.differences.length} fields for ${change.name}`}
                    open
                  >
                    <dl className="import-differences">
                      {change.differences.map((difference) => (
                        <div key={difference.key}>
                          <dt>{labels[difference.key] ?? difference.key}</dt>
                          <dd>
                            <div>
                              <strong>Saved before</strong>
                              <p>{display(difference.before)}</p>
                            </div>
                            <div>
                              <strong>After import</strong>
                              <p>{display(difference.after)}</p>
                            </div>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Disclosure>
                </li>
              ))}
            </ol>
          ) : (
            !preview.conflicts.length && (
              <Notice>No specification changes remain for this file.</Notice>
            )
          )}
          {preview.changes.length > 0 && (
            <div className="stack compact">
              <Checkbox
                label="I have reviewed these specification changes and the import policy."
                checked={reviewed}
                disabled={!!working || stale || !!preview.conflicts.length}
                onChange={(event) => setReviewed(event.target.checked)}
              />
              <div className="actions">
                <Button
                  disabled={
                    !reviewed ||
                    !!working ||
                    stale ||
                    !!preview.conflicts.length
                  }
                  onClick={() => void apply()}
                >
                  {working === "apply"
                    ? "Importing contracts…"
                    : `Import ${preview.changes.length} component ${preview.changes.length === 1 ? "contract" : "contracts"}`}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
