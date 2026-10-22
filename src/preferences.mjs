export const preferencesKey = "design-workbench:preferences:v1";
export const defaultPreferences = {
  schemaVersion: 1,
  defaultView: "inventory",
  pageSize: 10,
  protectDrafts: true,
};
export function validatePreferences(value) {
  if (
    !value ||
    value.schemaVersion !== 1 ||
    !["inventory", "overview", "queue", "reading"].includes(
      value.defaultView,
    ) ||
    ![10, 25, 50].includes(value.pageSize) ||
    typeof value.protectDrafts !== "boolean"
  )
    throw new Error("Unsupported preferences");
  return {
    schemaVersion: 1,
    defaultView: value.defaultView,
    pageSize: value.pageSize,
    protectDrafts: value.protectDrafts,
  };
}
export function readPreferences(storage) {
  try {
    const text = storage.getItem(preferencesKey);
    return {
      value:
        text === null
          ? { ...defaultPreferences }
          : validatePreferences(JSON.parse(text)),
      issue: "",
    };
  } catch {
    return {
      value: { ...defaultPreferences },
      issue:
        "Saved workspace preferences could not be read. Safe defaults are in use; saving settings replaces the unreadable preference copy.",
    };
  }
}
export function writePreferences(storage, value) {
  const safe = validatePreferences(value);
  storage.setItem(preferencesKey, JSON.stringify(safe));
  return safe;
}
