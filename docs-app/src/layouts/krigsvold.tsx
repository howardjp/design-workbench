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
  return (
    <div className="krigsvold-reference">
      <AppShell
        navigationLabel="Documentation"
        navigationPlacement="top"
        headerMode="dark"
        brand={
          <a href="?" className="krigsvold-reference-brand">
            <img src={mark} alt="" width="38" height="38" />
            <span>Krigsvold React</span>
          </a>
        }
        navigation={
          <>
            {Object.entries(groups).map(([group, names], index) => (
              <Disclosure
                key={group}
                name="krigsvold-reference-navigation"
                summary={
                  <span>
                    {["Actions", "Forms", "Structure", "Data"][index]}{" "}
                    <span aria-hidden="true">⌄</span>
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
                <div className="krigsvold-reference-menu">
                  {names.map((name) => (
                    <a key={name} href={`?component=${name}`}>
                      {name}
                    </a>
                  ))}
                </div>
              </Disclosure>
            ))}
          </>
        }
        utilities={
          <>
            <div className="krigsvold-reference-search">{directory}</div>
            <Button variant="quiet" onClick={onModeChange}>
              {mode === "light" ? "Dark mode" : "Light mode"}
            </Button>
          </>
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
          <footer className="krigsvold-reference-footer">
            <img src={mark} alt="" width="36" height="36" />
            <span>Krigsvold React · MIT</span>
            <a
              href={`${repo}/blob/work/registry-foundations/docs/release-policy.md`}
            >
              Release policy ↗
            </a>
          </footer>
        </div>
      </AppShell>
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
        <a href="#playground">01 / Specimen</a>
        <a href="#api">02 / API</a>
        <a href="#accessibility">03 / Behavior</a>
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
