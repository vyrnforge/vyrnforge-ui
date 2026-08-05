export type MaturityPresentationInput = {
  maturity?: unknown;
  evidence?: { status?: unknown } | unknown;
};

type BadgeVariant = "success" | "warning" | "danger" | "info";

function toLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getComponentMaturityPresentation(
  component: MaturityPresentationInput,
): { label: string; variant: BadgeVariant; verificationRequired: boolean } {
  const maturity = typeof component.maturity === "string" ? component.maturity : "unknown";
  const evidence =
    component.evidence && typeof component.evidence === "object"
      ? (component.evidence as { status?: unknown })
      : undefined;
  const verificationRequired =
    ["alpha-stable", "beta-stable", "stable"].includes(maturity) &&
    evidence?.status === "requires-verification";

  if (verificationRequired) {
    return {
      label:
        maturity === "stable"
          ? "Legacy stable — verification required"
          : `${toLabel(maturity)} — verification required`,
      variant: "warning",
      verificationRequired: true,
    };
  }

  if (maturity === "stable" || maturity === "beta-stable") {
    return { label: toLabel(maturity), variant: "success", verificationRequired: false };
  }

  if (maturity === "experimental" || maturity === "alpha-stable") {
    return { label: toLabel(maturity), variant: "warning", verificationRequired: false };
  }

  if (maturity === "deprecated") {
    return { label: toLabel(maturity), variant: "danger", verificationRequired: false };
  }

  return { label: toLabel(maturity), variant: "info", verificationRequired: false };
}
