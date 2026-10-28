# Product test support

This directory contains repository-private support shared by multiple product ownership slices. It is not generic repository tooling and must not be imported by public package source code.

- `native-controls/` owns shared native-control conformance semantics, fixture adapters, and SSR/browser test registration used by product and package evidence.
- `accessibility/` owns product accessibility classification and reporting rules.
- `performance/` owns representative product bundle selections and their reviewed baselines.

Owner-scoped support may depend on generic repository testing mechanisms, but generic `tooling/` must not encode these product concepts or depend on this directory.
