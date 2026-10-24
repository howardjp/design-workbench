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
import "./shared.css";
import { CollectionPattern } from "docs-pattern";
import { LanguageGuide } from "./language-guide";

import { repo, groups, descriptions } from "./data";
import {
  FamilyLayout,
  ComponentPage,
  FamilyHome,
  familyMark,
} from "docs-layout";
function initialMode() {
  const requested = new URLSearchParams(location.search).get("mode");
  if (requested === "light" || requested === "dark") return requested;
  try {
    return localStorage.getItem(`docs-${family}-mode`) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}
function PatternShowcase({ mode }: { mode: string }) {
  const [width, setWidth] = useState("full");
  return (
    <>
      <div className="pattern-inspection">
        <Field label="Available width">
          {(p) => (
            <Select
              {...p}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            >
              <option value="full">Use available space</option>
              <option value="320">320px / narrow workspace</option>
              <option value="768">768px / medium workspace</option>
            </Select>
          )}
        </Field>
        <a href={`?workspace=1&mode=${mode}`}>Open a focused workspace ↗</a>
        <a href="?page=language">Read the pattern’s rules →</a>
      </div>
      <iframe
        data-pattern-preview
        title={`${familyName} collection working pattern`}
        className="pattern-frame"
        style={{ inlineSize: width === "full" ? "100%" : `${width}px` }}
        src="?workspace=1"
      />
    </>
  );
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
      <div className="playground" id="playground">
        <div className="preview-label">
          <span>Live specimen</span>
          <span>{familyName}</span>
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
            {name === "TableOfContents" && (
              <Field label="Contents layout">
                {(p) => <Select {...p} value={o.tocVariant} onChange={(e) => change("tocVariant", e.target.value as Options["tocVariant"])}>
                  <option value="index">Document index</option>
                  <option value="inline">Inline article contents</option>
                </Select>}
              </Field>
            )}
            {name === "AppShell" && (
              <Field label="Navigation placement">
                {(p) => (
                  <Select
                    {...p}
                    value={o.navigation}
                    onChange={(e) =>
                      change(
                        "navigation",
                        e.target.value as Options["navigation"],
                      )
                    }
                  >
                    {["default", "top", "side", "none"].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
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
function ShellExample() {
  const mode =
    new URLSearchParams(location.search).get("mode") === "dark"
      ? "dark"
      : "light";
  return (
    <div className={family} {...{ [`data-${family}`]: mode }}>
      <AppShell
        navigationLabel="Project navigation"
        navigationPlacement={
          (["top", "side", "none"].includes(
            new URLSearchParams(location.search).get("navigation") ?? "",
          )
            ? new URLSearchParams(location.search).get("navigation")
            : "default") as Options["navigation"]
        }
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
function Agents() {
  return (
    <article className="reference-page">
      <p className="reference-kicker">
        Authoritative context / Practical method
      </p>
      <h1>Build with {familyName}.</h1>
      <p className="lead">
        A language for people and agents. Use the same grammar, pattern
        decisions, and component contracts through a local MCP server and a
        companion builder skill.
      </p>
      <div className="callout">
        <strong>Working experimental tools. Local stdio.</strong>
        <p>
          These tools retrieve documented guidance. They do not certify a
          design, publish an app, or invent missing platform support. React
          remains experimental and unpublished.
        </p>
      </div>
      <h2>Take the language with you</h2>
      <p>
        <a href={`agents/${family}-agent-tools.tar.gz`} download>
          Download {familyName} MCP and builder skill ↓
        </a>
      </p>
      <p>
        The MIT archive contains only {familyName}’s knowledge snapshot, server
        launcher, dependency lock, and builder skill. It runs independently of
        this site and the administration workbench.
      </p>
      <h2>Start from the source</h2>
      <CopyCode
        code={`git clone ${repo}.git\ncd design-workbench\ngit checkout work/registry-foundations\nnpm ci --ignore-scripts\nnpm run build\nnpm run build:knowledge\n\n# Configure your MCP client to launch this command over stdio:\nnode /absolute/path/to/design-workbench/mcp/${family}.mjs`}
      />
      <p>
        For the downloaded archive, extract it, run{" "}
        <code>npm ci --ignore-scripts</code> in its directory, and point your
        client at its <code>index.mjs</code> instead. The client starts the
        process; it is not an HTTP address.
      </p>
      <h2>Connect an MCP client</h2>
      <CopyCode
        code={JSON.stringify(
          {
            mcpServers: {
              [`${family}-design-language`]: {
                command: "node",
                args: [`/absolute/path/to/${family}/index.mjs`],
              },
            },
          },
          null,
          2,
        )}
      />
      <p>
        This is the common stdio configuration shape. Your client may use a
        different configuration location. Interoperability has been checked with
        the MCP SDK client; individual desktop client setup remains to be
        verified.
      </p>
      <h2>Find the rules, then compose</h2>
      <p>
        Begin with <code>get_manifest</code> and confirm the family. Use{" "}
        <code>search_guidance</code> for the task, then{" "}
        <code>get_reference</code> for the complete matching rules, pattern, and
        API examples. Each result identifies the snapshot and source. This
        initial release covers React and the collection/editor pattern.
      </p>
      <h2>Add the builder skill</h2>
      <p>
        Copy the archive’s <code>{family}-builder</code> directory into your
        agent client’s supported skills location. The skill explains how to
        retrieve the rules, choose a composition, preserve the host’s identity,
        handle failures, and verify the complete task. It includes an offline
        grammar and API snapshot for use when MCP is unavailable.
      </p>
      <p>
        <a href="?page=language">Read the grammar →</a> ·{" "}
        <a href="?page=collection">Try the working pattern →</a>
      </p>
    </article>
  );
}
function App() {
  const params = new URLSearchParams(location.search);
  const name = params.get("component");
  const start = params.get("page") === "start";
  const pattern =
    params.get("page") === "collection" || params.has("workspace");
  const language = params.get("page") === "language";
  const agents = params.get("page") === "agents";
  const contract = contracts.find((item) => item.name === name);
  const [mode, setMode] = useState(initialMode);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const followMode = (event: StorageEvent) => {
      if (
        event.key === `docs-${family}-mode` &&
        (event.newValue === "light" || event.newValue === "dark")
      )
        setMode(event.newValue);
    };
    window.addEventListener("storage", followMode);
    return () => window.removeEventListener("storage", followMode);
  }, []);
  useEffect(() => {
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.append(icon);
    }
    icon.href = familyMark;
    document.title = `${contract?.name ?? (agents ? "Agent tools" : pattern ? "Working patterns" : language ? "Design language" : start ? "Getting started" : "The collection")} · ${familyName} React`;
    document.documentElement.style.colorScheme = mode;
    try {
      localStorage.setItem(`docs-${family}-mode`, mode);
    } catch {}
  }, [mode, contract, start, pattern, language, agents]);
  if (params.has("shell")) return <ShellExample />;
  if (params.has("workspace"))
    return (
      <div
        className={`${family} focused-pattern`}
        {...{ [`data-${family}`]: mode }}
      >
        <a href="?page=collection">← Pattern reference</a>
        <main id="main">
          <CollectionPattern />
        </main>
      </div>
    );
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
  const directory = (
    <div className="component-directory">
      <Field label="Find a component">
        {(p) => (
          <TextInput
            {...p}
            type="search"
            value={query}
            placeholder="Search components"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
          />
        )}
      </Field>
      <div className="directory-links">
        {filtered.map(([group, names]) => (
          <section key={group}>
            <h2>{group}</h2>
            {names.map((item) => (
              <a
                key={item}
                href={`?component=${item}`}
                aria-current={name === item ? "page" : undefined}
              >
                {item}
              </a>
            ))}
          </section>
        ))}
        {!filtered.length && (
          <p role="status">No components found. Try another name.</p>
        )}
      </div>
    </div>
  );
  const api = (
    <>
      <h2 id="api" tabIndex={-1}>
        API & composition
      </h2>
      <p>{contract?.api}</p>
    </>
  );
  const accessibility = (
    <>
      <h2 id="accessibility" tabIndex={-1}>
        States, keyboard & accessibility
      </h2>
      <p>{contract?.behavior}</p>
      <p>
        Check the complete composition with your content, errors and assistive
        technology. Every export remains experimental.
      </p>
    </>
  );
  return (
    <div className={family} {...{ [`data-${family}`]: mode }}>
      <FamilyLayout
        mode={mode}
        onModeChange={() => setMode(mode === "light" ? "dark" : "light")}
        directory={directory}
        page={
          agents
            ? "agents"
            : pattern
              ? "collection"
              : language
                ? "language"
                : start
                  ? "start"
                  : name
                    ? "component"
                    : "home"
        }
      >
        {contract ? (
          <ComponentPage
            name={contract.name}
            description={descriptions[contract.name]}
            category={
              Object.entries(groups).find(([, names]) =>
                names.includes(contract.name),
              )?.[0] ?? "Components"
            }
            playground={
              <Playground
                key={contract.name}
                name={contract.name}
                mode={mode}
              />
            }
            api={api}
            accessibility={accessibility}
          />
        ) : agents ? (
          <Agents />
        ) : pattern ? (
          <PatternShowcase mode={mode} />
        ) : language ? (
          <LanguageGuide />
        ) : start ? (
          <Start />
        ) : name ? (
          <article>
            <h1>Component not found</h1>
            <p>Choose a component from the index.</p>
            <a href="?">Back to the collection</a>
          </article>
        ) : (
          <FamilyHome />
        )}
      </FamilyLayout>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
