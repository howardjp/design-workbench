import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { UI } from "./family";
import { api } from "./api";
import type { ComponentRecord } from "./types";
const {
  Article,
  TableOfContents,
  Badge,
  Button,
  DataTable,
  ErrorSummary,
  Field,
  Notice,
  Select,
} = UI;
const sections = [
  { id: "reading-purpose", label: "Purpose and reach" },
  { id: "reading-contract", label: "Behavioral contract" },
  { id: "reading-implementations", label: "Recorded implementations" },
  { id: "reading-decisions", label: "Family decisions" },
  { id: "reading-evidence", label: "Usage and verification" },
  { id: "reading-migration", label: "Migration guidance" },
];
export function ReadingRoom({
  records,
  record,
  onSelect,
  onUpdated,
  onEdit,
}: {
  records: ComponentRecord[];
  record: ComponentRecord | null;
  onSelect: (id: string) => void;
  onUpdated: (record: ComponentRecord) => void;
  onEdit: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState("");
  const feedback = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    setRefreshing(false);
    setFailure("");
    setMessage("");
    return () => {
      request.current?.abort();
    };
  }, [record?.id]);
  const handledInitialFragment = useRef(false);
  useLayoutEffect(() => {
    if (!record || handledInitialFragment.current) return;
    handledInitialFragment.current = true;
    const section = sections.find((item) => `#${item.id}` === location.hash);
    if (section) {
      const target = document.getElementById(section.id);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "start" });
    }
  }, [record?.id]);
  useLayoutEffect(() => {
    if (failure) feedback.current?.focus();
  }, [failure]);
  async function refresh() {
    if (!record || refreshing) return;
    const controller = new AbortController();
    request.current = controller;
    setRefreshing(true);
    setFailure("");
    setMessage("");
    try {
      const result = await api.get(record.id, controller.signal);
      if (controller.signal.aborted) return;
      onUpdated(result);
      setMessage(`${result.name}: loaded saved revision ${result.revision}.`);
    } catch {
      if (!controller.signal.aborted)
        setFailure(
          "The saved specification could not be refreshed. The previously loaded revision is still available. Retry when the local server is available.",
        );
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }
  return (
    <section
      className="reading-room stack"
      aria-label="Specification reading room"
    >
      <div className="reading-controls">
        <Field label="Read a component">
          {(props) => (
            <Select
              {...props}
              value={record?.id ?? ""}
              disabled={refreshing || !records.length}
              onChange={(event) => onSelect(event.target.value)}
            >
              {!record && <option value="">Choose a component</option>}
              {[...records]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </Select>
          )}
        </Field>
        <div className="actions">
          <Button
            variant="secondary"
            disabled={!record || refreshing}
            onClick={() => void refresh()}
          >
            {refreshing ? "Refreshing specification…" : "Refresh specification"}
          </Button>
          <Button
            variant="secondary"
            disabled={!record || refreshing}
            onClick={() => window.print()}
          >
            Print specification
          </Button>
          <Button disabled={!record || refreshing} onClick={onEdit}>
            Edit this specification
          </Button>
        </div>
      </div>
      {failure && (
        <ErrorSummary ref={feedback} title={failure}>
          <Button
            variant="secondary"
            disabled={refreshing}
            onClick={() => void refresh()}
          >
            Retry specification
          </Button>
        </ErrorSummary>
      )}
      {message && <Notice kind="success">{message}</Notice>}
      {!record ? (
        <Notice>
          Choose a component to read its saved specification, or add a new
          component to this registry.
        </Notice>
      ) : (
        <Article
          title={record.name}
          titleLevel={2}
          eyebrow="Working component specification"
          summary={record.summary}
          metadata={
            <dl>
              <div>
                <dt>Revision</dt>
                <dd>{record.revision}</dd>
              </div>
              <div>
                <dt>Maturity</dt>
                <dd>
                  <Badge>{record.maturity}</Badge>
                </dd>
              </div>
              <div>
                <dt>Saved</dt>
                <dd>
                  <time dateTime={record.updatedAt}>
                    {new Date(record.updatedAt).toLocaleString("en-US", {
                      timeZone: "America/New_York",
                      timeZoneName: "short",
                    })}
                  </time>
                </dd>
              </div>
            </dl>
          }
          contents={<TableOfContents items={sections} />}
          contextLabel="Specification context"
          aside={
            <div className="stack compact">
              <h3>Reading this contract</h3>
              <p>
                This view shows saved revision {record.revision}, loaded in this
                window. Refresh to check for a later saved revision.
              </p>
              <p>
                Targets express intent. Availability records an implementation.
                Maturity requires separate evidence.
              </p>
              <p>
                Both family decisions are included so the same specification can
                be compared in either presentation.
              </p>
            </div>
          }
          footer={
            <p>
              Experimental reference experience · Source and component packages
              shared under MIT. This record does not publish packages or certify
              accessibility.
            </p>
          }
        >
          <section aria-labelledby="reading-purpose">
            <h3 id="reading-purpose" tabIndex={-1}>
              Purpose and reach
            </h3>
            <p>
              Classified as <strong>{record.category}</strong>. Intended
              platforms: <strong>{record.targets.join(", ")}</strong>.
            </p>
            <p>
              The specification describes a task and its acceptance criteria. A
              target platform can be recorded before an implementation exists;
              use the implementation inventory below to distinguish planned
              reach from available code.
            </p>
          </section>
          <section aria-labelledby="reading-contract">
            <h3 id="reading-contract" tabIndex={-1}>
              Behavioral contract
            </h3>
            <p>
              Review each requirement against the actual consumer and record the
              observations under usage and verification.
            </p>
            <ul>
              {record.acceptanceCriteria
                .split("\n")
                .filter(Boolean)
                .map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
            </ul>
          </section>
          <section aria-labelledby="reading-implementations">
            <h3 id="reading-implementations" tabIndex={-1}>
              Recorded implementations
            </h3>
            <p>
              Published and workspace availability remain distinct. These
              entries are the saved registry inventory; they are not a live
              query of a package registry.
            </p>
            {record.implementations.length ? (
              <DataTable caption="Recorded implementations for this specification">
                <thead>
                  <tr>
                    <th scope="col">Family</th>
                    <th scope="col">Platform</th>
                    <th scope="col">Package and version</th>
                    <th scope="col">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {record.implementations.map((item) => (
                    <tr key={`${item.family}/${item.platform}/${item.package}`}>
                      <th scope="row">
                        {item.family === "martlet" ? "Martlet" : "Krigsvold"}
                      </th>
                      <td>{item.platform}</td>
                      <td>
                        <code>{item.package}</code>
                        <br />
                        {item.version}
                      </td>
                      <td>
                        {item.state === "published"
                          ? "Published package"
                          : "Workspace package; unpublished"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <p>No implementation is recorded for this component.</p>
            )}
          </section>
          <section aria-labelledby="reading-decisions">
            <h3 id="reading-decisions" tabIndex={-1}>
              Family decisions
            </h3>
            <section aria-label="Martlet decisions">
              <h4>Martlet</h4>
              <p className="multiline">
                {record.martletNotes || "No Martlet decisions recorded."}
              </p>
            </section>
            <section aria-label="Krigsvold decisions">
              <h4>Krigsvold</h4>
              <p className="multiline">
                {record.krigsvoldNotes || "No Krigsvold decisions recorded."}
              </p>
            </section>
          </section>
          <section aria-labelledby="reading-evidence">
            <h3 id="reading-evidence" tabIndex={-1}>
              Usage and verification
            </h3>
            <p className="multiline">
              {record.evidence || "No usage or verification evidence recorded."}
            </p>
            <p>
              Evidence is a human-authored record of review. A lifecycle label
              alone does not establish sustained use, complete accessibility
              conformance, or support on an unimplemented platform.
            </p>
          </section>
          <section aria-labelledby="reading-migration">
            <h3 id="reading-migration" tabIndex={-1}>
              Migration guidance
            </h3>
            <p className="multiline">
              {record.migration || "No migration guidance recorded."}
            </p>
            <p>
              A deprecated contract requires a named transition and usable
              migration instructions. Reading or printing a specification does
              not change its lifecycle stage or revision.
            </p>
          </section>
        </Article>
      )}
    </section>
  );
}
