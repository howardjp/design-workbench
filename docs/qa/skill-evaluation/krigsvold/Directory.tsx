import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { AppShell, Badge, Button, Checkbox, DefinitionList, Dialog, Disclosure, ErrorSummary, Field, Notice, Select, TextInput, Textarea } from "@krigsvold/react";
import "@krigsvold/react/styles.css";
import "@krigsvold/theme/fonts.css";

type Contact = { id: string; name: string; role: string; team: string; email: string; notes: string };
type Errors = Partial<Record<"name" | "email", string>>;
type Action = { kind: "record"; value: string } | { kind: "query" | "team"; value: string } | { kind: "page"; value: "directory" | "about" } | { kind: "close" | "cancel" };
const initial: Contact[] = [
  { id: "c1", name: "Amina Solberg", role: "Service coordinator", team: "Operations", email: "amina.solberg@example.test", notes: "Coordinates community appointments. Available Tuesday through Friday." },
  { id: "c2", name: "Jonah Vale", role: "Research librarian", team: "Research", email: "jonah.vale@example.test", notes: "Maintains the reference collection and supports evidence requests." },
  { id: "c3", name: "Lena Okafor", role: "Facilities planner", team: "Operations", email: "lena.okafor@example.test", notes: "Primary contact for space planning and building access." },
  { id: "c4", name: "Theo Iversen", role: "Research associate", team: "Research", email: "theo.iversen@example.test", notes: "Supports survey design and documentation." },
];
function validate(contact: Contact): Errors {
  return { ...(!contact.name.trim() ? { name: "Enter a contact name." } : {}), ...(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ? { email: "Enter an email address, such as name@example.test." } : {}) };
}

/** Fictional, session-only collection/editor; mount as the document's sole AppShell. */
export default function Directory() {
  const [contacts, setContacts] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Contact | null>(null);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("All teams");
  const [page, setPage] = useState<"directory" | "about">("directory");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<Action | null>(null);
  const collectionHeading = useRef<HTMLHeadingElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const aboutHeading = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focus, setFocus] = useState<{ target: "collection" | "detail" | "name" | "errors" | "about" } | null>(null);
  const selected = contacts.find((contact) => contact.id === selectedId);
  const dirty = editing && draft !== null && JSON.stringify(draft) !== JSON.stringify(selected);
  const matches = contacts.filter((contact) => (team === "All teams" || contact.team === team) && `${contact.name} ${contact.role} ${contact.email}`.toLowerCase().includes(query.toLowerCase().trim()));

  useLayoutEffect(() => {
    if (!focus) return;
    const refs = { collection: collectionHeading, detail: detailHeading, name: nameInput, errors: errorSummary, about: aboutHeading };
    refs[focus.target].current?.focus();
  }, [focus]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!dirty) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);

  function apply(action: Action) {
    setEditing(false); setDraft(null); setErrors({}); setSaveError(false); setMessage("");
    if (action.kind === "record") { setSelectedId(action.value); setFocus({ target: "detail" }); }
    if (action.kind === "query") { setQuery(action.value); setSelectedId(null); }
    if (action.kind === "team") { setTeam(action.value); setSelectedId(null); }
    if (action.kind === "page") { setPage(action.value); setFocus({ target: action.value === "about" ? "about" : "collection" }); }
    if (action.kind === "close") { setSelectedId(null); setFocus({ target: "collection" }); }
    if (action.kind === "cancel") setFocus({ target: "detail" });
  }
  function request(action: Action) { if (!saving) { if (dirty) setPending(action); else apply(action); } }
  function change(key: keyof Contact, value: string) {
    if (!draft) return;
    const next = { ...draft, [key]: value }; setDraft(next);
    if (Object.keys(errors).length) setErrors(validate(next));
  }
  function save(event: FormEvent) {
    event.preventDefault(); if (!draft || saving) return;
    const nextErrors = validate(draft); setErrors(nextErrors); setSaveError(false);
    if (Object.keys(nextErrors).length) { setFocus({ target: "errors" }); return; }
    const commit = { ...draft, name: draft.name.trim(), email: draft.email.trim() };
    setSaving(true); setMessage("");
    timer.current = setTimeout(() => {
      setSaving(false); timer.current = null;
      if (failNext) { setFailNext(false); setSaveError(true); setFocus({ target: "errors" }); return; }
      setContacts((previous) => previous.map((contact) => contact.id === commit.id ? commit : contact));
      setEditing(false); setDraft(null); setMessage(`${commit.name} saved for this session.`); setFocus({ target: "detail" });
    }, 500);
  }
  return <div className="krigsvold directory-demo" data-krigsvold={mode}>
    <style>{`
      .directory-demo .directory-stack { display:grid; align-content:start; gap:var(--krigsvold-group-gap); min-inline-size:0; }
      .directory-demo .directory-heading { display:flex; gap:1rem; flex-wrap:wrap; align-items:start; justify-content:space-between; }
      .directory-demo .directory-muted { color:var(--ui-muted); }
      .directory-demo .directory-kicker { font-size:.875rem; color:var(--krigsvold-accent2); font-weight:700; }
      .directory-demo .directory-frame { display:grid; grid-template-columns:minmax(16rem,.8fr) minmax(0,1.2fr); gap:var(--krigsvold-region-gap); margin-block-start:var(--krigsvold-region-gap); }
      .directory-demo .directory-collection { min-inline-size:0; }
      .directory-demo .directory-filters { display:grid; grid-template-columns:minmax(0,1fr) minmax(8rem,.6fr); gap:var(--krigsvold-field-gap); }
      .directory-demo .directory-results { list-style:none; padding:0; margin:0; border-block-start:1px solid var(--ui-line); }
      .directory-demo .directory-result { display:grid; text-align:start; inline-size:100%; gap:.25rem; min-block-size:4.5rem; padding:var(--krigsvold-row-padding) .8rem; border:0; border-block-end:1px solid var(--ui-line); border-inline-start:3px solid transparent; background:transparent; color:var(--ui-text); cursor:pointer; }
      .directory-demo .directory-result[aria-current] { border-inline-start-color:var(--ui-accent); background:var(--krigsvold-active-bg); }
      .directory-demo .directory-result:hover { background:var(--krigsvold-hover-bg); }
      .directory-demo .directory-result small { color:var(--ui-muted); font-size:.875rem; }
      .directory-demo .directory-result:disabled { cursor:default; }
      .directory-demo .directory-detail { min-inline-size:0; padding-inline-start:var(--krigsvold-group-gap); border-inline-start:1px solid var(--ui-line); }
      .directory-demo .directory-actions { display:flex; gap:var(--krigsvold-field-gap); flex-wrap:wrap; align-items:center; }
      .directory-demo .directory-note { white-space:pre-wrap; }
      .directory-demo .directory-nav[aria-current] { border-block-end:3px solid var(--ui-accent); background:var(--krigsvold-active-bg); }
      .directory-demo .directory-back { display:none; }
      .directory-demo .directory-empty { padding:1.5rem 0; }
      .directory-demo .directory-demo-controls { margin-block-start:var(--krigsvold-region-gap); border-block-start:1px solid var(--ui-line); padding-block-start:1rem; }
      .directory-demo .directory-demo-controls > div { margin-block-start:1rem; }
      @media(max-width:48rem) {
        .directory-demo .directory-frame { grid-template-columns:minmax(0,1fr); }
        .directory-demo .directory-frame[data-open=true] .directory-collection { display:none; }
        .directory-demo .directory-frame[data-open=false] .directory-detail { display:none; }
        .directory-demo .directory-detail { border-inline-start:0; padding-inline-start:0; }
        .directory-demo .directory-back { display:inline-flex; }
      }
      @media(max-width:28rem) { .directory-demo .directory-filters { grid-template-columns:minmax(0,1fr); } }
    `}</style>
    <AppShell navigationPlacement="top" navigationLabel="Directory navigation" brand="Civic contact book" navigation={<>
      <Button variant="quiet" className="directory-nav" aria-current={page === "directory" ? "page" : undefined} disabled={saving} onClick={() => { if (page !== "directory") request({ kind: "page", value: "directory" }); }}>Directory</Button>
      <Button variant="quiet" className="directory-nav" aria-current={page === "about" ? "page" : undefined} disabled={saving} onClick={() => { if (page !== "about") request({ kind: "page", value: "about" }); }}>About demo</Button>
    </>} utilities={<Button variant="secondary" onClick={() => setMode(mode === "light" ? "dark" : "light")}>{mode === "light" ? "Dark appearance" : "Light appearance"}</Button>}>
      {page === "about" ? <section className="directory-stack" aria-labelledby="directory-about"><h1 ref={aboutHeading} tabIndex={-1} id="directory-about">About this directory</h1><p>Four fictional contacts demonstrate finding, reading, and editing records. Changes last for this browser session only. Reload restores the examples.</p><p>No messages are sent and no server is contacted. Open Demo controls to inspect a failed save and retry.</p><Button variant="secondary" onClick={() => request({ kind: "page", value: "directory" })}>Return to directory</Button></section> : <>
        <header className="directory-heading"><div className="directory-stack"><p className="directory-kicker">People / contact records</p><h1>Contact directory</h1><p className="directory-muted">Find a colleague, read their record, or update their details.</p></div><Badge>Synthetic data · session only</Badge></header>
        <div className="directory-frame" data-open={Boolean(selected)}>
          <section className="directory-collection directory-stack" aria-labelledby="directory-contacts">
            <h2 id="directory-contacts" tabIndex={-1} ref={collectionHeading}>Contacts</h2>
            <div className="directory-filters">
              <Field id="directory-search" label={`Search ${team === "All teams" ? "all contacts" : `${team} contacts`}`} hint="Name, role, or email.">{(props) => <TextInput {...props} type="search" value={query} disabled={saving} onChange={(event) => request({ kind: "query", value: event.target.value })} />}</Field>
              <Field id="directory-team" label="Team scope">{(props) => <Select {...props} value={team} disabled={saving} onChange={(event) => request({ kind: "team", value: event.target.value })}><option>All teams</option><option>Operations</option><option>Research</option></Select>}</Field>
            </div>
            <p role="status">{matches.length} {matches.length === 1 ? "contact" : "contacts"} in {team.toLowerCase()}{query ? ` matching “${query}”` : ""}.</p>
            <ul className="directory-results">{matches.map((contact) => <li key={contact.id}><button className="directory-result" disabled={saving} aria-current={selectedId === contact.id ? "true" : undefined} onClick={() => { if (contact.id !== selectedId) request({ kind: "record", value: contact.id }); }}><strong>{contact.name}{selectedId === contact.id ? " · Open" : ""}</strong><span>{contact.role}</span><small>{contact.team}</small></button></li>)}</ul>
            {!matches.length && <div className="directory-stack directory-empty"><h3>No matching contacts</h3><p>Try another name or reset the current search and team scope.</p><Button variant="secondary" disabled={saving} onClick={() => { setQuery(""); setTeam("All teams"); }}>Reset search and scope</Button></div>}
          </section>
          <section className="directory-detail directory-stack" aria-label="Contact record">
            {selected ? <>
              <div className="directory-heading"><div className="directory-stack"><Button className="directory-back" variant="quiet" disabled={saving} onClick={() => request({ kind: "close" })}>Back to contacts</Button><p className="directory-kicker">Contact record · {selected.id.toUpperCase()}</p><h2 tabIndex={-1} ref={detailHeading}>{editing ? `Edit ${selected.name}` : selected.name}</h2></div><Badge>{saving ? "Saving…" : editing ? dirty ? "Unsaved changes" : "Editing" : "Saved record"}</Badge></div>
              {message && <Notice kind="success">{message}</Notice>}
              {editing && draft ? <form noValidate onSubmit={save} className="directory-stack" aria-label="Edit contact" aria-busy={saving}>
                {(Object.keys(errors).length > 0 || saveError) && <ErrorSummary ref={errorSummary} title={saveError ? "Contact was not saved" : "Check the contact details"} errors={saveError ? [{ message: "The simulated connection failed. Your changes are still here. Retry save to continue." }] : Object.entries(errors).map(([key, message]) => ({ message, targetId: `directory-${key}` }))} />}
                <Field id="directory-name" label="Full name (required)" error={errors.name}>{(props) => <TextInput {...props} ref={nameInput} autoComplete="name" value={draft.name} required disabled={saving} onChange={(event) => change("name", event.target.value)} />}</Field>
                <Field id="directory-email" label="Email (required)" error={errors.email}>{(props) => <TextInput {...props} type="email" autoComplete="email" value={draft.email} required disabled={saving} onChange={(event) => change("email", event.target.value)} />}</Field>
                <Field id="directory-role" label="Role">{(props) => <TextInput {...props} value={draft.role} disabled={saving} onChange={(event) => change("role", event.target.value)} />}</Field>
                <Field id="directory-edit-team" label="Team">{(props) => <Select {...props} value={draft.team} disabled={saving} onChange={(event) => change("team", event.target.value)}><option>Operations</option><option>Research</option></Select>}</Field>
                <Field id="directory-notes" label="Notes">{(props) => <Textarea {...props} rows={3} value={draft.notes} disabled={saving} onChange={(event) => change("notes", event.target.value)} />}</Field>
                <p role="status">{saving ? "Saving contact. Please wait." : dirty ? "Changes have not been saved." : "No changes yet."}</p>
                <div className="directory-actions"><Button type="submit" disabled={saving}>{saving ? "Saving…" : saveError ? "Retry save" : "Save contact"}</Button><Button variant="secondary" disabled={saving} onClick={() => request({ kind: "cancel" })}>Cancel editing</Button></div>
              </form> : <>
                <DefinitionList items={[{ id: "role", term: "Role", description: selected.role || "Not provided" }, { id: "team", term: "Team", description: selected.team }, { id: "email", term: "Email", description: selected.email }]} />
                <div className="directory-stack"><h3>Notes</h3><p className="directory-note">{selected.notes || "No notes recorded."}</p></div>
                <div className="directory-actions"><Button onClick={() => { setDraft({ ...selected }); setEditing(true); setMessage(""); setFocus({ target: "name" }); }}>Edit contact</Button><Button variant="quiet" onClick={() => request({ kind: "close" })}>Close record</Button></div>
              </>}
            </> : <div className="directory-stack directory-empty"><h2>Open a contact</h2><p>Select a name to read their record. Editing begins only when you choose Edit contact.</p></div>}
          </section>
        </div>
        <div className="directory-demo-controls"><Disclosure summary="Demo controls"><div className="directory-stack"><p>This inspection control simulates one connection failure. Retry then succeeds without losing your draft.</p><Checkbox label="Fail the next valid save once" checked={failNext} disabled={saving} onChange={(event) => setFailNext(event.target.checked)} /></div></Disclosure></div>
      </>}
      <Dialog open={pending !== null} title="Leave unsaved changes?" onDismiss={() => setPending(null)}><p>Your changes to {selected?.name} have not been saved. Keep editing, or discard them and continue.</p><div className="directory-actions" style={{ marginBlockStart: "1.5rem" }}><Button autoFocus onClick={() => setPending(null)}>Keep editing</Button><Button variant="secondary" onClick={() => { if (pending) { const action = pending; setPending(null); apply(action); } }}>Discard changes and continue</Button></div></Dialog>
    </AppShell>
  </div>;
}
