import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { UI } from "./family";
import { api } from "./api";
import { reviewAreas, reviewOutcomes } from "./review.mjs";
import { queueQuery, selectQueue, writeQueueQuery } from "./queue-query.mjs";
import type { ReviewQueueSnapshot } from "./types";
const {
  Button,
  Field,
  TextInput,
  Select,
  Notice,
  ErrorSummary,
  Badge,
  Pagination,
  Disclosure,
} = UI;
const positions = {
  "not-recorded": "Not recorded",
  renewal: "Needs renewal",
  current: "Current basis",
};
export function ReviewQueue({
  onOpen,
  onLocationChange,
}: {
  onOpen: (id: string) => void;
  onLocationChange: (search: string) => void;
}) {
  const [query, setQuery] = useState(() =>
    queueQuery(new URLSearchParams(location.search)),
  );
  const [snapshot, setSnapshot] = useState<ReviewQueueSnapshot | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState("");
  const errors = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setFailure("");
    api
      .reviewQueue(controller.signal)
      .then((result) => {
        if (active) setSnapshot(result);
      })
      .catch(() => {
        if (active)
          setFailure(
            "The review queue could not be loaded. Any displayed snapshot is retained; retry to see newer saved work.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);
  useLayoutEffect(() => {
    if (failure) errors.current?.focus();
  }, [failure]);
  const results = selectQueue(snapshot?.entries ?? [], query);
  const currentPage = snapshot ? results.page : query.page;
  useEffect(() => {
    if (snapshot && query.page !== results.page)
      setQuery((previous) => ({ ...previous, page: results.page }));
  }, [snapshot, query.page, results.page]);
  useEffect(() => {
    const url = new URL(location.href);
    writeQueueQuery(url.searchParams, { ...query, page: currentPage });
    window.history.replaceState(null, "", url);
    onLocationChange(url.search);
  }, [query, currentPage, onLocationChange]);
  function change(patch: Partial<typeof query>) {
    setQuery((previous) => ({ ...previous, ...patch, page: patch.page ?? 1 }));
  }
  const reviewHref = (id: string) => {
    const params = new URLSearchParams(location.search);
    writeQueueQuery(params, { ...query, page: currentPage });
    params.set("view", "review");
    params.set("record", id);
    return `?${params}`;
  };
  const picker = (
    label: string,
    key: "position" | "outcome" | "area" | "sort",
    options: { value: string; label: string }[],
  ) => (
    <Field label={label}>
      {(props) => (
        <Select
          {...props}
          value={query[key]}
          onChange={(event) => change({ [key]: event.target.value })}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
  return (
    <section
      className="review-queue stack"
      aria-labelledby="queue-title"
      aria-busy={loading}
    >
      <div className="section-heading">
        <h2 id="queue-title">Review queue</h2>
        <p>Find the next observation to record or renew.</p>
      </div>
      <p>
        Current basis means the saved observations match the specification and
        inventory. It does not mean six passes, verified evidence, stable
        maturity, or release approval. Missing and renewal reviews count as not
        reviewed for every current area.
      </p>
      <div className="actions">
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => setAttempt((value) => value + 1)}
        >
          {loading ? "Loading review queue…" : "Refresh review queue"}
        </Button>
      </div>
      {failure && (
        <ErrorSummary ref={errors} title="Review queue unavailable">
          <p>{failure}</p>
          <Button onClick={() => setAttempt((value) => value + 1)}>
            Retry loading queue
          </Button>
        </ErrorSummary>
      )}
      {snapshot && (
        <>
          <div className="queue-snapshot">
            <p className="queue-counts">
              {snapshot.counts.total} components · {snapshot.counts.notRecorded}{" "}
              not recorded · {snapshot.counts.renewal} need renewal ·{" "}
              {snapshot.counts.current} current basis ·{" "}
              {snapshot.counts.allPassed} with six current passes
            </p>
            <p>
              Saved snapshot:{" "}
              <time dateTime={snapshot.generatedAt}>
                {new Date(snapshot.generatedAt).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                  timeZoneName: "short",
                })}
              </time>
              . Refresh to include changes from other windows.
            </p>
          </div>
          <div className="queue-filters">
            <Field label="Search review queue">
              {(props) => (
                <TextInput
                  {...props}
                  type="search"
                  maxLength={200}
                  value={query.query}
                  onChange={(event) => change({ query: event.target.value })}
                  placeholder="Name, purpose, or category"
                />
              )}
            </Field>
            {picker("Review position", "position", [
              { value: "all", label: "All positions" },
              ...Object.entries(positions).map(([value, label]) => ({
                value,
                label,
              })),
            ])}
            {picker("Current area outcome", "outcome", [
              { value: "all", label: "Any outcome" },
              ...reviewOutcomes,
            ])}
            {picker("Review area", "area", [
              { value: "all", label: "Any area" },
              ...reviewAreas.map((a) => ({ value: a.id, label: a.label })),
            ])}
            {picker("Queue order", "sort", [
              { value: "attention", label: "Attention first" },
              { value: "name", label: "Component name" },
            ])}
          </div>
          <p className="result-count" role="status">
            {results.total
              ? `${(results.page - 1) * 10 + 1}–${Math.min(results.page * 10, results.total)}`
              : "0"}{" "}
            of {results.total} matching reviews.{" "}
            {query.area !== "all" && query.outcome === "all"
              ? "Choose a current area outcome to filter the selected area."
              : ""}
          </p>
          {results.total ? (
            <ol className="queue-list" start={(results.page - 1) * 10 + 1}>
              {results.entries.map((entry) => (
                <li key={entry.id} data-queue-id={entry.id}>
                  <div className="queue-contract">
                    <h3>{entry.name}</h3>
                    <p>{entry.summary}</p>
                    <p>
                      {entry.category} · {entry.maturity} · Revision{" "}
                      {entry.revision}
                    </p>
                  </div>
                  <div className="queue-position">
                    <Badge>{positions[entry.position]}</Badge>
                    <p>
                      {entry.summaryCounts.passed} passed ·{" "}
                      {entry.summaryCounts.needsWork} need work ·{" "}
                      {entry.summaryCounts.unreviewed} not reviewed
                    </p>
                    {entry.position === "renewal" && (
                      <p>
                        Previous saved results: {entry.savedSummary.passed}{" "}
                        passed, {entry.savedSummary.needsWork} need work,{" "}
                        {entry.savedSummary.unreviewed} not reviewed. These are
                        historical.
                      </p>
                    )}
                    <Disclosure
                      summary={`Current area outcomes for ${entry.name}`}
                    >
                      <dl className="queue-areas">
                        {reviewAreas.map((area) => (
                          <div key={area.id}>
                            <dt>{area.label}</dt>
                            <dd>
                              {reviewOutcomes.find(
                                (o) =>
                                  o.value ===
                                  entry.checks.find((c) => c.id === area.id)
                                    ?.outcome,
                              )?.label ?? "Not reviewed"}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </Disclosure>
                  </div>
                  <a
                    className="queue-open"
                    href={reviewHref(entry.id)}
                    onClick={(event) => {
                      if (
                        event.ctrlKey ||
                        event.metaKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      onOpen(entry.id);
                    }}
                  >
                    Review {entry.name}
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <Notice>
              {snapshot.counts.total
                ? "No reviews match these filters. Clear filters to return to the full queue."
                : "No components are available for review. Add a component or import a specification to begin."}
            </Notice>
          )}
          <Button
            variant="quiet"
            onClick={() => setQuery(queueQuery(new URLSearchParams()))}
          >
            Clear queue filters
          </Button>
          <Pagination
            label="Review queue pages"
            page={results.page}
            pageCount={results.pageCount}
            onPageChange={(page) => change({ page })}
          />
        </>
      )}
    </section>
  );
}
