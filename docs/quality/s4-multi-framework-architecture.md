# Multi-Framework Architecture Evidence

This file remains at its established path so existing documentation links stay
stable. It now records current architecture evidence rather than a completed
sprint or rollout gate.

## Current architecture

VyrnForge uses shared framework-neutral contracts, tokens, behavior foundations,
metadata, generation inputs, and accessibility expectations across its web
surfaces. Framework packages and integrations must adapt those foundations
rather than become independent component libraries.

Current implemented renderer/package boundaries are:

- `@vyrnforge/ui-core`: framework-neutral design and styling foundation;
- `@vyrnforge/ui-behaviors`: framework-neutral controllers and portable behavior;
- `@vyrnforge/ui-components`: first-class React renderer;
- `@vyrnforge/ui-elements`: first-class native HTML / Custom Elements renderer;
- `@vyrnforge/ui-data-grid`: independent specialized React data-grid track.

Angular and Vue currently consume the shared native renderer with verified
framework-specific integration evidence. Their dedicated first-class package
cutovers remain future work under G12 and G13 and must not be claimed as shipped
until those gates pass.

## Contract evidence

The repository enforces:

- canonical component properties, events, slots, methods, and accessibility metadata;
- namespaced bubbling/composed public events;
- Light DOM and form-association policy for native elements;
- package dependency boundaries and server-safe imports;
- clean packed-consumer fixtures for React, native HTML, Angular, and Vue;
- cross-framework browser and accessibility evidence;
- generated framework artifacts and exception tracking;
- release-group boundaries that keep the data grid independent from non-grid beta.

Representative validation commands include:

```bash
npm run verify:multi-framework
npm run test:multi-framework
npm run verify:package-boundaries
npm run test:package-boundaries
npm run verify:consumer-foundations:runtime
npm run verify:generated-framework-artifacts
```

## Current support boundary

Architecture capability and shipped framework support are separate claims.
Repository metadata and release evidence are authoritative for the current
support level of each framework surface. Future G11-G15 program gates remain
active requirements and are not historical rollout artifacts.
