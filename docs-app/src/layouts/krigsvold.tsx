import { useEffect, useRef, useState } from "react";
import {
  AppShell,
  Badge,
  Button,
  DataTable,
  DefinitionList,
  Disclosure,
} from "docs-family";
import mark from "../../brand/krigsvold-mark.svg";
import { groups, descriptions, repo } from "../data";
export const familyMark = mark;
import type { LayoutProps, PageProps } from "../layout-types";
import "./krigsvold.css";
export function FamilyLayout({
  mode,
  onModeChange,
  directory,
  page,
  children,
}: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
    };
    const media = matchMedia("(max-width:991.98px)");
    const resize = () => setMenuOpen(false);
    window.addEventListener("keydown", close);
    media.addEventListener("change", resize);
    return () => { window.removeEventListener("keydown", close); media.removeEventListener("change", resize); };
  }, [menuOpen]);
  return (
    <div className="krigsvold-reference" data-menu-open={menuOpen}>
      <AppShell
        navigationLabel="Documentation"
        navigationPlacement="top"
        headerMode="dark"
        brand={
          <div className="krigsvold-reference-identity">
            <a href="?" className="krigsvold-reference-brand">
              <img src={mark} alt="" width="38" height="38" />
              <span>Krigsvold React</span>
            </a>
            <button ref={menuButton} className="krigsvold-reference-toggle" type="button"
              aria-expanded={menuOpen} aria-controls="krigsvold-reference-navigation krigsvold-reference-utilities"
              onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
          </div>
        }
        navigation={
          <div id="krigsvold-reference-navigation" className="krigsvold-reference-navigation-links">
            {Object.entries(groups).map(([group, names], index) => (
              <Disclosure
                key={group}
                name="krigsvold-reference-navigation"
                summary={
                  <span>
                    {["Actions", "Forms", "Structure", "Data"][index]}{" "}
                    <svg className="krigsvold-reference-caret" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m7 10 5 5 5-5" /></svg>
                  </span>
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector("summary")?.focus();
                  }
                }}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    event.currentTarget.open = false;
                }}
              >
                <div className="krigsvold-reference-menu" data-krigsvold="light">
                  {names.map((name) => (
                    <a key={name} href={`?component=${name}`}>
                      {name}
                    </a>
                  ))}
                </div>
              </Disclosure>
            ))}
          </div>
        }
        utilities={
          <div id="krigsvold-reference-utilities" className="krigsvold-reference-utilities-content">
            <div className="krigsvold-reference-search">{directory}</div>
            <Button variant="quiet" onClick={onModeChange}>
              {mode === "light" ? "Dark mode" : "Light mode"}
            </Button>
          </div>
        }
      >
        <div className="krigsvold-reference-width">
          <div className="krigsvold-reference-register">
            <div>
              <a href="?" aria-current={page === "home" ? "page" : undefined}>
                Overview
              </a>
              <a
                href="?page=start"
                aria-current={page === "start" ? "page" : undefined}
              >
                Getting started
              </a>
              <a
                href="?page=language"
                aria-current={page === "language" ? "page" : undefined}
              >
                Design language
              </a>
              <a
                href="?page=collection"
                aria-current={page === "collection" ? "page" : undefined}
              >
                Working patterns
              </a>
              <a
                href="?page=agents"
                aria-current={page === "agents" ? "page" : undefined}
              >
                Agent tools
              </a>
              <a href="https://krigsvoldtheme.dev/">Theme ↗</a>
              <a href={repo}>Source ↗</a>
            </div>
            <span>0.1.0 · EXPERIMENTAL</span>
          </div>
          {children}

        </div>
      </AppShell>
      <footer className="krigsvold-reference-footer">
        <div className="krigsvold-reference-footer-grid">
          <div><h2>The language</h2><a href="?page=language">Principles and decisions</a><a href="?page=collection">Working pattern</a><a href="?component=Article">Reading and context</a></div>
          <div><h2>Build</h2><a href="?page=start">Getting started</a><a href="?#components">Component reference</a><a href="?page=agents">MCP and builder skill</a></div>
          <div><h2>Project</h2><a href={repo}>Source repository ↗</a><a href={`${repo}/blob/work/registry-foundations/docs/release-policy.md`}>Release policy ↗</a><a href={`${repo}/blob/work/registry-foundations/docs/qa/origin-reconciliation.md`}>Origin reconciliation ↗</a></div>
        </div>
        <div className="krigsvold-reference-footer-base"><img src={mark} alt="" width="48" height="48" /><span>Krigsvold React · MIT<br />Experimental application extensions</span></div>
      </footer>
    </div>
  );
}

export function ComponentPage({
  name,
  description,
  category,
  playground,
  api,
  accessibility,
}: PageProps) {
  return (
    <article className="krigsvold-reference-component">
      <header className="krigsvold-reference-heading">
        <p className="reference-kicker">{category}</p>
        <h1>{name}</h1>
        <p>{description}</p>
        <DefinitionList
          items={[
            { id: "status", term: "Status", description: "Experimental" },
            { id: "version", term: "Version", description: "0.1.0" },
            { id: "platform", term: "Platform", description: "React 19" },
          ]}
        />
      </header>
      <nav
        className="krigsvold-reference-sections"
        aria-label="Component sections"
      >
        <a href="#playground">Specimen</a>
        <a href="#api">API</a>
        <a href="#accessibility">Behavior</a>
      </nav>
      <div className="krigsvold-reference-workspace">
        <section aria-label="Interactive specimen">{playground}</section>
        <aside
          className="krigsvold-reference-contract"
          aria-label="Component contract"
        >
          {api}
          {accessibility}
        </aside>
      </div>
    </article>
  );
}
export function FamilyHome() {
  return (
    <>
      <header className="krigsvold-reference-cover">
        <p className="reference-kicker">A working React system</p>
        <img src={mark} alt="" width="144" height="144" />
        <h1>
          Krigsvold
          <br />
          React.
        </h1>
        <p className="krigsvold-reference-coverline">
          Clear regions. Deliberate decisions.
        </p>
        <p>
          A design language for complex work. Purposeful regions, stable
          alignment, and explicit state—from a reading page to an active
          workspace.
        </p>
        <a href="?page=collection">Enter the Notes workspace →</a>
      </header>
      <div className="krigsvold-reference-status">
        <DefinitionList
          items={[
            { id: "exports", term: "Components", description: "22" },
            { id: "support", term: "Platform", description: "React 19" },
            { id: "license", term: "License", description: "MIT" },
          ]}
        />
        <Badge>Experimental · 0.1.0</Badge>
      </div>
      <section id="components" className="krigsvold-reference-catalog">
        <header>
          <p className="reference-kicker">Component register</p>
          <h2>A place for each part.</h2>
          <p>
            Choose a component to inspect its states, API and interaction
            contract.
          </p>
        </header>
        {Object.entries(groups).map(([group, names]) => (
          <DataTable key={group} caption={group}>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {names.map((name) => (
                <tr key={name}>
                  <th scope="row">
                    <a href={`?component=${name}`}>{name} ↗</a>
                  </th>
                  <td>{descriptions[name]}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        ))}
      </section>
    </>
  );
}
