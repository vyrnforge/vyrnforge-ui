# Alert

Alert is persistent in-context feedback that remains available until the application resolves or dismisses it. It uses shared feedback paint, not a notification queue.

## When to use

Use a localized Alert for contextual information, success, warnings, errors or critical conditions. Use field-specific feedback for field recovery, a Banner for broad persistent information and Toast only for supplemental transient feedback. Use Dialog or AlertDialog when a decision genuinely owns focus.

## Appearance and composition

Five semantic severities are supported: informational, success, warning, error and critical. Error and critical use the same danger paint, so explicitly identify the meaning in text. Subtle and outlined are the approved default variants. An optional decorative icon, heading, authored actions and named dismiss control compose around the message. Actions remain outside the live region.

## Announcement and dismissal

The default is ordinary readable content with no live-region role. Explicit polite announcement maps to role=status; assertive maps to role=alert only for genuine urgency. Severity never determines announcement policy. Render a persistent empty live region before inserting dynamic content when announcement reliability is needed; initial server content may not be announced. Keep live content noninteractive, and place interactive recovery actions alongside it. Application owns lifetime, dismissal, focus recovery and notification history. No automatic dismissal or focus movement.

## Native Web

Load `@vyrnforge/web/styles/alert.css`. Use the shared severity attribute and `data-vf-alert` hooks with native elements. Use the canonical Button and named native button for dismissal. Author the relevant live-region role on the message only. Forced colors uses system paint and the readable message remains available.
