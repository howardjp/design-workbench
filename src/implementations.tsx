import type { Implementation } from "./types";
export function ImplementationList({ items }: { items: Implementation[] }) {
  return items.length ? (
    <ul className="implementations">
      {items.map((item) => (
        <li key={`${item.family}/${item.platform}/${item.package}`}>
          <strong>
            {item.family === "martlet" ? "Martlet" : "Krigsvold"} ·{" "}
            {item.platform}
          </strong>
          <span>
            {item.package} {item.version}
          </span>
          <span>
            {item.state === "published"
              ? "Published package"
              : "Workspace package; unpublished"}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <p>No implementations recorded.</p>
  );
}
