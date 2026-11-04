# Theme Toggle

Use Theme Toggle for a compact binary choice between explicit light and dark appearance. Use the generic Switch for arbitrary boolean settings, and use a broader settings control when the product must expose a third `system` preference.

The default VyrnForge presentation uses one horizontal serpentine dragon geometry traced from the approved toggle-scale artwork. The production SVG keeps the recognizable head, horn and mane silhouette, whisker loop, foreclaw, neck mass, and long tail sweep from that approved composition. Light and dark use the exact same path data; dark mode changes the palette and mirrors the same SVG around the moving orb rather than drawing a second dragon or morphing path data.

## When to use

- Use Theme Toggle when light and dark are the only user-facing choices in the current surface.
- Use it in compact application chrome such as a header or toolbar where the VyrnForge dragon treatment reinforces brand identity without replacing semantics.
- Use a generic Switch when the setting is not specifically about appearance.
- Use a separate three-option control when `light`, `dark`, and `system` must all remain directly selectable.

## Native baseline

Theme Toggle uses an `input[type="checkbox"]` with `role="switch"`. Add `data-vf-theme-toggle-control` to the checkbox and place the documented decorative track beside it inside a `data-vf-theme-toggle` label.

Unchecked means light theme. Checked means dark theme. The browser owns checked state, focus, pointer activation, Space activation, disabled behavior, and form participation.

## Anatomy

Preferred presentation hooks are `data-vf-theme-toggle`, `data-vf-theme-toggle-control`, `data-vf-theme-toggle-track`, `data-vf-theme-toggle-breath`, `data-vf-theme-toggle-dragon`, `data-vf-theme-toggle-thumb`, and `data-vf-theme-toggle-ember`.

The track, orbit accent, dragon, and orb decoration are decorative. Keep them `aria-hidden="true"` through the track container. The checkbox remains the only interactive target.

The preferred Native example uses a 402×200 inline SVG inside `data-vf-theme-toggle-dragon`. Its eleven paths are the production trace used by the docs AppShell and component showcase. Two primary silhouette paths carry the head/mane and tail sweep, with stable secondary, gold, highlight, whisker, eye, and face-line paths layered above them. The same path geometry is reused in both themes.

An empty `data-vf-theme-toggle-dragon` span remains render-compatible through a simplified CSS silhouette so existing markup does not disappear. New VyrnForge-authored examples should use the vector artwork.

Earlier Theme Toggle markup used `data-vf-theme-toggle-clouds`, `data-vf-theme-toggle-stars`, `data-vf-theme-toggle-sun`, and `data-vf-theme-toggle-moon`. The Web stylesheet continues to accept those hooks as compatibility aliases. The previous moon hook has no visual role in the current dragon treatment.

## Visual story

In light mode, the orb rests at inline-start with the approved ivory/gold dragon composition wrapped around it and the long tail sweeping toward inline-end. The track uses a restrained forge-light field.

When dark mode is selected, the orb moves toward inline-end while the exact same SVG turns around its Y axis so the head remains wrapped around the orb on the opposite side. During that turn the path palette changes from ivory/gold to lavender/deep violet, the orb becomes a violet moon with a crescent mark, and the dark track atmosphere fades in.

Returning to light reverses the same movement and palette transition. No path morph is required and no additional semantic state is introduced. There are still only two values: unchecked/light and checked/dark.

## State and application integration

The component does not set `data-vf-theme`, write storage, watch `prefers-color-scheme`, or introduce a theme runtime. The consuming application maps the checkbox's `checked` state to its own explicit light or dark theme policy.

If an application previously stored a `system` preference, resolve that application policy before synchronizing this binary control. Do not invent a third visual switch state.

## Interaction and focus

Pointer and keyboard activation come from the native checkbox. Do not recreate Space handling with custom key listeners.

The orb and dragon move toward inline-end when checked and toward inline-start when unchecked. Direction is mirrored in right-to-left documents.

## Accessibility

Provide a localizable accessible name that describes the setting, for example `aria-label="Dark theme"` or an associated visible label. Checked state then communicates whether dark theme is on or off.

The dragon is not the only indication of state: the orb changes position and native checked semantics remain authoritative. Forced-colors mode removes decorative dragon/orbit scenery while retaining checked semantics, thumb position, system colors, and focus indication.

## Motion

The state commits immediately; application correctness never waits for the visual transition to finish.

The primary motion is the native thumb translation plus the dragon's Y-axis turn, supported by the existing orbit accent and palette transition. The SVG path data remains static for the whole interaction: no path morphing, alternate dark-mode drawing, per-scale animation, or frame-by-frame geometry is used.

When `prefers-reduced-motion: reduce` is active, the component removes transitions without changing behavior or state visibility. Light and dark remain distinguishable through settled thumb position and system-supported state presentation.

## Styling and tokens

Theme Toggle reuses the shared VyrnForge focus, border, disabled, and easing tokens. Its illustration colors and story timing remain private component implementation values because they are not shared design roles.

Private custom properties prefixed with `--_vf-` are implementation details and are not customization API. Do not promote illustration-specific values into global design tokens unless another reusable design role proves that need.
