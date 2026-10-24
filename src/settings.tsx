import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { UI } from "./family";
import { writePreferences } from "./preferences.mjs";
import { draftPrefix } from "./draft-storage.mjs";
const { Tabs, Switch, Field, Select, Button, Notice, ErrorSummary, Dialog } =
  UI;
export interface Preferences {
  schemaVersion: number;
  defaultView: string;
  pageSize: number;
  protectDrafts: boolean;
}
export function WorkbenchSettings({
  value,
  issue,
  onSaved,
  onDirty,
  onCleared,
}: {
  value: Preferences;
  issue: string;
  onSaved: (value: Preferences) => void;
  onDirty: (dirty: boolean) => void;
  onCleared: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [tab, setTab] = useState("workspace");
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const clearTrigger = useRef<HTMLButtonElement>(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(draft);
  useLayoutEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  useLayoutEffect(() => {
    if (failure) feedback.current?.focus();
    else if (message) success.current?.focus();
  }, [failure, message]);
  function update(patch: Partial<Preferences>) {
    setDraft((previous) => ({ ...previous, ...patch }));
    setMessage("");
    setFailure("");
  }
  function save(event: FormEvent) {
    event.preventDefault();
    setFailure("");
    setMessage("");
    try {
      const saved = writePreferences(localStorage, draft);
      onSaved(saved);
      setMessage("Workspace settings saved in this browser.");
    } catch {
      setFailure(
        "Settings could not be saved. Your choices are retained; check browser storage and retry.",
      );
    }
  }
  function clearCopies() {
    setConfirmClear(false);
    setFailure("");
    setMessage("");
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(draftPrefix),
      );
      for (const key of keys) localStorage.removeItem(key);
      onCleared();
      setMessage(
        "Browser specification recovery copies cleared. Saved registry records and history are unchanged.",
      );
    } catch {
      onCleared();
      setFailure(
        "Some recovery copies could not be cleared. Remaining copies are retained; inspect them before trying again.",
      );
    }
    clearTrigger.current?.focus();
  }
  return (
    <section
      className="settings-workspace stack"
      aria-labelledby="settings-title"
    >
      <h2 id="settings-title">Make this workspace yours</h2>
      <p>
        These preferences apply to both family views at this browser address.
        Explicit links still open their requested section. Appearance remains
        available in the header.
      </p>
      {issue && <Notice>{issue}</Notice>}
      {failure && (
        <ErrorSummary title="Settings need attention" ref={feedback}>
          <p>{failure}</p>
        </ErrorSummary>
      )}
      {message && (
        <div ref={success} tabIndex={-1}>
          <Notice kind="success">{message}</Notice>
        </div>
      )}
      <form onSubmit={save} className="stack">
        <Tabs
          label="Workspace settings"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              id: "workspace",
              label: "Workspace",
              content: (
                <div className="settings-fields stack">
                  <h3>Your starting point</h3>
                  <Field
                    label="Default workspace section"
                    hint="Used when the address does not specify a section."
                  >
                    {(props) => (
                      <Select
                        {...props}
                        value={draft.defaultView}
                        onChange={(event) =>
                          update({ defaultView: event.target.value })
                        }
                      >
                        <option value="inventory">Inventory</option>
                        <option value="overview">Overview</option>
                        <option value="queue">Review queue</option>
                        <option value="reading">Reading room</option>
                      </Select>
                    )}
                  </Field>
                  <Field
                    label="Default inventory page size"
                    hint="Applies immediately after saving and when reopening the app."
                  >
                    {(props) => (
                      <Select
                        {...props}
                        value={draft.pageSize}
                        onChange={(event) =>
                          update({ pageSize: Number(event.target.value) })
                        }
                      >
                        <option value="10">10 components</option>
                        <option value="25">25 components</option>
                        <option value="50">50 components</option>
                      </Select>
                    )}
                  </Field>
                </div>
              ),
            },
            {
              id: "recovery",
              label: "Draft recovery",
              content: (
                <div className="settings-fields stack">
                  <h3>Keep unfinished specifications</h3>
                  <Switch
                    label="Protect specification drafts in this browser"
                    checked={draft.protectDrafts}
                    onChange={(event) =>
                      update({ protectDrafts: event.target.checked })
                    }
                    aria-describedby="draft-protection-help"
                  />
                  <p id="draft-protection-help">
                    When enabled, incomplete specification fields and their
                    editing base are retained for explicit recovery. Turning
                    this off stops future protection after you save these
                    settings. Existing copies remain until you restore or
                    discard them. Readiness observations and comparison choices
                    remain memory-only.
                  </p>
                  <div className="settings-danger stack">
                    <h3>Clear recovery copies</h3>
                    <p>
                      This removes all specification recovery copies at this
                      browser address, including copies used by other open tabs.
                      Those tabs may protect their drafts again on their next
                      change. It does not delete saved registry data.
                    </p>
                    <Button
                      variant="secondary"
                      ref={clearTrigger}
                      onClick={() => setConfirmClear(true)}
                    >
                      Clear browser recovery copies
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
        <div className="actions">
          <Button type="submit" disabled={!dirty && !issue}>
            Save workspace settings
          </Button>
          <Button
            variant="secondary"
            disabled={!dirty}
            onClick={() => {
              setDraft(value);
              setMessage("Unsaved settings discarded.");
              setFailure("");
            }}
          >
            Reset unsaved settings
          </Button>
        </div>
      </form>
      <Dialog
        open={confirmClear}
        title="Clear all browser recovery copies?"
        onDismiss={() => setConfirmClear(false)}
      >
        <p>
          This permanently removes unfinished specification copies at this
          browser address. Saved SQLite records and revision history are
          retained.
        </p>
        <div className="actions">
          <Button
            variant="secondary"
            autoFocus
            onClick={() => setConfirmClear(false)}
          >
            Keep recovery copies
          </Button>
          <Button onClick={clearCopies}>Clear all recovery copies</Button>
        </div>
      </Dialog>
    </section>
  );
}
