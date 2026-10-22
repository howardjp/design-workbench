import { UI } from "./family";
import { summarizeRegistry, sortRecords } from "./contract.mjs";
import type { ComponentRecord } from "./types";
const { Button, DataTable, Badge } = UI;
export function ReadinessDashboard({
  records,
  onReview,
  onInspect,
}: {
  records: ComponentRecord[];
  onReview: (filters?: {
    maturity?: string;
    platform?: string;
    evidence?: string;
  }) => void;
  onInspect: (record: ComponentRecord) => void;
}) {
  const summary = summarizeRegistry(records);
  const recent = (
    sortRecords(records, "updatedAt", "desc") as ComponentRecord[]
  ).slice(0, 5);
  return (
    <div className="overview stack">
      <section className="stack" aria-labelledby="readiness-heading">
        <div className="section-heading">
          <p className="eyebrow">Where the work stands</p>
          <h2 id="readiness-heading">Contract readiness</h2>
          <p>
            These counts come from saved component records. A package release
            and a stable contract are different decisions.
          </p>
        </div>
        <dl className="readiness-numbers">
          <div>
            <dt>Components recorded</dt>
            <dd>{summary.total}</dd>
          </div>
          <div>
            <dt>Stable contracts</dt>
            <dd>{summary.stable}</dd>
          </div>
          <div>
            <dt>Awaiting usage evidence</dt>
            <dd>{summary.missingEvidence}</dd>
          </div>
          <div>
            <dt>No recorded implementation</dt>
            <dd>{summary.missingImplementations}</dd>
          </div>
        </dl>
        <div className="actions">
          <Button onClick={() => onReview({ evidence: "missing" })}>
            Review missing evidence
          </Button>
          <Button
            variant="secondary"
            onClick={() => onReview({ maturity: "experimental" })}
          >
            Review experimental contracts
          </Button>
        </div>
      </section>
      <div className="overview-layout">
        <section className="stack" aria-labelledby="coverage-heading">
          <div>
            <h2 id="coverage-heading">Implementation coverage</h2>
            <p className="muted">
              Targets express intent. Published and workspace counts reflect the
              recorded inventory.
            </p>
          </div>
          <DataTable caption="Recorded implementation coverage">
            <thead>
              <tr>
                <th scope="col">Family / platform</th>
                <th scope="col">Targeted</th>
                <th scope="col">Published</th>
                <th scope="col">Workspace</th>
                <th scope="col">Targeted, absent</th>
              </tr>
            </thead>
            <tbody>
              {summary.coverage.map((row) => (
                <tr key={row.family + row.platform}>
                  <th scope="row">
                    <span className="coverage-family">{row.family}</span>
                    {row.platform}
                  </th>
                  <td>{row.targeted}</td>
                  <td>{row.published}</td>
                  <td>{row.workspace}</td>
                  <td>{row.unimplemented}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          <p className="small muted">
            Workspace implementations are experimental and unpublished. Recorded
            availability can lag releases; review the package inventory before a
            release decision.
          </p>
        </section>
        <aside
          className="review-guidance stack"
          aria-labelledby="next-review-heading"
        >
          <p className="eyebrow">The next useful decision</p>
          <h2 id="next-review-heading">Start with a real task</h2>
          <p>
            A stable contract needs a real consumer and a recorded task, along
            with behavioral and accessibility checks. Keep unresolved problems
            visible.
          </p>
          <ol>
            <li>Choose a component used in current work.</li>
            <li>Record the consumer, task, and observed result.</li>
            <li>
              Change a failed generalization, then return the improvement to its
              original consumer.
            </li>
          </ol>
          <Button variant="secondary" onClick={() => onReview()}>
            Open the inventory
          </Button>
        </aside>
      </div>
      <section className="stack" aria-labelledby="recent-heading">
        <div>
          <h2 id="recent-heading">Recently recorded</h2>
          <p className="muted">
            Saved records, latest first. Initial inventory entries are included.
          </p>
        </div>
        {recent.length ? (
          <ul className="recent-records">
            {recent.map((record) => (
              <li key={record.id}>
                <div>
                  <button
                    className="record-link"
                    onClick={() => onInspect(record)}
                  >
                    <span className="record-name">{record.name}</span>
                    <span className="record-category">
                      Revision {record.revision}
                    </span>
                  </button>
                </div>
                <Badge>{record.maturity}</Badge>
                <time dateTime={record.updatedAt}>
                  {new Date(record.updatedAt).toLocaleString("en-US")}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p>No components have been recorded yet. Add a component to begin.</p>
        )}
      </section>
    </div>
  );
}
