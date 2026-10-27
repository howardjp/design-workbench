import { MasterFooter } from "./martlet-footer";
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
  const [scrolled, setScrolled] = useState(false);
  const [headerReady, setHeaderReady] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let scheduled = 0, readyFrame = 0;
    const update = () => setScrolled(window.scrollY >= Math.min(260, Math.max(160, innerHeight * .25)));
    const onScroll = () => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(() => { update(); scheduled = 0; });
    };
    const restore = () => {
      setMenuOpen(false);
      update();
      readyFrame = requestAnimationFrame(() => setHeaderReady(true));
    };
    restore();
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', update, {passive:true});
    window.addEventListener('pageshow', restore);
    window.addEventListener('hashchange', onScroll);
    return () => {
      cancelAnimationFrame(scheduled); cancelAnimationFrame(readyFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', restore);
      window.removeEventListener('hashchange', onScroll);
    };
  }, []);
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
    <div className="martlet-reference" data-page={page} data-menu-open={menuOpen} data-scrolled={scrolled} data-header-ready={headerReady}>
      <AppShell
        navigationLabel="Documentation"
        headerMode={scrolled || menuOpen || page === 'home' ? (mode === 'dark' ? 'light' : 'dark') : (mode === 'dark' ? 'dark' : 'light')}
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
              The Language
            </a>
            <a
              href="?page=collection"
              aria-current={page === "collection" ? "page" : undefined}
            >
              Working Patterns
            </a>
            <a href="?page=patterns" aria-current={page === 'patterns' ? 'page' : undefined}>Reference Patterns</a>
            <a
              href="?page=start"
              aria-current={page === "start" ? "page" : undefined}
            >
              Getting Started
            </a>
            <a
              href="?#components"
              aria-current={page === "home" ? "page" : undefined}
            >
              Components
            </a>
            <a href="?page=agents">For Agents</a>
          </div>
        }
        utilities={
          <div id="martlet-reference-utilities"><Button variant="quiet" onClick={onModeChange}>
            {mode === "light" ? "Dark Mode" : "Light Mode"}
          </Button></div>
        }
      >
        <div className="martlet-reference-width">
          {page !== 'home' && <div className="martlet-reference-index">
            <Disclosure summary="Browse the 22 components">
              {directory}
            </Disclosure>
            <span>Design language 0.3 preview · React 0.1.0 · MIT</span>
          </div>}
          {children}

        </div>
      </AppShell>
      <MasterFooter />
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
          <a href="?page=language">Meet the language <span aria-hidden="true">→</span></a>
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
