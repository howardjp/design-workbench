import grammar from "docs-grammar";
import decisions from "docs-decisions";
import { family, familyName, DataTable } from "docs-family";
import martletSource from "../../docs/languages/martlet/canonical.json";
import krigsvoldSource from "../../docs/languages/krigsvold/canonical.json";
function inline(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) => part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part);
}
// Repository Markdown is escaped React text; no raw HTML is accepted.
function blocks(text: string, demote = false) {
  return text.trim().split(/\n\n+/).map((block, i) => {
    if (block.startsWith("|")) {
      const rows = block.split("\n").map(line => line.trim().slice(1, -1).split("|").map(cell => cell.trim()));
      return <DataTable key={i} caption="Origin roles and decisions">
        <thead><tr>{rows[0].map((cell, n) => <th scope="col" key={n}>{inline(cell)}</th>)}</tr></thead>
        <tbody>{rows.slice(2).map((row, n) => <tr key={n}>{row.map((cell, k) => <td key={k}>{inline(cell)}</td>)}</tr>)}</tbody>
      </DataTable>;
    }
    if (block.startsWith("# ")) return demote ? <h2 key={i}>{block.slice(2)}</h2> : <h1 key={i}>{block.slice(2)}</h1>;
    if (block.startsWith("## ")) return demote ? <h3 key={i}>{block.slice(3)}</h3> : <h2 key={i}>{block.slice(3)}</h2>;
    return <p key={i}>{inline(block.replaceAll("\n", " "))}</p>;
  });
}
export function LanguageGuide() {
  const source = family === 'martlet' ? martletSource : krigsvoldSource;
  return <article className="language-guide">
    <nav className="language-guide-links" aria-label="Language resources">
      <a href="#source-decisions">Source decisions</a>
      <a href="?page=patterns">Forms, results and coverage →</a>
      <a href="?page=collection">Try the working pattern →</a>
      <a href="?page=agents">Build with an agent →</a>
      <a href={`https://${family}theme.dev/design-system/`}>Main package reference ↗</a>
      <a href={`https://github.com/${source.repository}/blob/${source.commit}/docs/source-decisions.md`}>Canonical decisions candidate ↗</a>
    </nav>
    <section className="language-guide-rules">{blocks(grammar)}</section>
    <section id="source-decisions" className="language-guide-decisions">{blocks(decisions, true)}</section>
    <p><a href="?page=collection">Explore {familyName} in a complete task →</a></p>
  </article>;
}
