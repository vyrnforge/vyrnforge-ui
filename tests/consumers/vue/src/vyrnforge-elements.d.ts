import type {
  VyrnForgeActionDetail,
  VyrnForgeElementForTagName,
  VyrnForgeValueChangeDetail,
} from "@vyrnforge/ui-elements";
import type { EmitFn, HTMLAttributes, PublicProps } from "vue";

type EventMap = Record<string, Event>;

type VueEmit<TEvents extends EventMap> = EmitFn<{
  [TName in keyof TEvents]: (event: TEvents[TName]) => void;
}>;

type VyrnForgeVueCustomElement<
  TElement extends HTMLElement,
  TAttributes extends keyof TElement,
  TEvents extends EventMap = {},
> = new () => TElement & {
  /** @deprecated Template typing contract only; not present on DOM refs. */
  readonly $props: HTMLAttributes &
    Partial<Pick<TElement, TAttributes>> &
    PublicProps;
  /** @deprecated Template typing contract only; not present on DOM refs. */
  readonly $emit: VueEmit<TEvents>;
};

type ButtonElement = VyrnForgeElementForTagName<"vf-button">;
type PageHeaderElement = VyrnForgeElementForTagName<"vf-page-header">;
type TabsElement = VyrnForgeElementForTagName<"vf-tabs">;
type TextInputElement = VyrnForgeElementForTagName<"vf-text-input">;

type ActionEvents = {
  "vf-action": CustomEvent<VyrnForgeActionDetail>;
};

type ValueEvents = {
  "vf-value-change": CustomEvent<VyrnForgeValueChangeDetail<string>>;
};

declare module "vue" {
  interface GlobalComponents {
    "vf-button": VyrnForgeVueCustomElement<
      ButtonElement,
      "action" | "disabled" | "loading" | "type" | "value" | "variant",
      ActionEvents
    >;
    "vf-page-header": VyrnForgeVueCustomElement<
      PageHeaderElement,
      "description" | "eyebrow" | "title"
    >;
    "vf-tabs": VyrnForgeVueCustomElement<
      TabsElement,
      "activationMode" | "items" | "size" | "value" | "variant"
    >;
    "vf-text-input": VyrnForgeVueCustomElement<
      TextInputElement,
      | "autocomplete"
      | "disabled"
      | "invalid"
      | "name"
      | "placeholder"
      | "readOnly"
      | "required"
      | "size"
      | "value",
      ValueEvents
    >;
  }
}

declare module "@vue/runtime-dom" {
  interface HTMLAttributes {
    slot?: string;
    [name: `data-${string}`]: unknown;
  }
}
