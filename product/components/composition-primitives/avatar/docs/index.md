# Avatar

Avatar represents one person or entity with an image, initials or icon. AvatarGroup collects multiple identities with an optional visible limit and overflow count. Both are noninteractive and use shared design tokens.

## When to use

Use Avatar for profile summaries, contributor lists, account headers and compact identity previews. Use AvatarGroup when multiple identities should read as one named collection with controlled density. Avatar and its group do not implement interaction, profile management, presence, or identity services.

## Image and initials

An authored **name** provides the Avatar's accessible identity. A provided **src** or **srcSet** selects a decorative native image within the labeled host. Without an image, the Avatar displays short initials. In React a native image error removes the failed image, leaving fallback content; a changed source or source candidates are retried. `initials` overrides default two-letter first/last-segment derivation, which is only a convenience, not a locale-aware naming policy.

## Appearances and fallback

Avatar presents image, letter or icon content with the same accessible identity, shapes and sizes. Letter content uses authored or derived initials; icon content reuses the existing Icon artwork rather than introducing a separate avatar glyph system. When an image is missing or fails, the representation falls back to letters or an authored icon. Without icon artwork, initials remain a safe fallback. Changing the visual fallback must not change the accessible identity.

## Sizes and appearance

Size options remain `sm`, `md` (default) and `lg`, using existing control-height tokens rather than arbitrary pixel values. **shape** is `rounded` (a circle; default) or `square` (zero corner radius). Images crop using `object-fit: cover`, and icons stay centered with sizing from the Avatar footprint. Color and contrast use shared surface/text tokens. Size and shape are independent of appearance, and the host retains its dimensions while loading or failing.

## Grouped avatars and totals

AvatarGroup renders a labeled native `ul` containing individual `li` members; each Avatar retains its own accessible identity. React **limit** is the maximum number of supplied Avatar children shown, while **total** is the known membership count, including identities not supplied as children. If total exceeds visible count, a final non-interactive **+N** Avatar appears. For example, five children, `limit={3}` and `total={12}` show three members followed by +9. Without total, all supplied children count. Without limit, all supplied children show; +N still accounts for additional known members. Invalid or negative totals/limits cannot produce a negative remainder. Use a localized **formatOverflow** callback for a meaningful accessible name, such as `(count) => count + ' more reviewers'`; without one the +N literal is announced without hidden English assumptions. Do not use this truncated presentation to hide members who require interactive discovery or access.

## Group spacing

AvatarGroup **spacing** is `overlap` (default), `none`, `sm`, `md`, or `lg`. Overlap is a small logical inline overlap with a themed separating outline. None abuts peers without negative margins; sm, md and lg give progressively larger positive token gaps. Spacing follows logical inline direction, including RTL. Group `size` and `shape` supply defaults to children that have not authored their own and apply to +N; explicit child values win.

## Native Web markup

Import `@vyrnforge/web/styles/avatar.css`. For icons also import `@vyrnforge/web/styles/icon.css` and use the canonical Icon SVG presentation hooks.

```html
<span data-vf-avatar data-vf-avatar-size="md" data-vf-avatar-shape="rounded" role="img" aria-label="Ada Lovelace">
  <span data-vf-avatar-initials aria-hidden="true">AL</span>
  <img data-vf-avatar-image src="/images/ada.webp" alt="" loading="lazy">
</span>

<ul data-vf-avatar-group data-vf-avatar-group-spacing="overlap" role="list" aria-label="Review team">
  <li data-vf-avatar-group-item>
    <span data-vf-avatar role="img" aria-label="Ada Lovelace"><span data-vf-avatar-initials aria-hidden="true">AL</span></span>
  </li>
  <li data-vf-avatar-group-item>
    <span data-vf-avatar data-vf-avatar-overflow role="img" aria-label="9 more reviewers"><span data-vf-avatar-initials aria-hidden="true">+9</span></span>
  </li>
</ul>
```

Native consumers author or update the member list, overflow total and failed-image removal themselves; CSS alone does not know population counts or network errors.

## Accessibility

Each Avatar host is `role="img"` with the authored name as its only accessible identity; its native `img alt=""`, visible initials and icon SVG are decorative. When adjacent visible name text already supplies identity, `decorative` removes the redundant image role and sets `aria-hidden` on the host. AvatarGroup is an authored-label list, preserving individual names and a localized surplus count without advertising a nonexistent expand button. Neither component owns tab stops, focus handling, selection, keyboard controls, or status semantics. Do not place interactive descendants within the decorative icon slot. Verify list semantics in Safari/VoiceOver, forced-colors, enlarged text, RTL, image failures and screen-reader name counts in a real consumer.

## When not to use

Use Image for general-purpose illustrations/photos, Icon for standalone SVG meaning, and Link/Button for interactive identity actions. Avatar does not fetch identity data, upload or crop images, provide a menu, imply presence, or supply badge overlays. Badge and Avatar-with-Badge integration are deferred until the Badge contract is established; do not invent badge primitives inside Avatar.

## Framework consumption

Native Web, React, Angular, Vue and Elements use shared concepts and canonical CSS, but only the actual React Avatar/AvatarGroup public component APIs are implemented here. Other framework surfaces can use the native CSS/HTML recipe without implying corresponding wrapper APIs exist. React exposes `@vyrnforge/react/avatar` with local image-error handling, visible limit/counting and typed native refs. No mandatory cross-framework runtime, new Core helper, or global state is required.
