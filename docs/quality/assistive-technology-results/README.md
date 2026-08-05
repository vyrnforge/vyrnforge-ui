# Assistive-Technology Review Results

This directory stores immutable, reviewer-authored session records referenced by
`docs/metadata/assistive-technology-reviews.json`.

The canonical process, required environments, and execution rules remain in
`docs/architecture/05-accessibility-standards.md`. This directory is evidence
storage, not a second policy source.

## File naming

Use one file per environment and review session:

```text
YYYY-MM-DD-<environment-id>-<reviewer-slug>.md
```

Example:

```text
2026-08-04-windows-nvda-chrome-a-reviewer.md
```

## Required record

```markdown
# Assistive-Technology Review

- Commit: `<full commit SHA>`
- Environment ID: `<environment id from the canonical metadata>`
- Operating system: `<name and exact version>`
- Browser: `<name and exact version>`
- Assistive technology: `<name and exact version>`
- Reviewer: `<name>`
- Date: `YYYY-MM-DD`

## Scenario results

### AT-001 — <canonical scenario title>

- Outcome: passed | failed | conditional
- Fixtures: `<fixture IDs>`
- Theme and density: `<combinations reviewed>`
- Observed announcements: `<exact concise observations>`
- Focus and keyboard behavior: `<observations>`
- Limitations or defects: `<issue links or none>`
```

Do not edit a completed session record to make a later run appear successful.
Create a new dated record and update the structured result reference instead.

## CF-7010 representative consumer review

CF-7010 stores its four-consumer Windows + Chrome + NVDA review in
`cf-7010-cross-framework-nvda.json`. That task-specific structured record is
validated by `scripts/verify-cross-framework-accessibility.mjs`; it does not
replace or complete the broader component scenario catalog in
`assistive-technology-reviews.json`.
