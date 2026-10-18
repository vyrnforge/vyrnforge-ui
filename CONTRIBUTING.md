# Contributing to VyrnForge

VyrnForge is in a clean-slate rebuild.

Before implementation work:

1. Read the relevant canonical VyrnForge architecture and standards.
2. Inspect the current repository surface that will be changed.
3. Reuse the approved foundation instead of creating framework-local alternatives.
4. Keep shared semantic contracts framework-neutral.
5. Add the validation and documentation required by the affected contract.

`packages/legacy` is historical reference only. New code must not import from it, depend on it, or copy its architecture without deliberate review.
