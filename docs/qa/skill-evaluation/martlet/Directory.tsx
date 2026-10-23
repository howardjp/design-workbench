import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import {
  AppShell, Badge, Button, Checkbox, DefinitionList, Dialog, Disclosure,
  ErrorSummary, Field, Select, Textarea, TextInput,
} from "@martlet/react";
import "@martlet/react/styles.css";
import "@martlet/theme/fonts.css";

type Team = "Studio" | "Partners" | "Volunteers";
type Scope = "All contacts" | Team;
type Contact = { id: string; name: string; role: string; email: string; team: Team; notes: string };
type View = "collection" | "reading" | "editing";
type Destination = { kind: "scope"; scope: Scope } | { kind: "back" } | { kind: "cancel" };
type Errors = Partial<Record<"name" | "email", string>>;
const scopes: Scope[] = ["All contacts", "Studio", "Partners", "Volunteers"];
const initialContacts: Contact[] = [
  { id: "ada", name: "Ada Bennett", role: "Programme coordinator", email: "ada.bennett@example.test", team: "Studio", notes: "Coordinates the quarterly reading programme. Prefers a short agenda before a planning conversation." },
  { id: "niko", name: "Niko Okafor", role: "Community researcher", email: "niko.okafor@example.test", team: "Studio", notes: "Collects neighbourhood histories and keeps the interview index up to date." },
  { id: "mei", name: "Mei Laurent", role: "Editorial lead", email: "mei.laurent@example.test", team: "Studio", notes: "Looks after publication schedules, accessible editions, and the shared style notes." },
  { id: "sam", name: "Sam Rivera", role: "Library liaison", email: "sam.rivera@example.test", team: "Partners", notes: "Connects the studio with local library programmes. Available for planning on Tuesdays." },
  { id: "imani", name: "Imani Clarke", role: "Exhibition partner", email: "imani.clarke@example.test", team: "Partners", notes: "Organises small exhibitions and lending arrangements.\nConfirm the installation dates before arranging transport." },
];

const css = `
.directory-demo .directory-body{max-inline-size:62rem;margin-inline:auto;display:grid;gap:var(--martlet-region-gap)}
.directory-demo .directory-heading{display:grid;gap:var(--martlet-field-gap)}
.directory-demo h1{font-size:clamp(1.9rem,3vw,2.5rem)}
.directory-demo .directory-kicker{font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ui-muted)}
.directory-demo .directory-meta{color:var(--ui-muted);font-size:.9rem}
.directory-demo .directory-tools{display:flex;flex-wrap:wrap;align-items:end;gap:var(--martlet-group-gap)}
.directory-demo .directory-tools .martlet-field{flex:1 1 20rem}
.directory-demo .directory-list{list-style:none;margin:0;padding:0}
.directory-demo .directory-list li{display:flex;justify-content:space-between;align-items:center;gap:var(--martlet-group-gap);padding-block:var(--martlet-space-3);border-block-start:1px solid var(--ui-line)}
.directory-demo .directory-person{display:grid;gap:var(--martlet-field-gap);min-inline-size:0}
.directory-demo .directory-list h3{font-size:1.3rem}
.directory-demo .directory-actions{display:flex;flex-wrap:wrap;gap:var(--martlet-field-gap);align-items:center}
.directory-demo .directory-reading,.directory-demo .directory-form{max-inline-size:43rem;display:grid;gap:var(--martlet-group-gap)}
.directory-demo .directory-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--martlet-group-gap)}
.directory-demo .directory-notes{font:1.1rem/1.7 var(--martlet-font-serif);white-space:pre-wrap;max-inline-size:60ch}
.directory-demo .directory-empty{display:grid;gap:var(--martlet-field-gap);padding-block:var(--martlet-group-gap);border-block-start:1px solid var(--ui-line)}
.directory-demo .directory-footer{display:grid;gap:var(--martlet-field-gap);border-block-start:1px solid var(--ui-line);padding-block-start:var(--martlet-group-gap);font-size:.875rem;color:var(--ui-muted)}
.directory-demo .directory-status{min-block-size:1.5em}
.directory-demo .directory-status:empty{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
.directory-demo .martlet-app-header nav button{text-align:start;white-space:normal;display:flex;justify-content:space-between;gap:var(--martlet-field-gap)}
.directory-demo .martlet-app-header nav button[aria-current]{font-weight:700;text-decoration:underline;text-underline-offset:.3em}
.directory-demo .martlet-dialog .directory-actions{margin-block-start:var(--martlet-group-gap)}
.directory-demo :where(h1,h2)[tabindex]:focus{outline:var(--martlet-focus-width) solid var(--martlet-focus-ring);outline-offset:var(--martlet-focus-gap)}
@media(max-width:36rem){.directory-demo .directory-fields{grid-template-columns:1fr}.directory-demo .directory-list li{align-items:start;flex-direction:column}.directory-demo .directory-tools{align-items:stretch}.directory-demo .directory-tools .martlet-field{flex-basis:100%}}
`;

/** Session-only synthetic directory; mount as the document's only AppShell. */
export default function Directory() {
  const [contacts, setContacts] = useState(initialContacts);
  const [scope, setScope] = useState<Scope>("All contacts");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("collection");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Contact | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [pending, setPending] = useState<Destination | null>(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [focusRequest, setFocusRequest] = useState<{ id: string } | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selected = contacts.find(c => c.id === selectedId);
  const dirty = !!draft && !!selected && JSON.stringify(draft) !== JSON.stringify(selected);
  const inScope = contacts.filter(c => scope === "All contacts" || c.team === scope);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = inScope.filter(c => [c.name, c.role, c.email, c.notes].join(" ").toLocaleLowerCase().includes(normalizedQuery));
  const focus = (id: string) => setFocusRequest({ id });

  useLayoutEffect(() => {
    if (focusRequest) document.getElementById(focusRequest.id)?.focus();
  }, [focusRequest]);
  useLayoutEffect(() => {
    if (saveFailed || Object.keys(errors).length) summary.current?.focus();
  }, [saveFailed, errors]);
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);
  useEffect(() => {
    if (!dirty) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);

  function go(destination: Destination) {
    setPending(null); setDraft(null); setErrors({}); setSaveFailed(false); setMessage("");
    if (destination.kind === "scope") {
      setScope(destination.scope); setQuery(""); setView("collection"); setSelectedId(null); focus("directory-title");
    } else if (destination.kind === "back") {
      setView("collection"); focus(results.some(c => c.id === selectedId) ? `directory-open-${selectedId}` : "directory-title");
    } else {
      setView("reading"); focus("directory-edit");
    }
  }
  function request(destination: Destination) {
    if (saving) return;
    if (dirty) setPending(destination); else go(destination);
  }
  function open(contact: Contact) {
    setSelectedId(contact.id); setView("reading"); setMessage(""); focus("directory-title");
  }
  function edit() {
    if (!selected) return;
    setDraft({ ...selected }); setErrors({}); setSaveFailed(false); setMessage(""); setView("editing"); focus("directory-name");
  }
  function update<K extends keyof Contact>(key: K, value: Contact[K]) {
    setDraft(current => current ? { ...current, [key]: value } : current);
  }
  function save(event?: FormEvent) {
    event?.preventDefault();
    if (!draft || saving) return;
    const nextErrors: Errors = {};
    if (!draft.name.trim()) nextErrors.name = "Enter a contact name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) nextErrors.email = "Enter an email address, such as ada@example.test.";
    setErrors(nextErrors); setSaveFailed(false);
    if (Object.keys(nextErrors).length) return;
    setSaving(true); setMessage("Saving contact…");
    const shouldFail = failNext; setFailNext(false);
    saveTimer.current = setTimeout(() => {
      setSaving(false); setMessage("");
      if (shouldFail) { setSaveFailed(true); return; }
      const saved = { ...draft, name: draft.name.trim(), email: draft.email.trim(), role: draft.role.trim() };
      setContacts(current => current.map(c => c.id === saved.id ? saved : c));
      setDraft(null); setView("reading"); setMessage(`${saved.name} saved for this session.`); focus("directory-title");
    }, 450);
  }

  return <div className="martlet directory-demo" data-martlet={mode}>
    <style>{css}</style>
    <AppShell brand="Fieldnotes" navigationPlacement="side" navigationLabel="Contact groups"
      navigation={scopes.map(item => <Button key={item} variant="quiet" disabled={saving}
        aria-current={scope === item ? "page" : undefined} onClick={() => request({ kind: "scope", scope: item })}>
        <span>{item}</span><span aria-hidden="true">{item === "All contacts" ? contacts.length : contacts.filter(c => c.team === item).length}</span>
      </Button>)}
      utilities={<Button variant="secondary" onClick={() => setMode(mode === "light" ? "dark" : "light")}>
        {mode === "light" ? "Use dark mode" : "Use light mode"}
      </Button>}>
      <div className="directory-body">
        <header className="directory-heading">
          <p className="directory-kicker">The contact book</p>
          {view !== "collection" && <div><Button variant="quiet" disabled={saving} onClick={() => request({ kind: "back" })}>← Back to {scope.toLowerCase()}</Button></div>}
          <h1 id="directory-title" tabIndex={-1}>{view === "collection" ? scope : view === "editing" ? "Edit contact" : selected?.name}</h1>
          <p className="directory-meta">{view === "collection" ? "People and context for the work you share." : view === "editing" ? "Required fields are marked. Changes stay here until you save." : `${selected?.role || "No role recorded"} · ${selected?.team}`}</p>
        </header>
        <p className="directory-status directory-meta" role="status" aria-atomic="true">{message}</p>
        {view === "collection" && <section aria-label="Contact collection">
          <div className="directory-tools">
            <Field id="directory-search" label={`Search ${scope.toLowerCase()}`} hint="Find a name, role, email, or note within this group.">
              {props => <TextInput {...props} type="search" value={query} onChange={e => setQuery(e.target.value)} />}
            </Field>
            {query && <Button variant="secondary" onClick={() => { setQuery(""); focus("directory-search"); }}>Clear search</Button>}
          </div>
          <p className="directory-meta" role="status" aria-atomic="true" style={{ marginBlock: "var(--martlet-group-gap)" }}>{results.length} {results.length === 1 ? "contact" : "contacts"}{normalizedQuery ? ` matching “${query.trim()}”` : ` in ${scope.toLowerCase()}`}</p>
          {results.length ? <ul className="directory-list">{results.map(contact => <li key={contact.id}>
            <div className="directory-person"><h2 style={{ fontSize: "1.35rem" }}>{contact.name}</h2><p>{contact.role || "No role recorded"}</p><p className="directory-meta">{contact.email} · {contact.team}</p></div>
            <Button id={`directory-open-${contact.id}`} variant="secondary" onClick={() => open(contact)} aria-label={`Read contact: ${contact.name}`}>Read contact →</Button>
          </li>)}</ul> : <div className="directory-empty"><h2>{inScope.length ? "No matching contacts" : "No contacts in this group yet"}</h2><p>{inScope.length ? "Try a shorter name or clear your search." : "Volunteer contacts will appear here when they join the directory."}</p><div>{query ? <Button variant="secondary" onClick={() => { setQuery(""); focus("directory-search"); }}>Clear search</Button> : <Button variant="secondary" onClick={() => request({ kind: "scope", scope: "All contacts" })}>View all contacts</Button>}</div></div>}
        </section>}
        {view === "reading" && selected && <article className="directory-reading" aria-labelledby="directory-title">
          <div className="directory-actions"><Button id="directory-edit" onClick={edit}>Edit contact</Button><Badge>{selected.team}</Badge></div>
          <DefinitionList aria-label="Contact details" items={[
            { id: "email", term: "Email", description: selected.email },
            { id: "role", term: "Role", description: selected.role || "No role recorded" },
            { id: "team", term: "Group", description: selected.team },
          ]} />
          <section className="directory-heading" aria-labelledby="directory-notes-title"><h2 id="directory-notes-title">Working notes</h2><p className="directory-notes">{selected.notes || "No working notes yet."}</p></section>
        </article>}
        {view === "editing" && draft && <form className="directory-form" noValidate onSubmit={save} aria-label="Edit contact" aria-busy={saving}>
          {(Object.keys(errors).length > 0 || saveFailed) && <ErrorSummary ref={summary} title={saveFailed ? "Your contact could not be saved" : "Check the contact details"}
            errors={saveFailed ? [{ message: "The simulated connection failed. Your changes are still here; retry when you are ready." }] : Object.entries(errors).map(([key, message]) => ({ message: message!, targetId: `directory-${key}` }))}>
            {saveFailed && <div><Button onClick={() => save()}>Retry save</Button></div>}
          </ErrorSummary>}
          <div className="directory-fields">
            <Field id="directory-name" label="Name (required)" error={errors.name}>{props => <TextInput {...props} autoComplete="name" required disabled={saving} value={draft.name} onChange={e => update("name", e.target.value)} />}</Field>
            <Field id="directory-email" label="Email (required)" error={errors.email}>{props => <TextInput {...props} type="email" autoComplete="email" required disabled={saving} value={draft.email} onChange={e => update("email", e.target.value)} />}</Field>
            <Field id="directory-role" label="Role">{props => <TextInput {...props} autoComplete="organization-title" disabled={saving} value={draft.role} onChange={e => update("role", e.target.value)} />}</Field>
            <Field id="directory-team" label="Group" hint="Moving groups can change where this contact appears.">{props => <Select {...props} disabled={saving} value={draft.team} onChange={e => update("team", e.target.value as Team)}>{scopes.filter(s => s !== "All contacts").map(team => <option key={team}>{team}</option>)}</Select>}</Field>
          </div>
          <Field id="directory-notes" label="Working notes" hint="Keep useful context with the person.">{props => <Textarea {...props} disabled={saving} rows={4} value={draft.notes} onChange={e => update("notes", e.target.value)} />}</Field>
          <div className="directory-actions"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save contact"}</Button><Button variant="secondary" disabled={saving} onClick={() => request({ kind: "cancel" })}>Cancel editing</Button><span className="directory-meta">{dirty ? "Unsaved changes" : "No changes yet"}</span></div>
        </form>}
        <footer className="directory-footer">
          <p>Synthetic people, session-only changes. Reloading restores this example directory.</p>
          <Disclosure summary="Demo: inspect save recovery"><Checkbox label="Make the next save fail" checked={failNext} disabled={saving} onChange={e => setFailNext(e.target.checked)} /><p>Edit a contact, enable this option, then save. Retry saves the retained draft.</p></Disclosure>
        </footer>
      </div>
    </AppShell>
    <Dialog open={pending !== null} title="Keep your changes?" onDismiss={() => { setPending(null); focus("directory-name"); }}>
      <p>This contact has unsaved changes. Keep editing to preserve the draft, or discard it and continue.</p>
      <div className="directory-actions"><Button autoFocus onClick={() => { setPending(null); focus("directory-name"); }}>Keep editing</Button><Button variant="secondary" onClick={() => { if (pending) go(pending); }}>Discard changes and continue</Button></div>
    </Dialog>
  </div>;
}
