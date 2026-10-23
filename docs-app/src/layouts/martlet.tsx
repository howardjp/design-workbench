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
  return (
    <div className="martlet-reference">
      <AppShell
        navigationLabel="Documentation"
        brand={
          <a className="martlet-reference-brand" href="?">
            <img src={mark} alt="" width="48" height="48" />
            <span>
              Martlet<small>React</small>
            </span>
          </a>
        }
        navigation={
          <>
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
          </>
        }
        utilities={
          <Button variant="quiet" onClick={onModeChange}>
            {mode === "light" ? "Dark mode" : "Light mode"}
          </Button>
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
          <footer className="martlet-reference-footer">
            <img src={mark} alt="" width="42" height="42" />
            <div>
              <strong>Martlet React</strong>
              <p>Blue and silver in the light. Navy and gold in the dark.</p>
            </div>
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
            { id: "example", label: "Use it in React" },
            { id: "api", label: "API & composition" },
            { id: "accessibility", label: "States & accessibility" },
          ]}
        />
      }
      aside={
        <p>
          This reference uses Martlet’s own components, typography and
          Light/Dark palette.
        </p>
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
