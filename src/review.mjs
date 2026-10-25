export const reviewAreas = [
  {
    id: "consumer",
    label: "Real consumer",
    hint: "Name the application, task, observed result, and date. Record actual use rather than intended adoption.",
  },
  {
    id: "keyboard",
    label: "Keyboard and behavior",
    hint: "Record keyboard paths, focus, disabled/loading/error states, and conflict or recovery results.",
  },
  {
    id: "assistive",
    label: "Assistive technology",
    hint: "Record manual screen-reader and other assistive-technology environments, tasks, results, and remaining gaps.",
  },
  {
    id: "appearance",
    label: "Responsive appearance",
    hint: "Record light/dark modes, narrow/wide reflow, enlarged text, text spacing, and both family compositions.",
  },
  {
    id: "compatibility",
    label: "Compatibility and regressions",
    hint: "Identify supported platforms, versions, browsers, package installation, and relevant regression results.",
  },
  {
    id: "migration",
    label: "Migration and support",
    hint: "Record API compatibility, upgrade steps or why none apply, remaining breaking changes, and support obligations.",
  },
];
export const reviewOutcomes = [
  { value: "not-reviewed", label: "Not reviewed" },
  { value: "needs-work", label: "Needs work" },
  { value: "passed", label: "Passed" },
];
export function blankReview() {
  return reviewAreas.map(({ id }) => ({
    id,
    outcome: "not-reviewed",
    notes: "",
  }));
}
export function validateReview(checks) {
  const errors = {};
  if (!Array.isArray(checks) || checks.length !== reviewAreas.length)
    return {
      checks: "Provide exactly one outcome for each of the six review areas.",
    };
  for (const area of reviewAreas) {
    const matches = checks.filter((check) => check?.id === area.id);
    const check = matches[0];
    if (
      matches.length !== 1 ||
      !reviewOutcomes.some((item) => item.value === check?.outcome)
    )
      errors[area.id] = `${area.label}: choose one supported outcome.`;
    else if (
      typeof check.notes !== "string" ||
      check.notes.length > 2000 ||
      (check.outcome !== "not-reviewed" && check.notes.trim().length < 20)
    )
      errors[area.id] =
        `${area.label}: record 20–2000 characters of observations for a pass or needs-work result; unreviewed notes may be blank.`;
  }
  return errors;
}
export function cleanReview(checks) {
  return reviewAreas.map(({ id }) => {
    const check = checks.find((item) => item.id === id);
    return { id, outcome: check.outcome, notes: check.notes.trim() };
  });
}
export function summarizeReview(checks) {
  return {
    passed: checks.filter((check) => check.outcome === "passed").length,
    needsWork: checks.filter((check) => check.outcome === "needs-work").length,
    unreviewed: checks.filter((check) => check.outcome === "not-reviewed")
      .length,
  };
}
