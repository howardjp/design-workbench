import grammar from "docs-grammar";
import decisions from "docs-decisions";
import { family, familyName, DataTable } from "docs-family";
import { repo } from "./data";
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
  return <article className="language-guide">
    <nav className="language-guide-links" aria-label="Language resources">
      <a href="#source-decisions">Source decisions</a>
      <a href="?page=collection">Try the working pattern →</a>
      <a href="?page=agents">Build with an agent →</a>
      <a href={`${repo}/blob/work/registry-foundations/docs/languages/${family}/decisions.md`}>Versioned decisions ↗</a>
    </nav>
    <section className="language-guide-rules">{blocks(grammar)}</section>
    <section id="source-decisions" className="language-guide-decisions">{blocks(decisions, true)}</section>
    <p><a href="?page=collection">Explore {familyName} in a complete task →</a></p>
  </article>;
}
