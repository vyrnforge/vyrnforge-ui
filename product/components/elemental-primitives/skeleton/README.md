# Skeleton

Skeleton is the standalone Layer 1 decorative loading-placeholder primitive. Use it when pending content has a sufficiently predictable structure and placeholder paint helps preserve spatial context.

Canonical semantics and accessibility requirements are governed by **VyrnForge — Skeleton Component Contract** and **VyrnForge — Async Operations & Recovery Patterns**. Native Web presentation is exposed from `@vyrnforge/web/styles/skeleton.css`.

The public Native Web contract is `data-vf-skeleton` plus the optional `data-vf-skeleton-shape="block" | "line" | "circle"` visual axis. The default is `block`.

Skeleton deliberately does not duplicate existing composition responsibilities:

- shared loading cadence/keyframes come from `@vyrnforge/web/styles/loading-motion.css`;
- Stack, Inline, and Grid own spatial composition;
- AspectRatio owns stable square/media ratios;
- Surface may preserve a real pending containment boundary when the eventual UI has one;
- consumer layout owns actual dimensions.

A circular Skeleton therefore supplies the circular visual mask, while equal-aspect geometry should compose with AspectRatio (or ordinary authored layout) rather than being owned by Skeleton itself.

Skeleton remains decorative. Authors provide `aria-hidden="true"` on placeholder shapes and separately communicate meaningful loading state through the owning region/status semantics. This unit introduces no custom keyboard model, async state machine, framework wrapper, or Core runtime dependency.
