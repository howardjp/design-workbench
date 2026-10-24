import {
  Button,
  Dialog,
  ErrorSummary,
  Field,
  TextInput,
  Textarea,
  Select,
} from "docs-family";
import { folders, createNoteId } from "./model";
import type { Notebook } from "./use-notebook";
export function Editor({ n }: { n: Notebook }) {
  const { s, dispatch } = n;
  if (!s.draft) return null;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        n.save();
      }}
      aria-label="Edit note"
    >
      {s.error && (
        <ErrorSummary
          ref={n.error}
          title={
            s.phase === "failed" ? "Your note is still here" : "Check the note"
          }
          errors={[
            {
              message: s.error,
              targetId:
                s.phase === "failed" ? "notebook-save" : "notebook-title",
            },
          ]}
        />
      )}
      <fieldset disabled={s.phase === "saving"} className="notebook-fields">
        <legend className="notebook-sr">Note details</legend>
        <Field
          id="notebook-title"
          label="Title"
          error={s.error && s.phase !== "failed" ? s.error : undefined}
          hint="Use a title you can recognize in the collection."
        >
          {(p) => (
            <TextInput
              {...p}
              required
              maxLength={120}
              value={s.draft!.title}
              onChange={(e) =>
                dispatch({
                  type: "change",
                  key: "title",
                  value: e.target.value,
                })
              }
            />
          )}
        </Field>
        <Field label="Folder">
          {(p) => (
            <Select
              {...p}
              value={s.draft!.folder}
              onChange={(e) =>
                dispatch({
                  type: "change",
                  key: "folder",
                  value: e.target.value,
                })
              }
            >
              {folders.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Note">
          {(p) => (
            <Textarea
              {...p}
              rows={9}
              value={s.draft!.body}
              onChange={(e) =>
                dispatch({ type: "change", key: "body", value: e.target.value })
              }
            />
          )}
        </Field>
      </fieldset>
      <div className="notebook-editor-actions">
        <Button
          id="notebook-save"
          type="submit"
          disabled={s.phase === "saving"}
        >
          {s.phase === "saving"
            ? "Saving…"
            : s.phase === "failed"
              ? "Try saving again"
              : "Save note"}
        </Button>
        <Button
          variant="quiet"
          disabled={s.phase === "saving"}
          onClick={() => n.request({ type: "cancel" })}
        >
          Cancel
        </Button>
        <span role="status">
          {s.phase === "saving"
            ? "Saving this note…"
            : n.dirty
              ? "Unsaved changes"
              : ""}
        </span>
      </div>
    </form>
  );
}
export function DraftGuard({ n }: { n: Notebook }) {
  return (
    <Dialog
      open={!!n.s.pending}
      title="Keep your changes?"
      onDismiss={() => n.dispatch({ type: "keep" })}
    >
      <p>
        This note has unsaved changes. Keep editing, or discard the changes and
        continue.
      </p>
      <div className="notebook-editor-actions">
        <Button onClick={() => n.dispatch({ type: "keep" })}>
          Keep editing
        </Button>
        <Button variant="secondary" onClick={n.discard}>
          Discard changes and continue
        </Button>
      </div>
    </Dialog>
  );
}
export function Search({ n }: { n: Notebook }) {
  return (
    <Field
      label={`Search ${n.s.folder === "All notes" ? "all notes" : n.s.folder}`}
    >
      {(p) => (
        <TextInput
          {...p}
          ref={n.search}
          type="search"
          value={n.s.query}
          disabled={n.s.phase === "saving"}
          onChange={(e) => n.dispatch({ type: "query", value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Escape") n.dispatch({ type: "query", value: "" });
          }}
        />
      )}
    </Field>
  );
}
export function EmptyResults({ n }: { n: Notebook }) {
  return (
    <div className="notebook-empty">
      <h3>
        {n.s.query
          ? "No notes match this search"
          : "A place for your next note"}
      </h3>
      <p>
        {n.s.query
          ? "Try another phrase, or clear the search to see this collection again."
          : "Create a note to begin this collection."}
      </p>
      {n.s.query ? (
        <Button
          variant="secondary"
          onClick={() => {
            n.dispatch({ type: "query", value: "" });
            n.search.current?.focus();
          }}
        >
          Clear search
        </Button>
      ) : (
        <Button onClick={() => n.request({ type: "new", id: createNoteId() })}>
          Create a note
        </Button>
      )}
    </div>
  );
}
