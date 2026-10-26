# Repository tooling

`tooling/` contains repository-only automation. It is not a runtime dependency layer and nothing under `packages/` may import it.

Top-level tooling directories are standardized by repository function:

| Area | Owns | Does not own |
| --- | --- | --- |
| `build/` | repository build orchestration, clean/build asset preparation | package runtime implementation, package-specific source logic |
| `ci/` | CI operational support that cannot live in workflow YAML, such as workflow evidence retention | product validation logic, architecture dependency truth |
| `docs/` | documentation generation, compilation, serving, examples integration, docs browser adapters | canonical product contracts or framework runtime implementation |
| `impact/` | impact policy/configuration, product and validation graph construction, plan selection/execution/reporting | behavioral test scenarios or product implementation |
| `release/` | change-fragment discovery, unreleased-change rendering, release/changelog composition | CI selection rules or product behavior |
| `testing/` | reusable validation harnesses and repository evidence infrastructure; quality-specific infrastructure lives beneath this owner | component/package evidence that belongs beside the product it proves |
| `tokens/` | repository-owned design-token authoring, transformation, and generation | browser runtime token CSS, which is emitted into `@vyrnforge/web` |
| `verify/` | executable repository invariants, architecture/package/public-boundary checks | generators, general test harnesses, or product implementation |

## Testing subareas

Quality axes are not top-level tooling capabilities. When repository-wide reusable infrastructure is required, it lives beneath `testing/`:

- `testing/accessibility/` — accessibility mapping/standards tooling shared across product owners.
- `testing/compatibility/` — compatibility support/qualification metadata consumed by verification.
- `testing/performance/` — representative performance/bundle measurement infrastructure and baselines.
- `testing/visual/` — repository-wide visual evidence that is not owned by one product slice.

Do not create empty placeholders such as `testing/consumers/`. Add a subarea only when real maintained infrastructure exists. Product-specific tests, browser scenarios, examples, and evidence stay with `product/<component>/` or the owning package.

## Placement rules

1. Put a script with the capability it implements, not with the command that happens to call it.
2. Keep tooling tests beside the tooling they prove.
3. Prefer one clear owner over cross-directory helper dumping grounds. Do not introduce `utils/`, `common/`, `misc/`, or `scripts/` as catch-all areas.
4. Workflow files orchestrate; `impact/` owns validation selection and dependency truth.
5. `verify/` enforces boundaries but does not become an alternative home for every script.
6. Public packages must never import repository tooling.
7. A new top-level tooling area requires a durable repository capability that cannot be cleanly owned by the eight existing areas.
8. The top-level tooling taxonomy is verified automatically; nested organization may evolve with the owning capability without creating a central per-script registry.
