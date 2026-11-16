# AppShell

AppShell composes an application header, body, optional navigation rail, main workspace and optional footer. It provides shared layout, not routing, application state, authentication or a navigation controller.

## Native Web

Load `@vyrnforge/web/styles/app-shell.css`. Use semantic HTML and the public region hooks. The main region remains a real `main` landmark.

```html
<div data-vf-app-shell>
  <header data-vf-app-shell-header>Workspace</header>
  <div data-vf-app-shell-body>
    <main data-vf-app-shell-main>
      <h1>Overview</h1>
    </main>
  </div>
</div>
```

The shell and body fill available inline space by default. The body uses one flexible column when navigation is omitted. To opt into a persistent rail, place an `aside data-vf-app-shell-navigation` directly inside the body before the main region, containing a named `nav` with authored links.

For a route or composition that does not need the rail, omit/remove that region or put the ordinary HTML `hidden` attribute on the navigation region itself. Remove `hidden` to restore the rail. The shared CSS releases the track for ordinary hidden navigation; no JavaScript layout controller is required. Hiding only a descendant, `aria-hidden`, `visibility: hidden`, arbitrary CSS `display: none` or `hidden="until-found"` is not the structural opt-out. The latter retains native find-in-page semantics. Do not override ordinary hidden navigation to display it.

## Layout and customization

The navigation region and main region are direct children of the body, in that order when both exist. Header and optional footer are shell children outside the body. At the existing 48rem viewport breakpoint the regions stack in source order; the layout retains logical direction and the existing spacing and chrome.

The public custom properties are `--vf-app-shell-max-inline-size` (default 100%; set a smaller value for a centered body), `--vf-app-shell-navigation-inline-size` (16rem), `--vf-app-shell-gap`, `--vf-app-shell-gutter` and `--vf-app-shell-block-padding`. Content measures belong inside main. Consumers own responsive navigation disclosure, focus recovery and routing; use existing Drawer or Disclosure where applicable.

## Framework mapping

The existing React and Vue AppShell region components, Angular region directives, and explicitly registered Elements `vf-app-shell-*` map the same regions to shared CSS. Conditionally render/omit the navigation region or set its ordinary native hidden attribute; no new component property or event is required. For Elements the navigation tag is `vf-app-shell-navigation`. Keep the native/link semantics of authored content.

This describes the unreleased shared layout correction tracked in #1355; verification and release acceptance are separate.
