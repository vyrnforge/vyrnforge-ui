# Formatting Baseline

## Purpose

VyrnForge formatting verification prevents new formatting debt without hiding the repository's inherited formatting backlog.

The canonical commands are:

```bash
npm run format:check
npm run format
npm run format:baseline
```

## Enforcement model

`npm run format:check` runs Prettier across the repository. Files that already satisfy Prettier pass normally.

Legacy unformatted files are listed in `.prettier-baseline.json` with a SHA-256 hash. A baseline entry is accepted only while the file remains byte-for-byte unchanged. Therefore:

- a new unformatted file fails;
- a modified legacy file that remains unformatted fails;
- a formatted legacy file creates a stale baseline entry and fails until the reviewed baseline is regenerated;
- unchanged legacy debt remains visible and countable instead of being silently ignored.

## Updating a changed file

Format only the files within the controlled task scope:

```bash
npx prettier --write path/to/changed-file
npm run format:check
```

Do not mass-format unrelated files inside a functional pull request.

## Regenerating the baseline

Regeneration is allowed only after reviewing the formatter diff and confirming that the change intentionally reduces or reclassifies legacy debt:

```bash
npm run format:baseline
npm run format:check
```

A baseline update must never be used to approve new formatting debt.
