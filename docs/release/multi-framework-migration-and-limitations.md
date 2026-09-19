# Releases & Migration

Use this guide when choosing a framework surface, upgrading VyrnForge, or removing application-owned wrappers.

## Release tracks

The non-grid foundation is distributed through the synchronized `beta` track:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-behaviors`
- `@vyrnforge/ui-elements`
- `@vyrnforge/ui-components`
- `@vyrnforge/ui-angular`
- `@vyrnforge/ui-vue`

`@vyrnforge/ui-data-grid` is independently versioned on the `alpha` track.

A prerelease channel describes distribution maturity. Component maturity is still evaluated per component.

## Choose the surface for your application

| Application | Package |
| --- | --- |
| React | `@vyrnforge/ui-components` |
| Native HTML / Custom Elements | `@vyrnforge/ui-elements` |
| Angular | `@vyrnforge/ui-angular` |
| Vue | `@vyrnforge/ui-vue` |

All four non-grid surfaces share the same VyrnForge design tokens, accessibility expectations, and canonical component contracts.

Use Native HTML deliberately at interoperability boundaries. Do not create a second framework wrapper when the supported VyrnForge package already covers the integration.

## Current limitations

- The data grid is currently React-only.
- Angular and Vue support follows the peer ranges declared by their package manifests.
- Framework form/model adapters translate VyrnForge control contracts; they are not application business-form frameworks.
- Server-safe imports do not mean browser-only Custom Element internals are server-rendered.
- Framework-specific styling forks are unsupported; use shared VyrnForge tokens and package CSS.
- VyrnForge does not require an application state-management library.

## Migrating application-owned wrappers

When an application has its own VyrnForge wrapper:

1. identify what the wrapper actually adds;
2. replace registration-only, event-renaming, model-bridging, or typed-ref wrappers when the public VyrnForge package already supports that behavior;
3. keep a thin application adapter only for a real application or framework convention not owned by VyrnForge;
4. keep business validation, backend calls, routing, permissions, workflow state, and application stores outside VyrnForge;
5. verify the replacement against the generated component reference before deleting the old wrapper.

## Upgrading

During `0.x`:

1. install the intended explicit prerelease channel;
2. review changed public APIs and migration notes;
3. test the application against packed public entrypoints rather than internal source paths;
4. keep changes incremental enough to roll back through supported public APIs.

Internal publication, provenance, approval, and release-governance procedures are maintained separately for VyrnForge maintainers and are not part of the normal consumer workflow.
