## Summary

Describe the documentation, metadata, example, playground, or contributor-guidance change and the confusion or gap it resolves.

## Documentation scope

- [ ] Repository or contributor documentation
- [ ] Package README
- [ ] API/reference documentation
- [ ] Architecture, governance, quality, or release documentation
- [ ] Machine-readable metadata
- [ ] Docs application
- [ ] Playground or example

**Related package:** None / `ui-core` / `ui-components` / `ui-data-grid` / multiple

## Source-of-truth review

- [ ] Existing canonical documentation was updated rather than duplicated.
- [ ] Links point to the source of truth instead of copying long procedures.
- [ ] Package names, imports, CSS prefixes, stability labels, and examples match current public contracts.
- [ ] Examples reuse VyrnForge components and tokens rather than introducing one-off UI.
- [ ] Documentation-only claims are not presented as implemented runtime behavior.

## Runtime impact

- [ ] Documentation or metadata only; no runtime, package manifest, export, CSS entry, or build configuration changed.
- [ ] Example/docs application behavior changed and the affected package validation is required.
- [ ] Package README, `package.json`, exports, LICENSE, or CSS entry changed; package and consumer verification is required.

## Validation

- [ ] The generated CI plan correctly selects docs, playground, package, and consumer checks.
- [ ] Relevant metadata, link, docs, or playground checks passed.
- [ ] `npm run quality` passed once when the change requires full validation.
- [ ] No package version, npm publication, deployment, tag, or GitHub Release changed unintentionally.

## Evidence and notes

Provide rendered previews, corrected examples, known gaps, and follow-up documentation work.
