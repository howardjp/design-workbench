import {
  useLayoutEffect,
  useId,
  useRef,
  type ReactNode,
  type ComponentPropsWithRef,
} from "react";

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "quiet";
}) {
  return (
    <button
      type={type}
      className={`krigsvold-button krigsvold-button--${variant} ${className}`}
      {...props}
    />
  );
}
export function TextInput({
  className = "",
  ...props
}: ComponentPropsWithRef<"input">) {
  return <input className={`krigsvold-input ${className}`} {...props} />;
}
export function Select({
  className = "",
  ...props
}: ComponentPropsWithRef<"select">) {
  return <select className={`krigsvold-input ${className}`} {...props} />;
}
export function Textarea({
  className = "",
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return <textarea className={`krigsvold-input ${className}`} {...props} />;
}
export type FieldControl = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};
export function Field({
  id: providedId,
  label,
  hint,
  error,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: FieldControl) => ReactNode;
}) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptions =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className="krigsvold-field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        "aria-describedby": descriptions,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="krigsvold-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="krigsvold-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "success" | "error";
  children: ReactNode;
}) {
  return (
    <div
      className={`krigsvold-notice krigsvold-notice--${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="krigsvold-badge">{children}</span>;
}
export function DataTable({
  caption,
  children,
  className = "",
  ...props
}: ComponentPropsWithRef<"table"> & { caption: string }) {
  return (
    <div
      className="krigsvold-table-scroll"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className={`krigsvold-table ${className}`} {...props}>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
export function AppShell({
  brand,
  navigation,
  utilities,
  children,
}: {
  brand: ReactNode;
  navigation: ReactNode;
  utilities: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="krigsvold-app">
      <a className="krigsvold-skip" href="#main">
        Skip to content
      </a>
      <header className="krigsvold-app-header">
        <div className="krigsvold-app-brand">{brand}</div>
        <nav aria-label="Workbench">{navigation}</nav>
        <div className="krigsvold-app-utilities">{utilities}</div>
        <p className="krigsvold-app-colophon">
          A working place for
          <br />
          considered interfaces.
        </p>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
export function Dialog({
  open,
  title,
  onDismiss,
  children,
}: {
  open: boolean;
  title: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      className="krigsvold-dialog"
      ref={ref}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <h2 id={id}>{title}</h2>
      {children}
    </dialog>
  );
}

export function Checkbox({
  label,
  id,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type"> & { label: ReactNode }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  return (
    <label className={`krigsvold-checkbox ${className}`} htmlFor={controlId}>
      <input {...props} id={controlId} type="checkbox" />
      {label}
    </label>
  );
}
export function Fieldset({
  legend,
  hint,
  error,
  children,
  className = "",
  ...props
}: ComponentPropsWithRef<"fieldset"> & {
  legend: ReactNode;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const describedBy =
    [props["aria-describedby"], hint && `${id}-hint`, error && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <fieldset
      {...props}
      className={`krigsvold-fieldset ${className}`}
      aria-describedby={describedBy}
      aria-invalid={error ? true : props["aria-invalid"]}
    >
      <legend>{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="krigsvold-hint">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="krigsvold-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
export function Disclosure({
  summary,
  children,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"details">, "children"> & {
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <details {...props} className={`krigsvold-disclosure ${className}`}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}

export type SummaryError = { message: string; targetId?: string };
export function ErrorSummary({
  title,
  errors = [],
  children,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"div">, "title"> & {
  title: ReactNode;
  errors?: SummaryError[];
}) {
  const titleId = useId();
  return (
    <div
      {...props}
      tabIndex={-1}
      role="alert"
      aria-labelledby={titleId}
      className={`krigsvold-error-summary ${className}`}
    >
      <strong id={titleId}>{title}</strong>
      {errors.length > 0 && (
        <ul>
          {errors.map((error, index) => (
            <li key={index}>
              {error.targetId ? (
                <a
                  href={`#${error.targetId}`}
                  onClick={(event) => {
                    const target = document.getElementById(error.targetId!);
                    if (target) {
                      event.preventDefault();
                      target.focus();
                    }
                  }}
                >
                  {error.message}
                </a>
              ) : (
                error.message
              )}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

export type ContentsItem = { id: string; label: ReactNode };
export function TableOfContents({
  items,
  label = "On this page",
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"nav">, "children"> & {
  items: readonly ContentsItem[];
  label?: string;
}) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={`krigsvold-contents ${className}`}
    >
      <strong>{label}</strong>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${encodeURIComponent(item.id)}`}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Article({
  title,
  titleLevel = 1,
  eyebrow,
  summary,
  metadata,
  contents,
  aside,
  contextLabel = "Article context",
  footer,
  children,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"article">, "title"> & {
  title: ReactNode;
  titleLevel?: 1 | 2;
  eyebrow?: ReactNode;
  summary?: ReactNode;
  metadata?: ReactNode;
  contents?: ReactNode;
  aside?: ReactNode;
  contextLabel?: string;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const Heading = titleLevel === 1 ? "h1" : "h2";
  return (
    <article
      {...props}
      aria-labelledby={titleId}
      className={`krigsvold-article ${className}`}
    >
      <header className="krigsvold-article-header">
        {eyebrow && <p className="krigsvold-article-eyebrow">{eyebrow}</p>}
        <Heading id={titleId}>{title}</Heading>
        {summary && <p className="krigsvold-article-summary">{summary}</p>}
        {metadata && (
          <div className="krigsvold-article-metadata">{metadata}</div>
        )}
      </header>
      <div className="krigsvold-article-layout">
        {(contents || aside) && (
          <aside
            className="krigsvold-article-context"
            aria-label={contextLabel}
          >
            {contents}
            {aside}
          </aside>
        )}
        <div className="krigsvold-prose">{children}</div>
      </div>
      {footer && <footer className="krigsvold-article-footer">{footer}</footer>}
    </article>
  );
}

export function FileInput({
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type" | "value" | "defaultValue">) {
  return (
    <input
      {...props}
      type="file"
      className={`krigsvold-file-input ${className}`}
    />
  );
}

export function Radio({
  label,
  id,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type"> & { label: ReactNode }) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  return (
    <label className={`krigsvold-radio ${className}`} htmlFor={controlId}>
      <input {...props} id={controlId} type="radio" />
      {label}
    </label>
  );
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  disabled = false,
  label = "Pagination",
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"nav">, "children"> & {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  const count = Number.isFinite(pageCount)
    ? Math.max(1, Math.trunc(pageCount))
    : 1;
  const current = Number.isFinite(page)
    ? Math.min(count, Math.max(1, Math.trunc(page)))
    : 1;
  return (
    <nav
      {...props}
      aria-label={label}
      className={`krigsvold-pagination ${className}`}
    >
      <Button
        variant="secondary"
        disabled={disabled || current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        Previous page
      </Button>
      <p aria-live="polite" aria-atomic="true">
        Page {current} of {count}
      </p>
      <Button
        variant="secondary"
        disabled={disabled || current === count}
        onClick={() => onPageChange(current + 1)}
      >
        Next page
      </Button>
    </nav>
  );
}
