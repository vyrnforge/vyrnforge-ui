export type ComponentApiMemberKind =
  | "property"
  | "event"
  | "slot"
  | "method";

export function componentApiMemberAnchor(
  kind: ComponentApiMemberKind,
  name: string,
) {
  return `api-${kind}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")}`;
}
