import type { ReactNode } from "react";

export type ConfirmDialogVariant = "default" | "danger";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};
