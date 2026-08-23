import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export type CanonicalNamedContent = Readonly<Record<string, ReactNode>>;

export function mapNamedContentToCanonicalSlots(
  namedContent: CanonicalNamedContent,
): ReactNode[] {
  return Object.entries(namedContent).flatMap(([slot, content]) => {
    if (content === null || content === undefined || content === false) return [];

    if (isValidElement(content)) {
      return [
        cloneElement(content as ReactElement<Record<string, unknown>>, {
          slot,
        }),
      ];
    }

    return [<span slot={slot}>{content}</span>];
  });
}

export function composeCanonicalChildren(
  children: ReactNode,
  namedContent: CanonicalNamedContent = {},
): ReactNode {
  return (
    <>
      {mapNamedContentToCanonicalSlots(namedContent)}
      {children}
    </>
  );
}
