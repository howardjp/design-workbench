import { Button, Article, Badge, Checkbox, Disclosure } from "docs-family";
import { folders, createNoteId } from "./model";
import { useNotebook } from "./use-notebook";
import { DraftGuard, Editor, Search, EmptyResults } from "./parts";
import "./martlet.css";
export function CollectionPattern() {
  const n = useNotebook();
  const { s, selected, results } = n;
  const working = !!s.draft || !!selected;
  return (
    <section className="martlet-notebook" aria-label="Notebook working pattern">
      <header className="martlet-notebook-masthead">
        <div>
          <p className="reference-kicker">A Martlet working pattern</p>
          <h1>Commonplace.</h1>
          <p>A collection of things worth keeping.</p>
        </div>
        <Badge>Session notebook</Badge>
      </header>
      <div className="martlet-notebook-orientation">
        <nav aria-label="Notebook folders">
          {["All notes", ...folders].map((f) => (
            <Button
              key={f}
              variant={s.folder === f ? "primary" : "quiet"}
              aria-current={s.folder === f ? "true" : undefined}
              disabled={s.phase === "saving"}
              onClick={() => n.request({ type: "folder", folder: f })}
            >
              {f}
            </Button>
          ))}
        </nav>
        <Button
          variant="secondary"
          disabled={s.phase === "saving"}
          onClick={() => n.request({ type: "new", id: createNoteId() })}
        >
          Write a note
        </Button>
      </div>
      <div className="martlet-notebook-status">
        <p role="status">{s.message}</p>
        {s.removed && (
          <Button
            variant="quiet"
            onClick={n.undo}
            disabled={s.phase === "saving" || !!s.draft}
          >
            Undo move to trash
          </Button>
        )}
      </div>
      {working ? (
        <div className="martlet-notebook-reading">
          <Button
            variant="quiet"
            disabled={s.phase === "saving"}
            onClick={() => n.request({ type: "back" })}
          >
            ← Back to {s.folder.toLowerCase()}
          </Button>
          {s.draft && (
            <h2 ref={n.heading} tabIndex={-1}>
              {s.base
                ? "Give the idea its next shape."
                : "Begin with a thought."}
            </h2>
          )}
          {s.draft ? (
            <Editor n={n} />
          ) : (
            <Article
              ref={(node) => {
                const target = node?.querySelector("h2") ?? null;
                if (target) target.tabIndex = -1;
                n.heading.current = target;
              }}
              title={selected!.title}
              titleLevel={2}
              eyebrow={selected!.folder}
              aside={
                <>
                  <p>Keep the thought close. Its context stays with it.</p>
                  <Button onClick={n.edit}>Edit note</Button>
                  <Button
                    variant="quiet"
                    onClick={() => n.request({ type: "trash" })}
                  >
                    Move to trash
                  </Button>
                </>
              }
            >
              <p style={{ whiteSpace: "pre-wrap" }}>
                {selected!.body || "This note has no body text yet."}
              </p>
            </Article>
          )}
        </div>
      ) : (
        <section className="martlet-notebook-collection">
          <div className="martlet-notebook-collection-head">
            <div>
              <h2 ref={n.heading} tabIndex={-1}>
                {s.folder}
              </h2>
              <p role="status">
                {results.length} {results.length === 1 ? "note" : "notes"}
                {s.query ? " found" : " to return to"}
              </p>
            </div>
            <Search n={n} />
          </div>
          {results.length ? (
            <ul className="martlet-notebook-list">
              {results.map((note) => (
                <li key={note.id}>
                  <div>
                    <p className="reference-kicker">{note.folder}</p>
                    <h3>{note.title}</h3>
                    <p>{note.body}</p>
                    <Button
                      variant="quiet"
                      onClick={() => n.request({ type: "open", id: note.id })}
                    >
                      Read note
                      <span className="notebook-sr">: {note.title}</span> →
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyResults n={n} />
          )}
        </section>
      )}
      <footer className="martlet-notebook-colophon">
        <p>
          These are fictional notes. Saves last for this session; reloading
          restores the examples.
        </p>
        <Disclosure summary="Inspect the pattern’s failure state">
          <Checkbox
            label="Make the next save fail"
            checked={n.failNext}
            disabled={s.phase === "saving"}
            onChange={(e) => n.setFailNext(e.target.checked)}
          />
          <p>
            Change a note, save it, then retry. Your draft remains available.
          </p>
        </Disclosure>
      </footer>
      <DraftGuard n={n} />
    </section>
  );
}
