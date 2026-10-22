export const maturities = ["proposed", "experimental", "stable", "deprecated"];
export const categories = [
  "Layout",
  "Input",
  "Navigation",
  "Feedback",
  "Data",
  "Overlay",
  "Content",
];
export const platforms = [
  "CSS",
  "Astro",
  "React",
  "Vue",
  "Svelte",
  "Native",
  "Editors",
];
export function validateDraft(value) {
  const errors = {};
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { name: "Provide a component record." };
  for (const [key, min, max, label] of [
    ["name", 2, 80, "Name"],
    ["summary", 20, 600, "Summary"],
    ["acceptanceCriteria", 20, 4000, "Acceptance criteria"],
    ["evidence", 0, 2000, "Evidence"],
    ["martletNotes", 0, 4000, "Martlet notes"],
    ["krigsvoldNotes", 0, 4000, "Krigsvold notes"],
    ["migration", 0, 4000, "Migration guidance"],
  ]) {
    if (
      typeof value[key] !== "string" ||
      value[key].trim().length < min ||
      value[key].length > max
    )
      errors[key] = `${label} must contain ${min}–${max} characters.`;
  }
  if (!categories.includes(value.category))
    errors.category = "Choose a category.";
  if (!maturities.includes(value.maturity))
    errors.maturity = "Choose a maturity stage.";
  if (
    !Array.isArray(value.targets) ||
    value.targets.length === 0 ||
    value.targets.length > platforms.length ||
    new Set(value.targets).size !== value.targets.length ||
    value.targets.some((item) => !platforms.includes(item))
  )
    errors.targets = "Choose at least one target platform.";
  if (
    value.maturity === "stable" &&
    (typeof value.evidence !== "string" || value.evidence.trim().length < 20)
  )
    errors.evidence =
      "Stable components need recorded usage and verification evidence (at least 20 characters).";
  if (
    value.maturity === "deprecated" &&
    (typeof value.migration !== "string" || value.migration.trim().length < 20)
  )
    errors.migration =
      "Deprecated components need migration guidance (at least 20 characters).";
  return errors;
}
export const draftKeys = [
  "name",
  "summary",
  "category",
  "maturity",
  "targets",
  "acceptanceCriteria",
  "evidence",
  "martletNotes",
  "krigsvoldNotes",
  "migration",
];
export function toDraft(record) {
  return Object.fromEntries(draftKeys.map((key) => [key, record[key]]));
}
export function cleanDraft(record) {
  return Object.fromEntries(
    draftKeys.map((key) => [
      key,
      Array.isArray(record[key]) ? [...record[key]] : record[key].trim(),
    ]),
  );
}
export function newDraft() {
  return {
    name: "",
    summary: "",
    category: "Input",
    maturity: "proposed",
    targets: ["React"],
    acceptanceCriteria: "",
    evidence: "",
    martletNotes: "",
    krigsvoldNotes: "",
    migration: "",
  };
}
export function filterRecords(records, query, maturity = "", platform = "") {
  const needle = query.trim().toLocaleLowerCase();
  return records.filter(
    (record) =>
      (!maturity || record.maturity === maturity) &&
      (!platform || record.targets.includes(platform)) &&
      `${record.name} ${record.summary} ${record.category}`
        .toLocaleLowerCase()
        .includes(needle),
  );
}
