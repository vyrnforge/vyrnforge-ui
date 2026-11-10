# Loading

Loading is the VyrnForge Feedback & Status family for pending work. It provides reusable visual treatments without owning the application operation that caused them.

Canonical behavior and selection guidance lives in **VyrnForge — Loading Component Contract** and **VyrnForge — Async Operations & Recovery Patterns**. Native Web presentation is exposed from `@vyrnforge/web/styles/loading.css`.

Built-in presentations include compact indeterminate indicators (`spinner`, `dots`, `bars`, and `pulse`), structured placeholders, and native `<progress>` styling. Consumer-authored custom loading artwork is first-class through `data-vf-loading-custom`.

Loading presentation is customizable through documented CSS variables. Consumers can tune shared or per-presentation color, indicator size, spinner thickness/track, motion duration, placeholder paint/radius, progress fill/track/height/radius, and custom-artwork color without creating new semantic variants.

Loading deliberately does not become an async runtime. Applications own request/job lifecycle, progress data, cancellation, retry, completion, failure, and status text. Existing Surface/Layout/AspectRatio/Icon/Text responsibilities remain composed rather than duplicated.

The former standalone Skeleton product unit is superseded. Structured skeleton presentation now belongs to Loading through `data-vf-loading-placeholder`.
