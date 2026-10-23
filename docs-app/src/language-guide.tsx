import grammar from "docs-grammar";
import { family, familyName } from "docs-family";
import { repo } from "./data";
function inline(text: string) {
  return text
    .split(/(`[^`]+`)/g)
    .map((part, i) =>
      part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part,
    );
}
export function LanguageGuide() {
  return (
    <article className="language-guide">
      <nav className="language-guide-links" aria-label="Language resources">
        <a href="?page=collection">Try the working pattern →</a>
        <a href="?page=agents">Build with an agent →</a>
        <a
          href={`${repo}/blob/work/registry-foundations/docs/languages/${family}/grammar.md`}
        >
          Versioned source ↗
        </a>
      </nav>
      {grammar
        .trim()
        .split(/\n\n+/)
        .map((block, i) =>
          block.startsWith("# ") ? (
            <h1 key={i}>{block.slice(2)}</h1>
          ) : block.startsWith("## ") ? (
            <h2 key={i}>{block.slice(3)}</h2>
          ) : (
            <p key={i}>{inline(block.replaceAll("\n", " "))}</p>
          ),
        )}
      <p>
        <a href="?page=collection">Explore {familyName} in a complete task →</a>
      </p>
    </article>
  );
}
