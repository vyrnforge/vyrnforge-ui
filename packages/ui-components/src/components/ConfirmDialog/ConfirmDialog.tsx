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
  variant = "default"
}: ConfirmDialogProps) {
  const handleCancel = () => {
    if (loading || disabled) {
      return;
    }

    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog
      className="dv-confirm-dialog"
      closeOnEscape={!loading}
      closeOnOverlayClick={!loading}
      description={description}
      footer={
        <div className="dv-confirm-dialog__actions">
          <Button disabled={loading || disabled} onClick={handleCancel} variant="subtle">
            {cancelLabel}
          </Button>
          <Button
            disabled={disabled}
            loading={loading}
            onClick={onConfirm}
            variant={variant === "danger" ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
        </div>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title={title}
    />
  );
}
