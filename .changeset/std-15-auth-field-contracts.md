---
"@vyrnforge/react": major
"@vyrnforge/angular": major
"@vyrnforge/vue": major
"@vyrnforge/elements": major
---

Require consumer-authored PasswordField visibility labels and OTPField accessible names, and align OTP paste, multi-character one-time-code input, focus progression, and empty-Backspace assistance across React, Angular, Vue, and Elements.

Consumers that relied on synthesized English visibility, group, or cell labels must supply localized labels. OTP consumers should author the root and every cell name explicitly. The change is limited to UI interaction and accessibility behavior; authentication verification, code delivery, expiry, resend, retry, session, and provider policy remain application/provider-owned.
