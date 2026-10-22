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
  useEffect(() => {
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
