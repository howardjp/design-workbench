import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  family,
  familyName,
  Button,
  Field,
  TextInput,
  Select,
  Checkbox,
  Switch,
  AppShell,
  Badge,
} from "docs-family";
import contracts from "./contracts.json";
import { defaults, Example, exampleCode, type Options } from "./examples";
import "./site.css";

const repo = "https://github.com/howardjp/design-workbench";
const groups: Record<string, string[]> = {
  "Actions & feedback": ["Button", "Notice", "Badge", "Dialog", "ErrorSummary"],
  "Forms & choices": [
    "Field",
    "TextInput",
    "Textarea",
    "Select",
    "FileInput",
    "Checkbox",
    "Radio",
    "Switch",
    "Fieldset",
  ],
  "Structure & reading": [
    "AppShell",
    "Article",
    "TableOfContents",
    "Disclosure",
    "Tabs",
  ],
  "Data & navigation": ["DataTable", "DefinitionList", "Pagination"],
};
const descriptions: Record<string, string> = {
  Button: "A clear next step.",
  Notice: "Feedback that explains what happened.",
  Badge: "A little context, at a glance.",
  Dialog: "A focused moment in a larger task.",
  ErrorSummary: "A useful way back from an error.",
  Field: "A name, a control, and the context between.",
  TextInput: "An open invitation to enter a detail.",
  Textarea: "Room for a longer thought.",
  Select: "A native choice from a known set.",
  FileInput: "Let the browser handle the file chooser.",
  Checkbox: "An independent yes or no.",
  Radio: "One choice among related options.",
  Switch: "A setting with two clear positions.",
  Fieldset: "Related controls, held together.",
  AppShell: "A place for navigation and the work itself.",
  Article: "A reading rhythm with room for context.",
  TableOfContents: "A map through longer material.",
  Disclosure: "Optional detail, available when needed.",
  Tabs: "Related views in one place.",
  DataTable: "Relationships that deserve rows and columns.",
  DefinitionList: "Terms and their meaning, side by side.",
  Pagination: "A measured way through a collection.",
};
function initialMode() {
  try {
    return localStorage.getItem(`docs-${family}-mode`) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}
function CopyCode({ code }: { code: string }) {
  const [message, setMessage] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setMessage(""), [code]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Example copied.");
    } catch {
      ref.current?.focus();
      ref.current?.select();
      setMessage("Select and copy the example with your keyboard.");
    }
  }
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>React / JSX</span>
        <Button variant="quiet" onClick={copy}>
          Copy example
        </Button>
      </div>
      <textarea
        ref={ref}
        aria-label="Copyable example source"
        readOnly
        value={code}
        spellCheck={false}
      />
      <p role="status">{message}</p>
    </div>
  );
}
function Playground({ name, mode }: { name: string; mode: string }) {
  const [o, setO] = useState<Options>(defaults);
  const [reset, setReset] = useState(0);
  const change = <K extends keyof Options>(key: K, value: Options[K]) =>
    setO((previous) => ({ ...previous, [key]: value }));
  const disabled = [
    "Button",
    "TextInput",
    "Textarea",
    "Select",
    "FileInput",
    "Field",
    "Checkbox",
    "Radio",
    "Switch",
    "Fieldset",
    "Dialog",
    "Pagination",
  ].includes(name);
  const invalid = [
    "TextInput",
    "Textarea",
    "Select",
    "FileInput",
    "Field",
    "Fieldset",
    "Radio",
  ].includes(name);
  const text = ![
    "AppShell",
    "Select",
    "FileInput",
    "Radio",
    "Pagination",
    "TableOfContents",
  ].includes(name);
  return (
    <>
      <div className="playground">
        <div className="preview-label">
          <span>Live specimen</span>
          <span>01 / {familyName}</span>
        </div>
        <div className="specimen" data-testid="specimen">
          <Example key={reset} name={name} options={o} mode={mode} />
        </div>
        <div className="controls">
          <div className="control-heading">
            <h3>Make it yours</h3>
            <Button
              variant="quiet"
              onClick={() => {
                setO(defaults);
                setReset(reset + 1);
              }}
            >
              Reset example
            </Button>
          </div>
          <div className="control-grid">
            {text && (
              <Field
                label={
                  ["TextInput", "Textarea", "Field"].includes(name)
                    ? "Placeholder"
                    : "Text"
                }
              >
                {(p) => (
                  <TextInput
                    {...p}
                    value={o.text}
                    maxLength={160}
                    onChange={(e) => change("text", e.target.value)}
                  />
                )}
              </Field>
            )}
            {name === "Button" && (
              <Field label="Variant">
                {(p) => (
                  <Select
                    {...p}
                    value={o.variant}
                    onChange={(e) =>
                      change("variant", e.target.value as Options["variant"])
                    }
                  >
                    {["primary", "secondary", "quiet"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
            {name === "Notice" && (
              <Field label="Kind">
                {(p) => (
                  <Select
                    {...p}
                    value={o.kind}
                    onChange={(e) =>
                      change("kind", e.target.value as Options["kind"])
                    }
                  >
                    {["info", "success", "error"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
            {disabled && (
              <Checkbox
                label="Disabled"
                checked={o.disabled}
                onChange={(e) => change("disabled", e.target.checked)}
              />
            )}{" "}
            {invalid && (
              <Checkbox
                label="Show error"
                checked={o.invalid}
                onChange={(e) => change("invalid", e.target.checked)}
              />
            )}{" "}
            {name === "Tabs" && (
              <Switch
                label="Vertical tabs"
                checked={o.vertical}
                onChange={(e) => change("vertical", e.target.checked)}
              />
            )}
          </div>
        </div>
      </div>
      <h2 id="example">Bring it into your project</h2>
      <p>
        This is a standalone composition using the package API. Local example
        state resets when you leave this page.
      </p>
      <CopyCode code={exampleCode(name, o, family)} />
    </>
  );
}
function Start() {
  return (
    <article className="reference-page">
      <p className="eyebrow">Start here / 0.1.0</p>
      <h1>
        A small beginning.
        <br />A real foundation.
      </h1>
      <p className="lead">
        {familyName} React is an experimental, MIT-licensed component library.
        Explore the components here, then try a packed build in a real project.
      </p>
      <div className="callout">
        <strong>Available in source. Not yet on npm.</strong>
        <p>
          The proposed first release is 0.1.0 under the <code>next</code> tag.
          These docs demonstrate the current draft branch; no registry
          publication is implied.
        </p>
      </div>
      <h2>Try the source build</h2>
      <p>
        Use Node 24.19 or later within Node 24. The packages target React 19 and
        ship ES modules, declarations, and CSS.
      </p>
      <CopyCode
        code={`git clone ${repo}.git\ncd design-workbench\ngit checkout work/registry-foundations\nnpm ci --ignore-scripts\nnpm run build\nnpm run pack:react\n\n# In a separate React 19 project, use the generated tarball:\nnpm install /absolute/path/to/${family}-react-0.1.0.tgz`}
      />
      <h2>Import components and styles</h2>
      <CopyCode
        code={`import { Button } from '@${family}/react';\nimport '@${family}/react/styles.css';\nimport '@${family}/theme/fonts.css';\n\n<Button onClick={() => console.log('Ready')}>Continue</Button>`}
      />
      <h2>Choose a color mode</h2>
      <p>
        Place the family class and <code>data-{family}</code> on a shared
        ancestor. Mode selection belongs to your application.
      </p>
      <CopyCode
        code={`<div className="${family}" data-${family}="light">\n  <Button>Continue</Button>\n</div>`}
      />
      <h2>Use the native contract</h2>
      <p>
        Keep visible labels, meaningful button text, unique IDs, and coherent
        headings. Use native browser controls where the API provides them. The
        library supplies component behavior; your application supplies
        validation, routing, data, and focus after operations.
      </p>
      <h2>Know the boundary</h2>
      <p>
        Automated rendering, browser, keyboard, and accessibility checks are
        part of development. Manual screen-reader review, localization, RTL
        behavior, and sustained production use remain open validation work.
        Every export is experimental.
      </p>
      <p>
        <a
          href={`${repo}/blob/work/registry-foundations/docs/release-policy.md`}
        >
          Read the release policy ↗
        </a>
      </p>
    </article>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">
          {family === "martlet"
            ? "The interface collection"
            : "System reference / React 19"}
        </p>
        <h1>
          {family === "martlet" ? (
            <>
              Good work deserves
              <br />
              <em>a considered interface.</em>
            </>
          ) : (
            <>
              Clear structure.
              <br />
              <em>Precise interaction.</em>
            </>
          )}
        </h1>
        <p className="lead">
          {family === "martlet"
            ? "An editorial React library for the spaces where people read, think, and make decisions. Warm type. Honest controls. Room to work."
            : "A deliberate React library for information, decisions, and the tools that connect them. Strong hierarchy. Native behavior. A place for every detail."}
        </p>
        <div className="hero-actions">
          <a className="primary-link" href="?page=start">
            Start building <span aria-hidden="true">↗</span>
          </a>
          <a href="?component=Button">
            Explore the components <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="edition">
          <span>Experimental / 0.1.0</span>
          <span>22 components / MIT</span>
        </div>
      </section>
      <section className="home-specimens" aria-label="A look at the system">
        <div className="journal">
          <p className="eyebrow">Specimen / typography</p>
          <h2>
            The quiet details
            <br />
            make the difference.
          </h2>
          <p>
            Readable text, familiar behavior, and a clear next step. Small
            choices that carry through the whole interface.
          </p>
          <a href="?component=Article">Read with Article →</a>
        </div>
        <div className="mini-workspace">
          <div className="preview-label">
            <span>Specimen / interaction</span>
            <Badge>In progress</Badge>
          </div>
          <Field label="Project name" hint="Give this work a place to begin.">
            {(p) => (
              <TextInput
                {...p}
                defaultValue="A field guide to good interfaces"
              />
            )}
          </Field>
          <div className="mini-actions">
            <Button
              onClick={() => {
                location.href = "?component=Button";
              }}
            >
              Explore Button
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                location.href = "?component=Field";
              }}
            >
              Meet Field
            </Button>
          </div>
        </div>
      </section>
      <section className="directory" id="components">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The collection</p>
            <h2>Built to work together.</h2>
          </div>
          <span>01—22</span>
        </div>
        {Object.entries(groups).map(([group, names]) => (
          <div className="component-group" key={group}>
            <h3>{group}</h3>
            <div>
              {names.map((name) => (
                <a key={name} href={`?component=${name}`}>
                  <strong>{name}</strong>
                  <span>{descriptions[name]}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
function ShellExample() {
  const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
  return (
    <div className={family} {...{ [`data-${family}`]: mode }}>
      <AppShell
        brand="Project journal"
        navigation={
          <a href="?shell=1" aria-current="page">
            Overview
          </a>
        }
        utilities={<Badge>Workspace</Badge>}
      >
        <div style={{ padding: "2rem" }}>
          <h1>Your project, in view.</h1>
          <p>One shell. A clear path to the work.</p>
        </div>
      </AppShell>
    </div>
  );
}
function App() {
  const params = new URLSearchParams(location.search);
  const name = params.get("component");
  const start = params.get("page") === "start";
  const contract = contracts.find((item) => item.name === name);
  const [mode, setMode] = useState(initialMode);
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    document.title = `${contract?.name ?? (start ? "Getting started" : "The collection")} · ${familyName} React`;
    document.documentElement.style.colorScheme = mode;
    try {
      localStorage.setItem(`docs-${family}-mode`, mode);
    } catch {}
  }, [mode, contract, start]);
  if (params.has("shell")) return <ShellExample />;
  const filtered = Object.entries(groups)
    .map(
      ([group, names]) =>
        [
          group,
          names.filter((item) =>
            `${item} ${descriptions[item]}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          ),
        ] as const,
    )
    .filter(([, names]) => names.length);
  return (
    <div
      className={`${family} docs-site`}
      data-family={family}
      data-theme={mode}
      {...{ [`data-${family}`]: mode }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="?">
          <span className="brand-mark" aria-hidden="true">
            {family === "martlet" ? "m." : "k/"}
          </span>
          <span>
            {familyName}
            <small>React reference</small>
          </span>
        </a>
        <nav aria-label="Main">
          <a href="?page=start" aria-current={start ? "page" : undefined}>
            Getting started
          </a>
          <a href="?#components">
            Components <span className="nav-count">22</span>
          </a>
          <a href={repo}>Source ↗</a>
        </nav>
        <div className="header-actions">
          <Button
            variant="quiet"
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
          >
            {mode === "light" ? "Dark mode" : "Light mode"}
          </Button>
          <Button
            variant="secondary"
            className="menu-toggle"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            Browse
          </Button>
        </div>
      </header>
      <div className="page-grid">
        <aside
          className={`sidebar ${menu ? "is-open" : ""}`}
          aria-label="Component directory"
        >
          <div className="sidebar-intro">
            <span>Reference / 0.1.0</span>
            <a href="?page=start">Getting started ↗</a>
          </div>
          <Field label="Find a component">
            {(p) => (
              <TextInput
                {...p}
                type="search"
                value={query}
                placeholder="Search the collection…"
                onChange={(e) => setQuery(e.target.value)}
              />
            )}
          </Field>
          <nav aria-label="Components">
            {filtered.map(([group, names]) => (
              <div className="nav-group" key={group}>
                <h2>{group}</h2>
                {names.map((item) => (
                  <a
                    key={item}
                    href={`?component=${item}`}
                    aria-current={name === item ? "page" : undefined}
                  >
                    {item}
                    <span aria-hidden="true">{name === item ? "↗" : ""}</span>
                  </a>
                ))}
              </div>
            ))}
            {!filtered.length && (
              <p role="status">No components found. Try another name.</p>
            )}
          </nav>
          <p className="sidebar-note">
            A working collection.
            <br />
            Free to use. Open to improve.
          </p>
        </aside>
        <main id="main" tabIndex={-1}>
          {contract ? (
            <article className="reference-page">
              <div className="breadcrumb">
                <a href="?#components">Components</a>
                <span>/</span>
                <span>{contract.name}</span>
              </div>
              <header className="component-heading">
                <p className="eyebrow">
                  {
                    Object.entries(groups).find(([, names]) =>
                      names.includes(contract.name),
                    )?.[0]
                  }
                </p>
                <h1>{contract.name}</h1>
                <p className="lead">{descriptions[contract.name]}</p>
                <Badge>Experimental · 0.1.0</Badge>
              </header>
              <Playground key={contract.name} name={contract.name} mode={mode} />
              <section className="contract-section">
                <p className="eyebrow">The contract</p>
                <h2>API & composition</h2>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th scope="col">Surface</th>
                      <th scope="col">Contract</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">{contract.name}</th>
                      <td>{contract.api}</td>
                    </tr>
                  </tbody>
                </table>
                <h2>States, keyboard & accessibility</h2>
                <p>{contract.behavior}</p>
                <p>
                  Keep visible labels and focus indicators. Check your complete
                  composition with the content, errors, and assistive technology
                  your audience uses.
                </p>
              </section>
              <div className="next-component">
                <span>Continue the collection</span>
                <a
                  href={`?component=${contracts[(contracts.indexOf(contract) + 1) % contracts.length].name}`}
                >
                  {
                    contracts[
                      (contracts.indexOf(contract) + 1) % contracts.length
                    ].name
                  }{" "}
                  →
                </a>
              </div>
            </article>
          ) : start ? (
            <Start />
          ) : name ? (
            <article className="reference-page">
              <h1>Component not found</h1>
              <p>Choose a component from the collection.</p>
              <a href="?">Back to the collection</a>
            </article>
          ) : (
            <Home />
          )}
          <footer className="site-footer">
            <strong>{familyName} React</strong>
            <span>Considered in public. Released under MIT.</span>
            <a
              href={`${repo}/blob/work/registry-foundations/docs/release-policy.md`}
            >
              Experimental release policy ↗
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
