import {
  readArgument,
  runTrustedPublishingDryRun,
} from "./trusted-publishing-dry-run.mjs";

const releaseGroupId = readArgument(process.argv, "--release-group");
const version = readArgument(process.argv, "--version");
const distTag = readArgument(process.argv, "--dist-tag");

if (!releaseGroupId) throw new Error("missing --release-group");
if (!version) throw new Error("missing --version");
if (!distTag) throw new Error("missing --dist-tag");

const { report, reportPath } = runTrustedPublishingDryRun({
  releaseGroupId,
  version,
  distTag,
});

console.log(
  `BT-8007 trusted-publishing dry run passed for ${report.packages.length} packages: ${reportPath}`,
);
