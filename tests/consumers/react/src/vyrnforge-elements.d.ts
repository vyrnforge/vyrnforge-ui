import type {
  VyrnForgeElementForTagName,
  VyrnForgeTabItem,
} from "@vyrnforge/ui-elements";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ButtonElement = VyrnForgeElementForTagName<"vf-button">;
type DialogElement = VyrnForgeElementForTagName<"vf-dialog">;
type InlineMessageElement = VyrnForgeElementForTagName<"vf-inline-message">;
type TabsElement = VyrnForgeElementForTagName<"vf-tabs">;
type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

type ElementProps<TElement extends HTMLElement> = DetailedHTMLProps<
  HTMLAttributes<TElement>,
  TElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "vf-button": ElementProps<ButtonElement> & {
        action?: string;
        disabled?: boolean;
        loading?: boolean;
        type?: "button" | "reset" | "submit";
        value?: string;
        variant?: ButtonElement["variant"];
      };
      "vf-dialog": ElementProps<DialogElement> & {
        description?: string;
        disabled?: boolean;
        open?: boolean;
        title?: string;
      };
      "vf-inline-message": ElementProps<InlineMessageElement> & {
        title?: string;
        variant?: InlineMessageElement["variant"];
      };
      "vf-tabs": ElementProps<TabsElement> & {
        activeId?: string;
        items?: readonly VyrnForgeTabItem[];
        orientation?: "horizontal" | "vertical";
      };
      "vf-text-input": ElementProps<TextInputElement> & {
        disabled?: boolean;
        label?: string;
        name?: string;
        required?: boolean;
        value?: string;
      };
    }
  }
}