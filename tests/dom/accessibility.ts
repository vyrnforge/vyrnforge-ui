import axe from "axe-core";

export type AccessibilityTarget = Element | Document;

function formatViolation(violation: axe.Result) {
  const nodes = violation.nodes.map((node) => {
    const target = node.target.join(" > ");
    const summary =
      node.failureSummary?.replace(/\s+/g, " ").trim() ?? node.html;

    return `  - ${target}: ${summary}`;
  });

  return [
    `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help}`,
    violation.helpUrl,
    ...nodes,
  ].join("\n");
}

export function formatAccessibilityViolations(violations: axe.Result[]) {
  return [
    "Accessibility violations found:",
    ...violations.map(formatViolation),
  ].join("\n\n");
}

export function runAccessibilityCheck(
  target: AccessibilityTarget,
  options?: axe.RunOptions,
): Promise<axe.AxeResults> {
  return options ? axe.run(target, options) : axe.run(target);
}

export async function assertNoAccessibilityViolations(
  target: AccessibilityTarget,
  options?: axe.RunOptions,
) {
  const results = await runAccessibilityCheck(target, options);

  if (results.violations.length > 0) {
    throw new Error(formatAccessibilityViolations(results.violations));
  }
}
