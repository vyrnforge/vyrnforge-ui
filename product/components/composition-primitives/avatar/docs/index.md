# Avatar

A compact visual identity representation. Avatar can display a photograph or short text initials in the same circular shape. The initials provide a fallback when the image is unavailable, without becoming a second component.

## When to use

Use Avatar for people, accounts, teams or other identities in profile summaries, lists and headers. An Avatar is only a representation, not an account-management, upload or profile-image editing control.

## Image and initials

Provide a human-authored **name** for a meaningful accessible identity and an optional image **src**. Without an image, the Avatar shows initials. With a source, a native `img` visually covers the fallback after successful loading. The fallback remains rendered beneath the image for continuity. React removes the failed image when its native `error` event fires, revealing the initials; changing the source retries a different URL.

For convenience React derives two initials from the first and last whitespace-separated name segments, or one initial for a one-word name. This rule cannot represent every language or naming convention: author **initials** explicitly whenever a preferred or localized abbreviation differs. The library does not fetch avatars or decide image URL policies.

## Sizes and appearance

Size options are `sm`, `md` (default), and `lg`, using existing control height tokens rather than new sizing constants. A circle clips the native image to `object-fit: cover`. Initials use current text and surface tokens and remain legible under light, dark, system and forced-colors modes. The host keeps a stable square footprint during image loading and errors.

## Native Web markup

The styling contract uses a native labeled span, decorative fallback text, and a native image. Import `@vyrnforge/web/styles/avatar.css`.

```html
<span data-vf-avatar data-vf-avatar-size="md" role="img" aria-label="Ada Lovelace">
  <span data-vf-avatar-initials aria-hidden="true">AL</span>
  <img data-vf-avatar-image src="/images/ada.webp" alt="" loading="lazy">
</span>
```

Native Web can use the same fallback by listening for the native `error` event and removing or hiding the failed image. The shared CSS cannot detect remote image failure on its own. The React component handles this event automatically without a new Web runtime.

## Accessibility

The containing span has `role="img"` and the authored `name` as its accessible label. Its native image has `alt=""`, and initials are hidden from assistive technology, avoiding duplicate announcements. If a visible adjacent label already names the person, choose `decorative` in React or `aria-hidden="true"` on the Native Web host. The component is never an interactive control, has no keyboard handling, does not manage focus and does not assert identity verification or status.

## When not to use

Use the Image primitive for ordinary photographs and illustrations without an identity fallback. Use a Link or Button to own avatar-click interaction, and the Loading Pattern for skeleton placeholders. Avatar does not implement cropping, media selection, uploads, presence, group stacks, backend identity or asset caching. The old AvatarFallback elemental candidate remains retired as a separate product.

## Framework consumption

Native Web, Angular, Vue and Elements can use the shared styling hooks with native elements. React offers one typed component at `@vyrnforge/react/avatar`, using the same CSS and DOM semantics. Image-error fallback is part of the React convenience behavior; native consumers attach their own event handling.
