import {
  useEffect,
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
      className={`martlet-button martlet-button--${variant} ${className}`}
      {...props}
    />
  );
}
export function TextInput({
  className = "",
  ...props
}: ComponentPropsWithRef<"input">) {
  return <input className={`martlet-input ${className}`} {...props} />;
}
export function Select({
  className = "",
  ...props
}: ComponentPropsWithRef<"select">) {
  return <select className={`martlet-input ${className}`} {...props} />;
}
export function Textarea({
  className = "",
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return <textarea className={`martlet-input ${className}`} {...props} />;
}
export type FieldControl = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (props: FieldControl) => ReactNode;
}) {
  const id = useId();
  const descriptions =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className="martlet-field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        "aria-describedby": descriptions,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="martlet-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="martlet-error">
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
      className={`martlet-notice martlet-notice--${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="martlet-badge">{children}</span>;
}
export function DataTable({
  caption,
  children,
  className = "",
  ...props
}: ComponentPropsWithRef<"table"> & { caption: string }) {
  return (
    <div
      className="martlet-table-scroll"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className={`martlet-table ${className}`} {...props}>
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
    <div className="martlet-app">
      <a className="martlet-skip" href="#main">
        Skip to content
      </a>
      <header className="martlet-app-header">
        <div className="martlet-app-brand">{brand}</div>
        <nav aria-label="Workbench">{navigation}</nav>
        <div className="martlet-app-utilities">{utilities}</div>
        <p className="martlet-app-colophon">
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
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      className="martlet-dialog"
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
    <label className={`martlet-checkbox ${className}`} htmlFor={controlId}>
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
      className={`martlet-fieldset ${className}`}
      aria-describedby={describedBy}
      aria-invalid={error ? true : props["aria-invalid"]}
    >
      <legend>{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="martlet-hint">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="martlet-error">
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
    <details {...props} className={`martlet-disclosure ${className}`}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
