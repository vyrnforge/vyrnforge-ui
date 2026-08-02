# Cross-Framework Accessibility Review

CF-7010 combines automated accessibility checks with a named manual Windows,
Chrome, and NVDA review across the packed Native HTML, React, Angular, and Vue
consumers. Framework-level verification does not replace the broader
component-by-component assistive-technology program in
`docs/metadata/assistive-technology-reviews.json`.

## Automated evidence

The existing packed-consumer browser matrix is extended instead of introducing
a second installation/build harness. For each consumer it records:

| Scenario                   | Evidence                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Axe serious/critical scan  | The representative page has no serious or critical Axe violation. All reported violations remain in the JSON artifact.         |
| Keyboard action activation | The primary VyrnForge action receives focus, activates from `Enter`, and updates observable consumer state.                    |
| Tabs keyboard navigation   | `ArrowRight` moves focus and selection from the first enabled tab to the next enabled tab; `ArrowLeft` restores the first tab. |
| Text-input accessible name | The representative text input is discoverable by the accessible name `Owner` and accepts focus.                                |

Run the automated matrix and preserve the built consumers for manual review:

```bash
npm run verify:cross-framework-accessibility:runtime -- --preserve-built-fixtures
```

The command writes:

```text
test-results/cross-framework-matrix/accessibility-report.json
test-results/cross-framework-matrix/traces/<consumer>.zip
```

CI uploads the directory as the existing `cross-framework-browser-matrix`
artifact.

## Manual NVDA review

After the automated command succeeds, start the four built previews:

```bash
npm run review:cross-framework-accessibility
```

Use Windows, Chrome, and NVDA. Record exact versions. Review every URL printed by
the command and verify:

1. The page landmark and success message are understandable without visual-only context.
2. The Save action is announced by name and button role, is reachable by keyboard, and activation produces understandable updated status.
3. The tabs expose a tablist, tab names, selected state, position, keyboard movement, and the active panel relationship.
4. The Owner input is announced with its name and current value.
5. Focus order remains logical and no framework introduces duplicate, missing, or stale announcements.

Stop the preview command with `Ctrl+C`, then run the supplied evidence-completion
PowerShell script. CF-7010 may move to `evidence-complete` only when all four
consumer outcomes are recorded as passed by a named reviewer. Failed or blocked
outcomes must remain blockers for GMF4.
