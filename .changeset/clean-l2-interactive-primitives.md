---
'@vyrnforge/web': major
'@vyrnforge/react': major
'@vyrnforge/angular': major
'@vyrnforge/vue': major
---

Clean Layer 2 around distinct interactive responsibilities instead of native input-type catalog symmetry.

- Merge NumberInput, ColorInput, and TemporalInput into the existing Input primitive through the shared native type vocabulary.
- Remove standalone NumberInput, ColorInput, and TemporalInput public entrypoints and framework wrappers.
- Keep FileInput distinct because native file selection owns materially different FileList, security, and form behavior.
- Remove Theme Toggle as a library component; theme selection is application-owned composition over Switch/native switch semantics and the shared theme contract.
- Preserve native semantics, canonical Web styling, semantic tokens, forced-colors support, reduced-motion handling, logical CSS, and focus-visible behavior.

Migration:
- Replace NumberInput with Input type="number".
- Replace ColorInput with Input type="color".
- Replace TemporalInput and the retired TemporalField wrapper with Input using type="date", "time", "datetime-local", "month", or "week".
- Replace the Theme Toggle component/style entrypoint with an application-authored Switch or native checkbox-backed switch wired to application theme policy.
