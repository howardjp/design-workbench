export type Note = { id: string; title: string; body: string; folder: string };
let nextNote = 0;
// Session-local identities need no secure-context browser API.
export const createNoteId = () =>
  `note-${Date.now().toString(36)}-${++nextNote}`;
export const folders = ["Research", "Projects", "Personal"];
export const seed: Note[] = [
  {
    id: "n1",
    title: "A place for unfinished ideas",
    folder: "Research",
    body: "A notebook can hold a question before it holds an answer. Keep the source beside the observation, and leave room for the next connection.",
  },
  {
    id: "n2",
    title: "The shape of a useful collection",
    folder: "Research",
    body: "Finding, reading, and returning are separate moments. A good collection keeps their relationship clear.",
  },
  {
    id: "n3",
    title: "Field notes for the garden",
    folder: "Personal",
    body: "Observe the light in the morning and again in the afternoon. Record what changed before deciding what to plant.",
  },
  {
    id: "n4",
    title: "Workshop: first questions",
    folder: "Projects",
    body: "What do people need to accomplish? Where do they hesitate? Which part of the work should remain in view?",
  },
  {
    id: "n5",
    title: "Keep the recovery path",
    folder: "Projects",
    body: "A failed save should leave the work intact. The next action should be clear without requiring the person to reconstruct what happened.",
  },
  {
    id: "n6",
    title: "Reading list for a rainy afternoon",
    folder: "Personal",
    body: "Choose a book, a comfortable chair, and enough time to follow an unexpected footnote.",
  },
];
export type Move =
  | { type: "open"; id: string }
  | { type: "folder"; folder: string }
  | { type: "new"; id: string }
  | { type: "back" }
  | { type: "cancel" }
  | { type: "trash" };
export type State = {
  notes: Note[];
  selected: string | null;
  folder: string;
  query: string;
  draft: Note | null;
  base: Note | null;
  pending: Move | null;
  phase: "idle" | "saving" | "failed";
  error: string;
  message: string;
  removed: Note | null;
  trash: Note[];
};
export const initialState = (): State => ({
  notes: seed.map((n) => ({ ...n })),
  selected: null,
  folder: "All notes",
  query: "",
  draft: null,
  base: null,
  pending: null,
  phase: "idle",
  error: "",
  message: "",
  removed: null,
  trash: [],
});
export const dirty = (s: State) =>
  !!s.draft &&
  (!s.base
    ? !!(s.draft.title || s.draft.body)
    : ["title", "body", "folder"].some(
        (k) => s.draft![k as keyof Note] !== s.base![k as keyof Note],
      ));
export const matches = (s: State) =>
  s.notes.filter(
    (n) =>
      (s.folder === "All notes" || s.folder === n.folder) &&
      `${n.title} ${n.body}`.toLowerCase().includes(s.query.toLowerCase()),
  );
function move(s: State, a: Move): State {
  const next = {
    ...s,
    draft: null,
    base: null,
    pending: null,
    phase: "idle" as const,
    error: "",
    message: "",
  };
  if (a.type === "open") return { ...next, selected: a.id };
  if (a.type === "folder")
    return { ...next, selected: null, folder: a.folder, query: "" };
  if (a.type === "new")
    return {
      ...next,
      selected: null,
      draft: {
        id: a.id,
        title: "",
        body: "",
        folder: folders.includes(s.folder) ? s.folder : folders[0],
      },
    };
  if (a.type === "trash") {
    const removed = s.notes.find((n) => n.id === s.selected);
    return removed
      ? {
          ...next,
          selected: null,
          notes: s.notes.filter((n) => n.id !== removed.id),
          removed,
          trash: [...s.trash, removed],
          message: `“${removed.title}” moved to trash.`,
        }
      : next;
  }
  return { ...next, selected: a.type === "cancel" ? s.selected : null };
}
export type Action =
  | { type: "request"; move: Move }
  | { type: "discard" }
  | { type: "keep" }
  | { type: "edit" }
  | { type: "change"; key: "title" | "body" | "folder"; value: string }
  | { type: "query"; value: string }
  | { type: "save" }
  | { type: "saved" }
  | { type: "failed" }
  | { type: "undo" };
export function reducer(s: State, a: Action): State {
  if (s.phase === "saving" && !["saved", "failed"].includes(a.type)) return s;
  if (a.type === "request")
    return dirty(s) ? { ...s, pending: a.move } : move(s, a.move);
  if (a.type === "keep") return { ...s, pending: null };
  if (a.type === "discard") return s.pending ? move(s, s.pending) : s;
  if (a.type === "query") return { ...s, query: a.value, message: "" };
  if (a.type === "edit") {
    const note = s.notes.find((n) => n.id === s.selected);
    return note
      ? { ...s, draft: { ...note }, base: { ...note }, error: "", message: "" }
      : s;
  }
  if (a.type === "change")
    return s.draft
      ? {
          ...s,
          draft: { ...s.draft, [a.key]: a.value },
          error: "",
          phase: "idle",
        }
      : s;
  if (a.type === "save")
    return !s.draft
      ? s
      : !s.draft.title.trim()
        ? { ...s, error: "Give this note a title.", phase: "idle" }
        : { ...s, phase: "saving", error: "", message: "" };
  if (a.type === "failed")
    return s.phase === "saving"
      ? {
          ...s,
          phase: "failed",
          error:
            "The save failed. Your changes are still here; try saving again.",
        }
      : s;
  if (a.type === "saved" && s.phase === "saving" && s.draft) {
    const note = { ...s.draft, title: s.draft.title.trim() };
    return {
      ...s,
      notes: s.notes.some((n) => n.id === note.id)
        ? s.notes.map((n) => (n.id === note.id ? note : n))
        : [note, ...s.notes],
      selected: note.id,
      draft: null,
      base: null,
      phase: "idle",
      error: "",
      message: "Saved for this session.",
    };
  }
  if (a.type === "undo" && s.removed && !s.draft && !s.pending)
    return {
      ...s,
      notes: [...s.notes, s.removed],
      selected: s.removed.id,
      folder: "All notes",
      query: "",
      removed: s.trash.at(-2) ?? null,
      trash: s.trash.slice(0, -1),
      message: "Note restored.",
    };
  return s;
}
