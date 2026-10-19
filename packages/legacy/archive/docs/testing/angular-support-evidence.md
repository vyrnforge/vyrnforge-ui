# Angular compatibility and accessibility evidence

MFD-1214 makes the first-class Angular support claim traceable to existing shared VyrnForge evidence instead of creating an Angular-only assurance stack. The canonical record is [`docs/metadata/angular-support-evidence.json`](../metadata/angular-support-evidence.json).

## Supported package range

`@vyrnforge/ui-angular` and its optional Forms entrypoint declare Angular peers `>=22 <23`. The supported runtime evidence therefore uses Angular 22.0.8 on Node 24.18.0 in Chromium through compatibility case `angular22-node24-chromium`.

The shared compatibility matrix also exercises Angular 21.2.18 on Node 22.12.0. That case remains useful compatibility information, but it does not widen the public `@vyrnforge/ui-angular` peer contract and is not a first-class support claim.

## Evidence layers

The support gate reuses the existing VyrnForge foundations:

- the compatibility release matrix performs clean installation, package tarball installation, strict type/build checks, and browser smoke;
- the packed four-surface matrix proves the Angular fixture consumes installed package entrypoints and exercises canonical action, tabs-property, and text-input property scenarios;
- CF-7010 supplies Axe serious/critical checks, representative keyboard action and tabs navigation, text-input accessible-name/focus checks, and completed Windows/Chrome/NVDA evidence for the Angular consumer;
- the Angular Forms adapter record supplies reactive Forms, template-driven Forms, validation, disabled/touched state, and packed `@vyrnforge/ui-angular/forms` Chromium evidence;
- the current packed Angular consumer exercises public imperative focus, select, validity, Dialog show/close, and canonical Button click APIs.

MFD-1212's ownership verifier is part of the evidence chain: the fixture must not restore copied generated facades, local Forms adapters, or private source imports.

## Release boundary

This record establishes compatibility and accessibility evidence for the current first-class Angular package contract. It does not by itself declare a registry release ready; MFD-1215 owns Angular release verification and documentation after this gate merges.

## Validation

The established `verify:compatibility-release-matrix` metadata gate validates this record alongside the shared compatibility matrix. Its contract tests deliberately fail when the supported Angular case, public peer range, Angular accessibility result, required accessibility scenarios, packed ownership gate, Forms evidence, or imperative/focus evidence is removed.
