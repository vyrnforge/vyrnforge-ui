import { getReleaseLineEntries } from "./release-groups.mjs";
import { resolveReleaseSelection } from "./resolve-release-selection.mjs";

export function getReleaseDryRunOrder(manifest) {
  const entries = getReleaseLineEntries(manifest);
  const releaseLineMap = new Map(entries);
  const publishable = new Set(
    entries
      .filter(
        ([, releaseLine]) => releaseLine.publication?.publishable === true,
      )
      .map(([releaseLineId]) => releaseLineId),
  );

  const visiting = new Set();
  const visited = new Set();
  const order = [];

  function visit(releaseLineId) {
    if (!publishable.has(releaseLineId) || visited.has(releaseLineId)) return;

    if (visiting.has(releaseLineId)) {
      throw new Error(
        `release dry-run dependency cycle includes ${releaseLineId}`,
      );
    }

    const releaseLine = releaseLineMap.get(releaseLineId);
    if (!releaseLine) {
      throw new Error(`unknown release line ${releaseLineId}`);
    }

    visiting.add(releaseLineId);

    for (const dependency of releaseLine.releaseDependencies ?? []) {
      visit(dependency.releaseLine);
    }

    visiting.delete(releaseLineId);
    visited.add(releaseLineId);
    order.push(releaseLineId);
  }

  for (const [releaseLineId] of entries) {
    visit(releaseLineId);
  }

  return order;
}

export function validateReleaseDryRunPlan(plan) {
  const failures = [];
  const indexes = new Map(
    plan.map((releaseLine, index) => [releaseLine.releaseGroupId, index]),
  );
  const gitTags = new Set();
  const releaseNames = new Set();

  if (plan.length === 0) {
    failures.push("release dry-run plan contains no publishable release lines");
  }

  for (const releaseLine of plan) {
    if (gitTags.has(releaseLine.gitTag)) {
      failures.push(`duplicate release git tag ${releaseLine.gitTag}`);
    }
    gitTags.add(releaseLine.gitTag);

    if (releaseNames.has(releaseLine.releaseName)) {
      failures.push(`duplicate release name ${releaseLine.releaseName}`);
    }
    releaseNames.add(releaseLine.releaseName);

    for (const dependency of releaseLine.releaseDependencies) {
      if (
        indexes.has(dependency) &&
        indexes.get(dependency) >= indexes.get(releaseLine.releaseGroupId)
      ) {
        failures.push(
          `${releaseLine.releaseGroupId}: dependency ${dependency} must run first`,
        );
      }
    }
  }

  return [...new Set(failures)].sort();
}

export function buildReleaseDryRunPlan({ manifest, root } = {}) {
  if (!manifest) {
    throw new Error("release dry-run plan requires release metadata");
  }

  const releaseLineMap = new Map(getReleaseLineEntries(manifest));

  const plan = getReleaseDryRunOrder(manifest).map((releaseGroupId) => {
    const releaseLine = releaseLineMap.get(releaseGroupId);
    const selection = resolveReleaseSelection(releaseGroupId, {
      root,
      manifest,
    });

    return {
      releaseGroupId,
      version: selection.version,
      distTag: selection.distTag,
      gitTag: selection.gitTag,
      releaseName: selection.releaseName,
      packages: selection.packages,
      dependencyClosure: selection.dependencyClosure,
      releaseDependencies: (releaseLine.releaseDependencies ?? []).map(
        (dependency) => dependency.releaseLine,
      ),
    };
  });

  const failures = validateReleaseDryRunPlan(plan);

  if (failures.length) {
    throw new Error(
      `release dry-run plan is invalid:\n- ${failures.join("\n- ")}`,
    );
  }

  return plan;
}
