import { useEffect, useRef, useState } from "react";
import {
  AppShell,
  Article,
  Badge,
  Button,
  Disclosure,
  TableOfContents,
} from "docs-family";
import mark from "../../brand/martlet-mark.svg";
import { groups, descriptions, repo } from "../data";
export const familyMark = mark;
import type { LayoutProps, PageProps } from "../layout-types";
import "./martlet.css";
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
    const media = matchMedia("(max-width:68rem), (max-aspect-ratio:4/5)");
    const resize = () => setMenuOpen(false);
    window.addEventListener("keydown", close);
    media.addEventListener("change", resize);
    return () => { window.removeEventListener("keydown", close); media.removeEventListener("change", resize); };
  }, [menuOpen]);
  return (
    <div className="martlet-reference" data-menu-open={menuOpen}>
      <AppShell
        navigationLabel="Documentation"
        headerMode="dark"
        brand={
          <div className="martlet-reference-identity">
            <a href="?" className="martlet-reference-brand">
              <img src={mark} alt="" width="42" height="42" />
              <span>Martlet React</span>
            </a>
            <button ref={menuButton} className="martlet-reference-toggle" type="button"
              aria-expanded={menuOpen} aria-controls="martlet-reference-navigation martlet-reference-utilities"
              onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
          </div>
        }
        navigation={
          <div id="martlet-reference-navigation" className="martlet-reference-navigation-links">
            <a
              href="?page=language"
              aria-current={page === "language" ? "page" : undefined}
            >
              The language
            </a>
            <a
              href="?page=collection"
              aria-current={page === "collection" ? "page" : undefined}
            >
              Working patterns
            </a>
            <a
              href="?page=start"
              aria-current={page === "start" ? "page" : undefined}
            >
              Getting started
            </a>
            <a
              href="?#components"
              aria-current={page === "home" ? "page" : undefined}
            >
              Components
            </a>
            <a href="?page=agents">For agents</a>
          </div>
        }
        utilities={
          <div id="martlet-reference-utilities"><Button variant="quiet" onClick={onModeChange}>
            {mode === "light" ? "Dark mode" : "Light mode"}
          </Button></div>
        }
      >
        <div className="martlet-reference-width">
          <div className="martlet-reference-index">
            <Disclosure summary="Browse the 22 components">
              {directory}
            </Disclosure>
            <span>Experimental · 0.1.0 · MIT</span>
          </div>
          {children}

        </div>
      </AppShell>
      <footer className="martlet-reference-footer">
        <div className="martlet-reference-footer-grid">
          <div><h2>The language</h2><a href="?page=language">Principles and decisions</a><a href="?page=collection">Working pattern</a><a href="?component=Article">Reading and context</a></div>
          <div><h2>Build</h2><a href="?page=start">Getting started</a><a href="?#components">Component reference</a><a href="?page=agents">MCP and builder skill</a></div>
          <div><h2>Project</h2><a href={repo}>Source repository ↗</a><a href={`${repo}/blob/work/registry-foundations/docs/release-policy.md`}>Release policy ↗</a><a href={`${repo}/blob/work/registry-foundations/docs/qa/origin-reconciliation.md`}>Origin reconciliation ↗</a></div>
        </div>
        <div className="martlet-reference-footer-base"><img src={mark} alt="" width="48" height="48" /><span>Martlet React · MIT<br />Experimental application extensions</span></div>
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
    <Article
      className="martlet-reference-article"
      title={name}
      eyebrow={category}
      summary={description}
      metadata={<Badge>Experimental · 0.1.0</Badge>}
      contents={
        <TableOfContents
          items={[
            { id: "playground", label: "Try the component" },
            { id: "example", label: "Use it in React", depth: 3 },
            { id: "api", label: "API & composition" },
            { id: "accessibility", label: "States & accessibility" },
          ]}
        />
      }

    >
      <div className="martlet-reference-example">{playground}</div>
      <section className="martlet-reference-contract">
        {api}
        {accessibility}
      </section>
    </Article>
  );
}
export function FamilyHome() {
  return (
    <>
      <header className="martlet-reference-intro">
        <div>
          <p className="reference-kicker">The React collection</p>
          <h1>
            Martlet<span>.</span>
          </h1>
          <p className="martlet-reference-deck">
            A little room to think.
            <br />A clear place to begin.
          </p>
        </div>
        <div>
          <p>
            A design language for substantial work: relationships, readable
            sequence, and continuity from one decision to the next. Explore its
            grammar, working patterns, and twenty-two React components.
          </p>
          <a href="?page=language">Meet the language →</a>
        </div>
      </header>
      <Article
        title="A collection of things worth keeping."
        titleLevel={2}
        eyebrow="Commonplace / A working pattern"
        summary="Find an idea. Give it your attention. Shape what comes next."
        aside={
          <>
            <Badge>22 components</Badge>
            <p>React 19 · ES modules · MIT</p>
            <a href="?component=Article">Explore Article →</a>
          </>
        }
      >
        <p>
          Browse a collection, read a note, and edit it without losing your
          place. Then try a failed save: your work stays with you. A language
          has to account for the whole task.
        </p>
        <div className="martlet-reference-actions">
          <Button
            onClick={() => {
              location.href = "?page=collection";
            }}
          >
            Open Commonplace
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              location.href = "?page=agents";
            }}
          >
            Build with Martlet
          </Button>
        </div>
      </Article>
      <section id="components" className="martlet-reference-collection">
        <p className="reference-kicker">The collection</p>
        <h2>Find the piece you need.</h2>
        {Object.entries(groups).map(([group, names]) => (
          <section key={group}>
            <h3>{group}</h3>
            <div>
              {names.map((name) => (
                <a href={`?component=${name}`} key={name}>
                  <strong>{name}</strong>
                  <span>{descriptions[name]}</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </section>
    </>
  );
}
