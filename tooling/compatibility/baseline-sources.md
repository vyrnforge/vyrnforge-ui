# Compatibility baseline sources

This repository file records why the implementation baselines in `support-status.json` were selected. It is evidence for the selection, not a second compatibility source of truth.

Selected 2026-10-19 baseline:

- Node.js 24 is the authoring/runtime LTS line used by CI.
- TypeScript 6.0.x is the authoring compiler line because Angular 22 requires `>=6.0.0 <6.1.0` and the selected TypeScript ESLint toolchain supports that compiler range.
- React targets the current stable 19.3 line.
- Angular targets the actively supported 22.x line.
- Vue targets the current stable 3.5 line; 3.6 is not selected while it remains pre-release.
- Browser engine validation is pinned by Playwright 1.64.1: Chromium 156.0.8078.4, Firefox 157.0, and WebKit 27.2.

These are implementation and validation baselines. A framework port is not a shipped support claim until its compatibility entry is marked implemented and the corresponding package, consumer, browser, SSR/CSR, documentation, and release evidence exists.
