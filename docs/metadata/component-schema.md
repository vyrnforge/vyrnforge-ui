# Component Metadata Schema

`docs/metadata/components.json` is the canonical structured source for every
VyrnForge component, public grid feature, public contract, and tracked
internal component. It is the only structured owner of component maturity,
package ownership, documentation and playground routes, public-export status,
and VF-1009 maturity evidence.

## Required fields

Each `components` record has a stable kebab-case `id`, `displayName`, VyrnForge
`package`, `category`, `maturity`, `owner`, `sourcePath`, `publicExport`,
`since`, `docsPath`, `playgroundPath`, `evidence`, `knownLimitations`, and
`deprecation`. It also records accessibility and keyboard documentation status.

Use `pending`, `requires-verification`, or `not-applicable` when a repository
fact is not yet verified or does not apply. Do not replace an unknown value
with an inferred version, test, browser run, or consuming-app claim.

Allowed categories are `primitive`, `form-control`, `composite`, `navigation`,
`overlay`, `feedback`, `data-display`, `data-grid`, `grid-feature`, and
`internal`. CSS class and token policy remains in the CSS metadata and
architecture documents; it is not determined by a component category.

## Evidence

`maturityEvidence.entries` is keyed by the component `id` and uses the
VF-1009 evidence fields and status values. Its `new-promotions-only` policy
keeps migrated entries explicitly unverified until a future promotion has
repository-visible evidence. Do not add a second evidence model to an entry.

## Adding or updating a component

1. Add or update one record in `components.json`; use an immutable ID and the
   actual `@vyrnforge/*` package name.
2. Set `publicExport` from the package-root export and point `sourcePath` at an
   existing package source file. A planned or internal record cannot be public.
3. Point `docsPath` at an existing Markdown document. Use an existing
   playground route or `not-applicable`; do not invent a route.
4. Preserve the current maturity unless the VF-1009 evidence and required
   review support a change. For a deprecation, record a replacement or reason.
5. Run `npm run verify:component-metadata` and
   `npm run verify:component-maturity`.

Compact AI and playground views must derive from this catalog or omit the
field; they must not carry their own maturity, route, ownership, or evidence
declarations.
