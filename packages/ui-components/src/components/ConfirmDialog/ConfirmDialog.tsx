import { Button } from "../Button";
import { Dialog } from "../Dialog";
import type { ConfirmDialogProps } from "./ConfirmDialog.types";

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
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
    if (loading) {
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
          <Button disabled={loading} onClick={handleCancel} variant="subtle">
            {cancelLabel}
          </Button>
          <Button
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
