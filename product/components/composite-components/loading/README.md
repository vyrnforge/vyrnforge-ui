# Loading

Loading is the VyrnForge Feedback & Status family for pending work. It provides reusable visual treatments without owning the application operation that caused them.

Canonical behavior and selection guidance lives in **VyrnForge — Loading Component Contract** and **VyrnForge — Async Operations & Recovery Patterns**. Native Web presentation is exposed from `@vyrnforge/web/styles/loading.css`.

Built-in presentations include compact indeterminate indicators (`spinner`, `dots`, `bars`, and `pulse`), structured placeholders, and native `<progress>` styling. Consumer-authored custom loading artwork is first-class through `data-vf-loading-custom`.

Loading deliberately does not become an async runtime. Applications own request/job lifecycle, progress data, cancellation, retry, completion, failure, and status text. Existing Surface/Layout/AspectRatio/Icon/Text responsibilities remain composed rather than duplicated.

The former standalone Skeleton product unit is superseded. Structured skeleton presentation now belongs to Loading through `data-vf-loading-placeholder`.
