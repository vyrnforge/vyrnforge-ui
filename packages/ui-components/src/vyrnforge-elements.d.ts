import type { VyrnForgeElementForTagName } from "@vyrnforge/ui-elements";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ElementProps<TElement extends HTMLElement> = DetailedHTMLProps<
  HTMLAttributes<TElement>,
  TElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "vf-button": ElementProps<VyrnForgeElementForTagName<"vf-button">>;
      "vf-icon-button": ElementProps<
        VyrnForgeElementForTagName<"vf-icon-button">
      >;
    }
  }
}
