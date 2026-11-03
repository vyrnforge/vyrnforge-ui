# Theme Toggle

Use Theme Toggle for a compact binary choice between explicit light and dark appearance. Use the generic Switch for arbitrary boolean settings, and use a broader settings control when the product must expose a third `system` preference.

## When to use

- Use Theme Toggle when light and dark are the only user-facing choices in the current surface.
- Use it in compact application chrome such as a header or toolbar where the day and night illustration improves recognition without replacing semantics.
- Use a generic Switch when the setting is not specifically about appearance.
- Use a separate three-option control when `light`, `dark`, and `system` must all remain directly selectable.

## Native baseline

Theme Toggle uses an `input[type="checkbox"]` with `role="switch"`. Add `data-vf-theme-toggle-control` to the checkbox and place the documented decorative track beside it inside a `data-vf-theme-toggle` label.

Unchecked means light theme. Checked means dark theme. The browser owns checked state, focus, pointer activation, Space activation, disabled behavior, and form participation.

## Anatomy

The public presentation hooks are `data-vf-theme-toggle`, `data-vf-theme-toggle-control`, `data-vf-theme-toggle-track`, `data-vf-theme-toggle-clouds`, `data-vf-theme-toggle-stars`, `data-vf-theme-toggle-thumb`, `data-vf-theme-toggle-sun`, and `data-vf-theme-toggle-moon`.

The track, clouds, stars, sun, and moon are decorative. Keep them `aria-hidden="true"` through the track container. The checkbox remains the only interactive target.

## State and application integration

The component does not set `data-vf-theme`, write storage, watch `prefers-color-scheme`, or introduce a theme runtime. The consuming application maps the checkbox's `checked` state to its own explicit light or dark theme policy.

If an application previously stored a `system` preference, resolve that application policy before synchronizing this binary control. Do not invent a third visual switch state.

## Interaction and focus

Pointer and keyboard activation come from the native checkbox. Do not recreate Space handling with custom key listeners.

The visual thumb moves toward inline-end when checked and toward inline-start when unchecked. The component mirrors that movement in right-to-left documents.

## Accessibility

Provide a localizable accessible name that describes the setting, for example `aria-label="Dark theme"` or an associated visible label. Checked state then communicates whether dark theme is on or off.

The light and dark states are not communicated by color alone: the thumb changes position and the sun/moon illustration changes with it. Forced-colors mode removes decorative scenery while retaining native checked semantics, thumb position, system colors, and focus indication.

## Motion

The default transition animates the thumb, sky, clouds, stars, sun, and moon with the shared VyrnForge control motion duration and easing. State changes commit immediately and never depend on animation completion.

When `prefers-reduced-motion: reduce` is active, the component removes those transitions without changing behavior or state visibility.

## Styling and tokens

Theme Toggle reuses the shared VyrnForge focus, border, disabled, and motion tokens. Its day-sky, night-sky, cloud, star, sun, and moon colors are private component implementation values because they are not shared design roles.

Private custom properties prefixed with `--_vf-` are implementation details and are not customization API. Do not promote illustration-specific values into global design tokens unless another reusable design role proves that need.
