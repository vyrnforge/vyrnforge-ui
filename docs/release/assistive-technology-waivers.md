# Assistive-Technology Release Waivers

A release waiver records a temporary and explicit exception to the manual
assistive-technology completion gate.

A waiver does not:

- mark a scenario as passed;
- replace manual screen-reader testing;
- establish accessibility-complete status;
- permit stable promotion.

Active waivers must identify an exact release group and version, covered
scenario IDs, an owner, a reason, a tracking issue, and an expiry date.

The `0.2.0-beta.2` non-grid beta waiver covers AT-001 through AT-009.
AT-010 remains outside the non-grid release because the data grid is on its
independent alpha release track.

The release must state that manual Windows/NVDA verification remains pending.
Issue #86 owns completion of the deferred review.

The waiver must be removed after Windows/NVDA Chrome and Firefox reviews are
completed and retained evidence is committed.
