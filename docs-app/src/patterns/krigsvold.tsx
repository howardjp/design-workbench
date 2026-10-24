import {
  Badge,
  Button,
  Field,
  Select,
  Checkbox,
  Disclosure,
  DefinitionList,
} from "docs-family";
import { folders, createNoteId } from "./model";
import { useNotebook } from "./use-notebook";
import { DraftGuard, Editor, Search, EmptyResults } from "./parts";
import "./krigsvold.css";
export function CollectionPattern() {
  const n = useNotebook();
  const { s, selected, results } = n;
  return (
    <section
      className="krigsvold-notebook"
      aria-label="Notebook working pattern"
    >
      <header className="krigsvold-notebook-heading">
        <div>
          <p className="reference-kicker">Krigsvold / Working patterns / 01</p>
          <h1>Notes workspace</h1>
        </div>
        <Badge>Session data</Badge>
      </header>
      <div className="krigsvold-notebook-command">
        <Field label="Collection">
          {(p) => (
            <Select
              {...p}
              value={s.folder}
              disabled={s.phase === "saving"}
              onChange={(e) =>
                n.request({ type: "folder", folder: e.target.value })
              }
            >
              {["All notes", ...folders].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          )}
        </Field>
        <Search n={n} />
        <Button
          disabled={s.phase === "saving"}
          onClick={() => n.request({ type: "new", id: createNoteId() })}
        >
          New note
        </Button>
      </div>
      <div className="krigsvold-notebook-state">
        <span role="status">
          {s.message || `${results.length} results · ${s.folder}`}
        </span>
        {s.removed && (
          <Button
            variant="quiet"
            disabled={s.phase === "saving" || !!s.draft}
            onClick={n.undo}
          >
            Undo move to trash
          </Button>
        )}
      </div>
      <div className="krigsvold-notebook-workspace">
        <section
          className="krigsvold-notebook-results"
          aria-label="Note results"
        >
          <header>
            <h2
              ref={!selected && !s.draft ? n.heading : undefined}
              tabIndex={-1}
            >
              {s.folder}
            </h2>
            <span>{results.length} results</span>
          </header>
          {results.length ? (
            <ul>
              {results.map((note) => (
                <li key={note.id}>
                  <button
                    className="krigsvold-notebook-row"
                    aria-current={s.selected === note.id ? "true" : undefined}
                    aria-label={`Open note: ${note.title}`}
                    disabled={s.phase === "saving"}
                    onClick={() => n.request({ type: "open", id: note.id })}
                  >
                    <strong>{note.title}</strong>
                    <span>{note.folder}</span>
                    <p>{note.body}</p>
                    <span className="notebook-sr">Open note</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyResults n={n} />
          )}
        </section>
        <section
          className="krigsvold-notebook-detail"
          aria-label="Current note"
        >
          <header>
            <h2 ref={selected || s.draft ? n.heading : undefined} tabIndex={-1}>
              {s.draft
                ? s.base
                  ? "Edit note"
                  : "New note"
                : selected
                  ? selected.title
                  : "Choose a note"}
            </h2>
            {selected && !s.draft && (
              <div>
                <Button variant="secondary" onClick={n.edit}>
                  Edit
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => n.request({ type: "trash" })}
                >
                  Move to trash
                </Button>
              </div>
            )}
          </header>
          {s.draft ? (
            <Editor n={n} />
          ) : selected ? (
            <>
              <DefinitionList
                items={[
                  {
                    id: "folder",
                    term: "Collection",
                    description: selected.folder,
                  },
                  {
                    id: "state",
                    term: "State",
                    description: "Saved in this session",
                  },
                ]}
              />
              <div className="krigsvold-notebook-content">
                <p>{selected.body || "No body text."}</p>
              </div>
              <Button
                variant="quiet"
                onClick={() => n.request({ type: "back" })}
              >
                Close note
              </Button>
            </>
          ) : (
            <div className="notebook-empty">
              <p>
                Open a result to read it here. Your collection stays in view.
              </p>
              <p>Or begin a new note in the current collection.</p>
              <Button
                variant="secondary"
                onClick={() => n.request({ type: "new", id: createNoteId() })}
              >
                Create a note
              </Button>
            </div>
          )}
        </section>
      </div>
      <footer className="krigsvold-notebook-foot">
        <p>Fictional examples · Session saves · Reload restores initial data</p>
        <Disclosure summary="Failure-state inspection">
          <Checkbox
            label="Make the next save fail"
            checked={n.failNext}
            disabled={s.phase === "saving"}
            onChange={(e) => n.setFailNext(e.target.checked)}
          />
          <p>Inspect retained changes and retry after a failed save.</p>
        </Disclosure>
      </footer>
      <DraftGuard n={n} />
    </section>
  );
}
