# AlertDialog

AlertDialog reuses the native Dialog contract for a required decision or high-risk acknowledgement.

## When to use

Use it for a decision with meaningful consequences that genuinely requires focus. Explain the target, impact and recovery path. Do not use it for routine success, progress or ordinary warnings.

## Behavior and accessibility

The root has alertdialog semantics and backdrop dismissal is disabled. Provide an explicit title and description relationship; for destructive decisions, put the safe Cancel first and focus it initially. Escape and close-control requests follow the Dialog contract. Keep the committed open state authoritative.

## Action boundary

The action part is a native close-control intent, not an application commit. For an asynchronous or rejected commit, prevent default on the action, keep the dialog open and close it only after the owner confirms the intended result. Use consequence-specific action labels, not generic OK. Focus restoration follows Dialog; the consumer provides a meaningful fallback if the original trigger disappears.

## Surface anatomy

Optional header, body and footer regions organize authored content and actions. In Native Web use the shared `data-vf-dialog-header`, `data-vf-dialog-body` and `data-vf-dialog-footer` hooks; `data-vf-divider` adds a boundary to header or footer. Flat compositions remain supported. Structured direct children allow the body to scroll while actions remain available; very short surfaces may scroll as a whole. Regions add no dismissal or decision policy.
