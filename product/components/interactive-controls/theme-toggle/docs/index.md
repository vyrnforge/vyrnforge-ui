# Theme Toggle

Use Theme Toggle for a compact binary choice between explicit light and dark appearance. Use the generic Switch for arbitrary boolean settings, and use a broader settings control when the product must expose a third `system` preference.

The default VyrnForge presentation now uses the canonical smooth circular dragon-orb SVG from `web/theme-toggle-dragon-orb.svg`. The dragon silhouette, cream inner accent, single sweeping crest, shaped almond eye with slit pupil, closed tapered muzzle, nostril, restrained mouth line, and orb are stable vector geometry. Light and dark reuse that exact geometry; theme changes are expressed through position, rotation, and palette rather than alternate drawings or path morphing.

## When to use

- Use Theme Toggle when light and dark are the only user-facing choices in the current surface.
- Use it in compact application chrome such as a header or toolbar where the VyrnForge dragon treatment reinforces brand identity without replacing semantics.
- Use a generic Switch when the setting is not specifically about appearance.
- Use a separate three-option control when `light`, `dark`, and `system` must all remain directly selectable.

## Native baseline

Theme Toggle uses an `input[type="checkbox"]` with `role="switch"`. Add `data-vf-theme-toggle-control` to the checkbox and place the documented decorative track beside it inside a `data-vf-theme-toggle` label.

Unchecked means light theme. Checked means dark theme. The browser owns checked state, focus, pointer activation, Space activation, disabled behavior, and form participation.

## Anatomy

Preferred presentation hooks are `data-vf-theme-toggle`, `data-vf-theme-toggle-control`, `data-vf-theme-toggle-track`, `data-vf-theme-toggle-dragon`, `data-vf-theme-toggle-thumb`, and `data-vf-theme-toggle-ember`.

The authored artwork is an inline copy of the canonical 650×740 SVG source. It contains one `data-vf-theme-toggle-dragon-mark` group with six paths: the solid outer silhouette, cream inner wing/body accent, compact slanted eye, slit pupil, one small filled nostril and a simple filled mouth line. One independent `data-vf-theme-toggle-orb` group keeps the two orb circles and highlight ellipse separate from the dragon. Browser evidence verifies that the live path data matches the canonical asset.

The artwork is decorative and remains inside the track's `aria-hidden="true"` subtree. The checkbox remains the only interactive target. The legacy thumb hook is retained as a forced-colors fallback and compatibility surface; in normal color modes the SVG orb is the visible thumb.

Earlier Theme Toggle markup used `data-vf-theme-toggle-clouds`, `data-vf-theme-toggle-stars`, `data-vf-theme-toggle-sun`, and `data-vf-theme-toggle-moon`. The Web stylesheet continues to accept those hooks as compatibility aliases where practical.

## Visual story

In light mode, the gold/cream dragon-orb emblem rests at inline-start on the warm track. A single swept-back horn and coherent closed snout replace the competing horns and zigzag lower jaw. The almond eye, filled nostril and subtle closed-mouth line are integrated into the head instead of floating as disconnected scratches. The body ring and orb remain unchanged.

When dark mode is selected, the entire emblem slides toward inline-end. During that travel the dragon ring performs one complete turn around the orb, the orb highlight rotates slightly, the dragon and orb palettes transition to violet, and the dark track atmosphere fades in. The settled dark geometry is the same orientation and path data as light mode.

Returning to light reverses the same motion. No SVG path data changes and no second dark-mode dragon is introduced.

## State and application integration

The component does not set `data-vf-theme`, write storage, watch `prefers-color-scheme`, or introduce a theme runtime. The consuming application maps the checkbox's `checked` state to its own explicit light or dark theme policy.

If an application previously stored a `system` preference, resolve that application policy before synchronizing this binary control. Do not invent a third visual switch state.

## Interaction and focus

Pointer and keyboard activation come from the native checkbox. Do not recreate Space handling with custom key listeners.

The artwork moves toward inline-end when checked and toward inline-start when unchecked. Right-to-left documents reverse that travel and reverse the decorative rotation direction.

## Accessibility

Provide a localizable accessible name that describes the setting, for example `aria-label="Dark theme"` or an associated visible label. Checked state communicates whether dark theme is on or off.

The dragon is not the only indication of state: the artwork changes position and native checked semantics remain authoritative. Forced-colors mode hides the decorative SVG and restores a system-colored thumb while retaining checked state, target size, and focus indication.

## Motion

The state commits immediately; application correctness never waits for the visual transition to finish.

The primary motion is a 680 ms emblem translation plus a full dragon-ring rotation around the fixed orb center. The orb receives a smaller rotation/scale treatment so its highlight participates without competing with the dragon. Palette and track transitions are secondary.

When `prefers-reduced-motion: reduce` is active, all artwork and track transitions are removed. The checked state remains visually distinct through the settled inline position and theme palette.

## Styling and tokens

Theme Toggle reuses shared VyrnForge focus, border, disabled, and standard easing tokens where they represent shared roles. The illustration palette, geometry sizing, and story timing remain private component implementation values.

Private custom properties prefixed with `--_vf-` are implementation details and are not customization API. Do not promote illustration-specific values into global design tokens unless another reusable design role proves that need.
