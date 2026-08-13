import assert from "node:assert/strict";
import test from "node:test";

import { buildReleaseNotes } from "./release-notes.mjs";

test("release notes derive package roles, CSS and cross-line dependencies from metadata", () => {
  const dependency = {
    name: "@vyrnforge/ui-core",
    releaseGroupId: "foundation-beta",
  };
  const notes = buildReleaseNotes({
    releaseGroupId: "angular-beta",
    version: "1.0.0-beta.1",
    distTag: "beta",
    commit: "a".repeat(40),
    packageMap: new Map([[dependency.name, dependency]]),
    releaseGroup: {
      packages: [
        {
          name: "@vyrnforge/ui-angular",
          role: "angular-renderer",
          dependencies: { "@vyrnforge/ui-core": "1.0.0-beta.1" },
          policies: { hasCss: false },
        },
      ],
    },
  });

  assert.match(notes, /@vyrnforge\/ui-angular@1\.0\.0-beta\.1.*angular-renderer/u);
  assert.match(notes, /Required VyrnForge dependencies/u);
  assert.match(notes, /@vyrnforge\/ui-core@1\.0\.0-beta\.1.*foundation-beta/u);
  assert.match(notes, /No package in this release line declares a CSS payload/u);
  assert.doesNotMatch(notes, /BT-8002/u);
});
