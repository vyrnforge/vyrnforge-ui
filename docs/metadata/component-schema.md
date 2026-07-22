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
fact is not yet verified or does not apply. A canonical Experimental evidence
record may remain `pending`; recording owner and location evidence closes the
unsupported historical claim but does not complete promotion evidence. Do not
replace an unknown value with an inferred version, test, browser run, manual
review, or consuming-app claim.

Allowed categories are `primitive`, `form-control`, `composite`, `navigation`,
`overlay`, `feedback`, `data-display`, `data-grid`, `grid-feature`, and
`internal`. CSS class and token policy remains in the CSS metadata and
architecture documents; it is not determined by a component category.

## Evidence

`maturityEvidence.entries` is keyed by the component `id` and uses the
VF-1009 evidence fields and status values. VF-2015 closed the temporary legacy
exception: `legacyUnverifiedEntries` must remain empty, and the transition
policy carries a `closedEntries` audit list. Former unsupported stable claims
were reclassified as Experimental and received explicit owner, implementation,
and documentation records. Do not add a second evidence model to an entry.

Manual assistive-technology evidence is not embedded in a component record.
Use `assistive-technology-reviews.json` so environments, scenario results, and
pending states remain queryable and auditable.

### VF-2015 closure decision

VF-2015 removed the temporary legacy exception without inventing Stable
evidence. The 47 historical Stable records were reclassified as Experimental,
kept publicly available, and given complete owner, implementation-location,
and documentation-location records. Their component evidence summary remains
`pending` until a future promotion supplies every field required by the target
maturity. The transition policy's `closedEntries` list is the auditable closure
set, and `npm run verify:maturity-closure` prevents those entries from regaining
an unsupported Stable label or legacy exception.

This correction changes governance metadata, not package exports or intended
runtime behavior.

## Adding or updating a component

1. Add or update one record in `components.json`; use an immutable ID and the
   actual `@vyrnforge/*` package name.
2. Set `publicExport` from the package-root export and point `sourcePath` at an
   existing package source file. A planned or internal record cannot be public.
3. Point `docsPath` at an existing Markdown document. Use an existing
   playground route or `not-applicable`; do not invent a route.
4. Preserve the current maturity unless the VF-1009 evidence and required
   review support a change. For a deprecation, record a replacement or reason.
5. Run `npm run verify:component-metadata`,
   `npm run verify:component-maturity`, and
   `npm run verify:maturity-closure`. When manual review metadata changes, also
   run `npm run verify:assistive-technology`.

Compact AI and playground views must derive from this catalog or omit the
field; they must not carry their own maturity, route, ownership, or evidence
declarations.

## Framework parity metadata

Every public `@vyrnforge/ui-components` record must include `frameworkParity`.
The record identifies the current React export, the shared behavior foundation,
the planned native strategy or mapping, Angular/Vue consumer targets, and beta
scope. This is catalog coverage, not a runtime support claim. Detailed
properties, events, slots, methods, form behavior, and accessibility remain in
`component-contracts.json` and expand family-by-family before GMF3.
