import type { VyrnForgeElementForTagName } from "@vyrnforge/ui-elements";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ElementProps<TElement extends HTMLElement> = DetailedHTMLProps<
  HTMLAttributes<TElement>,
  TElement
>;

type CanonicalTextControlProps<TElement extends HTMLElement> =
  ElementProps<TElement> & {
    autocomplete?: string;
    disabled?: boolean;
    inputMode?: string;
    invalid?: boolean;
    label?: string;
    max?: number | string;
    min?: number | string;
    mode?: "decimal" | "integer";
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
    size?: "sm" | "md" | "lg";
    step?: number | string;
    value?: string;
  };

type CanonicalChoiceControlProps<TElement extends HTMLElement> =
  ElementProps<TElement> & {
    checked?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    readOnly?: boolean;
    required?: boolean;
    size?: "sm" | "md" | "lg";
    value?: string;
  };

type CanonicalSliderProps<TElement extends HTMLElement> =
  ElementProps<TElement> & {
    disabled?: boolean;
    label?: string;
    max?: number;
    min?: number;
    required?: boolean;
    step?: number;
    value?: number;
  };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "vf-button": ElementProps<VyrnForgeElementForTagName<"vf-button">>;
      "vf-icon-button": ElementProps<
        VyrnForgeElementForTagName<"vf-icon-button">
      >;
      "vf-text-input": CanonicalTextControlProps<
        VyrnForgeElementForTagName<"vf-text-input">
      >;
      "vf-textarea": CanonicalTextControlProps<
        VyrnForgeElementForTagName<"vf-textarea">
      >;
      "vf-search-input": CanonicalTextControlProps<
        VyrnForgeElementForTagName<"vf-search-input">
      >;
      "vf-number-input": CanonicalTextControlProps<
        VyrnForgeElementForTagName<"vf-number-input">
      >;
      "vf-date-input": CanonicalTextControlProps<
        VyrnForgeElementForTagName<"vf-date-input">
      >;
      "vf-datetime-input": CanonicalTextControlProps<
        VyrnForgeElementForTagName<"vf-datetime-input">
      >;
      "vf-checkbox": CanonicalChoiceControlProps<
        VyrnForgeElementForTagName<"vf-checkbox">
      >;
      "vf-radio": CanonicalChoiceControlProps<
        VyrnForgeElementForTagName<"vf-radio">
      >;
      "vf-switch": CanonicalChoiceControlProps<
        VyrnForgeElementForTagName<"vf-switch">
      >;
      "vf-slider": CanonicalSliderProps<
        VyrnForgeElementForTagName<"vf-slider">
      >;
    }
  }
}
