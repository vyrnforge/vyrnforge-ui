import { Button } from "../Button";
import type { ToastActionProps } from "./Toast.types";

export function ToastAction({
  altText,
  children,
  disabled,
  onClick
}: ToastActionProps) {
  return (
    <Button
      aria-label={altText}
      disabled={disabled}
      onClick={onClick}
      size="sm"
      variant="subtle"
    >
      {children}
    </Button>
  );
}
