# Skeleton

Skeleton is the standalone Layer 1 decorative loading-placeholder primitive. Use it when pending content has a sufficiently predictable structure and placeholder geometry helps preserve spatial context.

Canonical semantics and accessibility requirements are governed by **VyrnForge — Skeleton Component Contract** and **VyrnForge — Async Operations & Recovery Patterns**. Native Web presentation is exposed from `@vyrnforge/web/styles/skeleton.css`.

The public Native Web contract is `data-vf-skeleton` plus the optional `data-vf-skeleton-shape="block" | "line" | "circle"` geometry axis. The default is `block`. Consumer layout owns actual dimensions.

Skeleton remains decorative. Authors provide `aria-hidden="true"` on placeholder shapes and separately communicate meaningful loading state through the owning region/status semantics. This unit introduces no custom keyboard model, async state machine, framework wrapper, or Core runtime dependency.
