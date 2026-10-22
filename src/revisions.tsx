import { UI } from "./family";
import { ImplementationList } from "./implementations";
import { compareDrafts, implementationsDiffer } from "./contract.mjs";
import type { ComponentRecord, Draft, HistoryEntry } from "./types";
const { Disclosure, Button } = UI;
const labels: Record<keyof Draft, string> = {
  name: "Component name",
  summary: "Summary",
  category: "Category",
  maturity: "Maturity",
  targets: "Target platforms",
  acceptanceCriteria: "Acceptance criteria",
  evidence: "Usage and verification evidence",
  martletNotes: "Martlet notes",
  krigsvoldNotes: "Krigsvold notes",
  migration: "Migration guidance",
};
function display(value: unknown) {
  return Array.isArray(value)
    ? value.join(", ")
    : String(value || "None recorded");
}
export function RevisionReview({
  current,
  entries,
  loading,
  error,
  onRetry,
  onUse,
}: {
  current: ComponentRecord;
  entries: HistoryEntry[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onUse: (entry: HistoryEntry) => void;
}) {
  return (
    <Disclosure className="history" summary="Revision history">
      <p className="muted small">
        Review an earlier contract, then use it as a draft. Saving that draft
        creates a new revision and keeps the existing history.
      </p>
      {loading ? (
        <p role="status">Loading revision history…</p>
      ) : error ? (
        <div className="stack compact">
          <p>{error}</p>
          <Button variant="secondary" onClick={onRetry}>
            Retry revision history
          </Button>
        </div>
      ) : !entries.length ? (
        <p>No revisions have been recorded.</p>
      ) : (
        <ol>
          {entries.map((entry) => {
            const changes = compareDrafts(current, entry.snapshot);
            return (
              <li key={entry.revision}>
                <Disclosure
                  data-revision={entry.revision}
                  summary={`Revision ${entry.revision}${entry.revision === current.revision ? " (current)" : ""}`}
                >
                  <div className="revision-review stack compact">
                    <time dateTime={entry.at}>
                      {new Date(entry.at).toLocaleString("en-US")}
                    </time>
                    <p>
                      {entry.snapshot.name} · {entry.snapshot.maturity}
                    </p>
                    {changes.length ? (
                      <>
                        <p>Compared with saved revision {current.revision}:</p>
                        <dl className="revision-diff">
                          {changes.map((change) => (
                            <div key={change.key}>
                              <dt>{labels[change.key as keyof Draft]}</dt>
                              <dd>
                                <span className="small muted">Saved now</span>
                                <p>{display(change.current)}</p>
                              </dd>
                              <dd>
                                <span className="small muted">
                                  Revision {entry.revision}
                                </span>
                                <p>{display(change.previous)}</p>
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </>
                    ) : (
                      <p>This matches the saved contract.</p>
                    )}
                    {implementationsDiffer(
                      current.implementations,
                      entry.snapshot.implementations,
                    ) && (
                      <section
                        className="stack compact"
                        aria-label={`Implementation changes in revision ${entry.revision}`}
                      >
                        <h3>Implementation inventory changed</h3>
                        <div className="update-comparison">
                          <div className="stack compact">
                            <h4>Saved now</h4>
                            <ImplementationList
                              items={current.implementations}
                            />
                          </div>
                          <div className="stack compact">
                            <h4>Revision {entry.revision}</h4>
                            <ImplementationList
                              items={entry.snapshot.implementations}
                            />
                          </div>
                        </div>
                        <p>
                          Using this revision as a draft keeps the current
                          implementation inventory.
                        </p>
                      </section>
                    )}
                    {entry.revision < current.revision && (
                      <Button variant="secondary" onClick={() => onUse(entry)}>
                        Use revision {entry.revision} as draft
                      </Button>
                    )}
                  </div>
                </Disclosure>
              </li>
            );
          })}
        </ol>
      )}
    </Disclosure>
  );
}
