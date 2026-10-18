export function joinClassNames(
  ...classNames: Array<string | undefined | false | null>
) {
  return classNames.filter(Boolean).join(" ");
}
