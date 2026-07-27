import { useConfirmDialogBehavior } from "../../internal/behaviors";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import type { ConfirmDialogProps } from "./ConfirmDialog.types";

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  disabled = false,
  description,
  loading = false,
  onCancel,
  onConfirm,
  onOpenChange,
  open,
  title,
  variant = "default",
}: ConfirmDialogProps) {
  const behavior = useConfirmDialogBehavior({
    disabled,
    loading,
    onCancel,
    onConfirm,
    onOpenChange,
    open,
  });

  return (
    <Dialog
      className="vf-confirm-dialog"
      closeOnEscape={!loading}
      closeOnOverlayClick={!loading}
      description={description}
      footer={
        <div className="vf-confirm-dialog__actions">
          <Button
            disabled={!behavior.canCancel}
            onClick={behavior.cancel}
            variant="subtle"
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={!behavior.canConfirm}
            loading={loading}
            onClick={behavior.confirm}
            variant={variant === "danger" ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
        </div>
      }
      onOpenChange={behavior.setOpen}
      open={open}
      size="sm"
      title={title}
    />
  );
}
