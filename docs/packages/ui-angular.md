# Angular package

`@vyrnforge/ui-angular` is the first-class Angular facade over the canonical
VyrnForge Custom Element implementation. It owns Angular-facing bindings,
setup, Forms integration, and typed element access while canonical rendering,
behavior, accessibility semantics, styling, and framework-independent state
remain in shared VyrnForge foundations.

Canonical component status lives in
[`../metadata/components.json`](../metadata/components.json). Generated component
and framework API details live in
[`../generated/component-reference.json`](../generated/component-reference.json);
this guide does not duplicate that catalog.

## Install and register

Install the Angular surface package in an Angular application:

```bash
npm install @vyrnforge/ui-angular@beta
```

The supported Angular line is `>=22 <23`. `@angular/core` and RxJS are peers
supplied by the Angular application. `@angular/forms` is optional and is only
required when the Forms entrypoint is used. Shared VyrnForge renderer,
behavior, token, and style packages are implementation dependencies of the
facade and are installed transitively; normal applications do not install or
coordinate that internal graph themselves.

Register VyrnForge once at the application boundary:

```ts
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideVyrnForge } from "@vyrnforge/ui-angular";

import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideVyrnForge()],
});
```

`provideVyrnForge()` delegates registration to the canonical element registry.
Normal consumers do not copy registration code, import package-internal source
paths, configure a custom-element schema for generated facade usage, or install
native VyrnForge packages separately. The validated package path also carries
the canonical VyrnForge styling into the application build. Hosts that
intentionally manage stylesheet loading can use the public element CSS
entrypoint from the installed dependency closure, but that is not the default
Angular setup.

## Components, inputs, outputs, and events

The facade covers the supported non-grid catalog with generated Angular
directives plus narrow specialized bindings where the canonical contract
requires them. Use the generated component reference for the exact selector,
input, output, slot, reference, and method surface of each component.

Angular outputs preserve canonical VyrnForge event semantics rather than
inventing framework-only component behavior. When a canonical property and
event intentionally share an Angular public name, the generated facade keeps
the property as a host binding and owns the output alias explicitly.

Do not import `@vyrnforge/ui-elements/src/*`, generated fixture files, or other
private paths. If an application needs the underlying Custom Element at an
interoperability boundary, use the typed public reference exposed by the facade
rather than querying VyrnForge internals.

## Angular Forms

Forms integration is isolated behind `@vyrnforge/ui-angular/forms` so
applications that do not use Angular Forms do not need the optional Forms peer.

```ts
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { VyrnForgeFormControlDirective } from "@vyrnforge/ui-angular/forms";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, VyrnForgeFormControlDirective],
  template: `<vf-text-input
    vfFormControl
    formControlName="owner"
  ></vf-text-input>`,
})
export class ProfileFormComponent {}
```

The package-owned directive implements the supported ControlValueAccessor and
Validator bridge over canonical element behavior. Reactive Forms,
template-driven Forms, and `ngModel` use the same bridge; applications do not
copy fixture-owned CVA or validation code.

Supported form values follow five canonical model categories: string values,
checked booleans, numeric values, immutable string collections, and selections.
In particular, `vf-number-input` maps its string-backed native value to a
numeric Angular model, empty numeric input maps to `null`, mixed checked state
maps explicitly, and collection values remain immutable string arrays.
Incompatible runtime values are rejected instead of silently coerced.

## Composition and content projection

Use normal Angular content composition with the canonical VyrnForge slot
contract. Generated metadata identifies supported regions such as labels,
descriptions, prefix/suffix content, collection items, loading/empty content,
and overlay regions.

Components with canonical overlay or reparenting behavior keep that behavior
below the Angular facade. Do not recreate dialog, focus, or overlay mechanics in
application wrappers merely to make them feel Angular-specific.

## Typed references and imperative APIs

Generated directives expose typed access to the canonical element and supported
imperative methods. Use those public references for operations such as focus,
click, selection, validity/reporting, and overlay show/close where the component
contract exposes them.

Application code should not query private implementation details to invoke
VyrnForge behavior. The generated component reference is the source of truth for
which methods are public on each component.

## SSR and server-safe imports

The package root and Forms entrypoint are safe to import in the validated server
environment without eagerly reading browser DOM globals. `provideVyrnForge()`
defers Custom Element registration to the browser-capable application lifecycle.

Server-safe import does not mean browser-only Custom Element internals are
rendered on the server. Keep DOM interaction and element registration behind the
supported Angular setup path, and do not move native registration side effects
into shared server modules.

## Migrating existing Angular integrations

For applications that previously consumed native elements directly or carried
private fixture adapters:

1. Install `@vyrnforge/ui-angular@beta` and register once with `provideVyrnForge()`.
2. Replace copied registration/schema helpers with generated Angular facade imports.
3. Replace copied CVA/Validator code with `VyrnForgeFormControlDirective` from `@vyrnforge/ui-angular/forms` where Forms integration is needed.
4. Keep canonical `vf-*` behavior and event semantics; do not rename events or fork component state in application wrappers.
5. Replace private DOM queries with generated typed references and public methods.
6. Preserve business validation, routing, data access, permissions, workflow state, and application stores in the consuming application.
7. Verify the migrated surface against the generated component reference and the package's supported Angular peer range before removing the old adapter.

The underlying Native HTML surface remains a supported interoperability escape
hatch. Use it deliberately for framework-neutral boundaries rather than
rebuilding a second Angular component library.

## Current limitations and escape hatches

- The supported Angular peer range is `>=22 <23`; a new Angular major requires an explicit compatibility update.
- `@angular/forms` is optional and only supported through the `/forms` entrypoint when Forms integration is needed.
- The data grid remains on its independent React-only alpha track; the Angular non-grid facade does not imply an Angular grid surface.
- SSR support guarantees server-safe imports and deferred registration, not server rendering of browser-only Custom Element internals.
- Canonical VyrnForge styling remains token- and package-CSS-driven; framework-specific styling forks are unsupported.
- Application state managers such as NgRx remain consumer choices and are not VyrnForge dependencies.
- For a framework-neutral interoperability boundary, consume the public Native HTML APIs deliberately instead of importing private Angular or element implementation paths.

See [Import And Setup](../api/import-and-setup.md) for the cross-framework setup
overview and
[Multi-Framework Migration and Limitations](../release/multi-framework-migration-and-limitations.md)
for framework selection and shared migration rules.
