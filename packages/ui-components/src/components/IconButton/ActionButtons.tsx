import { Icon } from "../Icon";
import { IconButton } from "./IconButton";
import type { ActionIconButtonProps } from "./IconButton.types";

export function CloseButton({
  "aria-label": ariaLabel = "Close",
  ...props
}: ActionIconButtonProps) {
  return (
    <IconButton aria-label={ariaLabel} tooltip={ariaLabel} variant="ghost" {...props}>
      <Icon name="Close" />
    </IconButton>
  );
}

export function ClearButton({
  "aria-label": ariaLabel = "Clear",
  ...props
}: ActionIconButtonProps) {
  return (
    <IconButton aria-label={ariaLabel} tooltip={ariaLabel} variant="ghost" {...props}>
      <Icon name="Close" />
    </IconButton>
  );
}

export function RefreshButton({
  "aria-label": ariaLabel = "Refresh",
  ...props
}: ActionIconButtonProps) {
  return (
    <IconButton aria-label={ariaLabel} tooltip={ariaLabel} variant="subtle" {...props}>
      <Icon name="Refresh" />
    </IconButton>
  );
}

export function MoreButton({
  "aria-label": ariaLabel = "More actions",
  ...props
}: ActionIconButtonProps) {
  return (
    <IconButton aria-label={ariaLabel} tooltip={ariaLabel} variant="ghost" {...props}>
      <Icon name="MoreHorizontal" />
    </IconButton>
  );
}
