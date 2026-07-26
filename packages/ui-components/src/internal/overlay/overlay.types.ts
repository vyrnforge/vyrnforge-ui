import type {
  OverlayDismissReason,
  OverlayPlacement,
  OverlayResolvedPosition,
} from "@vyrnforge/ui-behaviors";
import type { CSSProperties, ReactNode, RefObject } from "react";

export type { OverlayPlacement } from "@vyrnforge/ui-behaviors";

export type AnchoredPositionOptions = {
  anchor: HTMLElement | null;
  floating: HTMLElement | null;
  placement?: OverlayPlacement;
  offset?: number;
  viewportPadding?: number;
  matchAnchorWidth?: boolean;
  flip?: boolean;
  shift?: boolean;
};

export type AnchoredPosition = OverlayResolvedPosition & {
  strategy: "fixed";
  ready: boolean;
  update: () => void;
};

export type PortalProps = {
  children: ReactNode;
  container?: Element | null;
  disabled?: boolean;
};

export type DismissableLayerProps = {
  children: ReactNode;
  enabled?: boolean;
  dismissOnEscape?: boolean;
  dismissOnOutsidePointer?: boolean;
  dismissOnOutsideFocus?: boolean;
  onDismiss?: (reason: OverlayDismissReason) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onOutsidePointerDown?: (event: PointerEvent) => void;
  onLayerChange?: (element: HTMLDivElement | null) => void;
  branches?: Array<RefObject<HTMLElement | null>>;
  className?: string;
  style?: CSSProperties;
};

export type FocusScopeProps = {
  children: ReactNode;
  trapped?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  autoFocus?: boolean;
  onMountAutoFocus?: (event: Event) => void;
  onUnmountAutoFocus?: (event: Event) => void;
};
