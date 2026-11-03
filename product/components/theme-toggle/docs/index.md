# Theme Toggle

Use Theme Toggle for a compact binary choice between explicit light and dark appearance. Use the generic Switch for arbitrary boolean settings, and use a broader settings control when the product must expose a third `system` preference.

The default VyrnForge presentation uses a small wyvern-and-ember story: light mode presents a glowing forge ember, switching to dark moves and collapses that ember toward a wyvern silhouette as though the light is consumed, and switching back releases the ember with a brief breath trail. The story is decorative; native checked state and thumb position remain the actual state cues.

## When to use

- Use Theme Toggle when light and dark are the only user-facing choices in the current surface.
- Use it in compact application chrome such as a header or toolbar where the VyrnForge dragon-and-ember treatment reinforces brand identity without replacing semantics.
- Use a generic Switch when the setting is not specifically about appearance.
- Use a separate three-option control when `light`, `dark`, and `system` must all remain directly selectable.

## Native baseline

Theme Toggle uses an `input[type="checkbox"]` with `role="switch"`. Add `data-vf-theme-toggle-control` to the checkbox and place the documented decorative track beside it inside a `data-vf-theme-toggle` label.

Unchecked means light theme. Checked means dark theme. The browser owns checked state, focus, pointer activation, Space activation, disabled behavior, and form participation.

## Anatomy

Preferred presentation hooks are `data-vf-theme-toggle`, `data-vf-theme-toggle-control`, `data-vf-theme-toggle-track`, `data-vf-theme-toggle-breath`, `data-vf-theme-toggle-dragon`, `data-vf-theme-toggle-thumb`, and `data-vf-theme-toggle-ember`.

The track, breath, dragon, and ember are decorative. Keep them `aria-hidden="true"` through the track container. The checkbox remains the only interactive target.

The preferred Native example nests the supplied decorative vector artwork inside `data-vf-theme-toggle-dragon`. That inline SVG gives the wyvern an actual profile with horns, brow, snout, open jaw, eye, and curved neck instead of relying on a coarse CSS polygon. The SVG is presentation anatomy, not an additional interactive element or semantic state. Keep it hidden from assistive technology and non-focusable.

The dragon-head silhouette is adapted from **Dragon Head** by **Lorc**, distributed by Game-icons.net under **CC BY 3.0**. VyrnForge mirrors, recolors, scales, and composes that silhouette with the component's own ember, breath, motion, state presentation, and accessibility behavior. See `ATTRIBUTION.md` beside this component for source and license details.

An empty `data-vf-theme-toggle-dragon` span remains render-compatible with the earlier CSS-only silhouette so existing markup does not disappear. New VyrnForge-authored examples should use the vector artwork so the intended brand treatment is visually legible at the control's real size.

Earlier Theme Toggle markup used `data-vf-theme-toggle-clouds`, `data-vf-theme-toggle-stars`, `data-vf-theme-toggle-sun`, and `data-vf-theme-toggle-moon`. The Web stylesheet continues to accept those hooks as compatibility aliases so existing markup does not lose its presentation, but new authoring should use the dragon-specific anatomy above. The previous moon hook has no visual role in the dragon treatment.

## Visual story

In light mode, the thumb carries a warm forge ember against a restrained bronze-and-amber field. The wyvern remains present only as a faint silhouette at the far side, so the control still reads as a toggle before it reads as an illustration.

When dark mode is selected, the thumb moves toward inline-end, the ember contracts toward the wyvern's mouth, the wyvern becomes fully visible, and the surrounding field settles into an obsidian night tone. Returning to light reverses the transition and briefly exposes the breath trail while the ember expands and returns toward inline-start.

The story must not introduce an additional semantic state. There are still only two values: unchecked/light and checked/dark.

## State and application integration

The component does not set `data-vf-theme`, write storage, watch `prefers-color-scheme`, or introduce a theme runtime. The consuming application maps the checkbox's `checked` state to its own explicit light or dark theme policy.

If an application previously stored a `system` preference, resolve that application policy before synchronizing this binary control. Do not invent a third visual switch state.

## Interaction and focus

Pointer and keyboard activation come from the native checkbox. Do not recreate Space handling with custom key listeners.

The visual thumb moves toward inline-end when checked and toward inline-start when unchecked. The component mirrors the movement and dragon orientation in right-to-left documents.

## Accessibility

Provide a localizable accessible name that describes the setting, for example `aria-label="Dark theme"` or an associated visible label. Checked state then communicates whether dark theme is on or off.

The dragon story is not the only indication of state: the thumb changes position and native checked semantics remain authoritative. Forced-colors mode removes decorative dragon, ember, and breath scenery while retaining checked semantics, thumb position, system colors, and focus indication.

## Motion

The default presentation uses deliberately slower component-owned story timing than ordinary hover or focus feedback so the consume/release sequence remains legible. The state itself commits immediately; application correctness never waits for the visual story to finish.

The ember and thumb travel form the primary motion. Dragon visibility, eye glow, track atmosphere, and the breath trail are secondary detail and should remain restrained rather than behaving like a game animation.

When `prefers-reduced-motion: reduce` is active, the component removes those transitions without changing behavior or state visibility. Light and dark remain distinguishable through settled thumb position and system-supported state presentation.

## Styling and tokens

Theme Toggle reuses the shared VyrnForge focus, border, disabled, and easing tokens. Its ember, dragon, breath, forge-light, and obsidian-night colors and story timing are private component implementation values because they are not shared design roles.

Private custom properties prefixed with `--_vf-` are implementation details and are not customization API. Do not promote illustration-specific values into global design tokens unless another reusable design role proves that need.
