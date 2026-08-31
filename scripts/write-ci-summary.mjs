import { appendFileSync } from "node:fs";
import { verifyCurrentGitHubPullRequestLaneDrift } from "./verify-lane-drift.mjs";

function parsePlan() {
  const raw = process.env.PLAN_JSON;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Unable to parse PLAN_JSON: ${error.message}`);
    return {};
  }
}

function list(values) {
  return values.length
    ? values.map((value) => `- ${value}`).join("\n")
    : "- None";
}

function responsibilityPlan(plan) {
  return [
    {
      id: "quality",
      selected: plan.quality === true,
      command: "node scripts/run-scoped-quality.mjs",
    },
    {
      id: "integration",
      selected: plan.integration === true,
      command: "selected integration/build commands",
    },
    {
      id: "security",
      selected: plan.security === true,
      command:
        "npm run verify:security-workflow-hardening && npm run verify:workflows",
    },
  ];
}

function writeSummary(text) {
  const target = process.env.GITHUB_STEP_SUMMARY;
  if (target) appendFileSync(target, `${text}\n`);
  process.stdout.write(`${text}\n`);
}

const plan = parsePlan();
const responsibilities = responsibilityPlan(plan);
const changedFiles = Array.isArray(plan.changed_files)
  ? plan.changed_files
  : [];
const reasons = Array.isArray(plan.reasons) ? plan.reasons : [];
const selected = responsibilities
  .filter((responsibility) => responsibility.selected)
  .map(
    (responsibility) =>
      `\`${responsibility.id}\` — ${responsibility.command}`,
  );
const skipped = responsibilities
  .filter((responsibility) => !responsibility.selected)
  .map(
    (responsibility) =>
      `\`${responsibility.id}\` — intentionally not required`,
  );

if ((process.env.CI_SUMMARY_MODE ?? "plan") === "plan") {
  writeSummary(`## VyrnForge CI plan

### What changed
${list(changedFiles.map((file) => `\`${file}\``))}

### Why these checks were selected
${list(reasons)}

### Selected responsibilities
${list(selected)}

### Skipped responsibilities
${list(skipped)}
`);
  process.exit(0);
}

const checks = [
  {
    id: "plan",
    required: true,
    result: process.env.PLAN_RESULT,
  },
  {
    id: "quality",
    required: plan.quality === true,
    result: process.env.QUALITY_RESULT,
  },
  {
    id: "integration",
    required: plan.integration === true,
    result: process.env.INTEGRATION_RESULT,
  },
  {
    id: "security",
    required: plan.security === true,
    result: process.env.SECURITY_RESULT,
  },
];

const failures = checks.flatMap((check) => {
  if (check.required && check.result !== "success") {
    return `${check.id} was required but finished as ${check.result ?? "unknown"}`;
  }
  if (
    !check.required &&
    !["success", "skipped"].includes(check.result ?? "unknown")
  ) {
    return `${check.id} was not required but finished as ${check.result ?? "unknown"}`;
  }
  return [];
});

let laneDrift = {
  mode: "not-applicable",
  current: true,
  reason: "non-pr-event",
};
try {
  laneDrift = verifyCurrentGitHubPullRequestLaneDrift();
} catch (error) {
  failures.push(`lane drift: ${error.message}`);
  laneDrift = {
    mode: "blocked",
    current: false,
    reason: error.message,
  };
}

writeSummary(`## VyrnForge CI result

### What changed
${list(changedFiles.map((file) => `\`${file}\``))}

### Selected responsibilities
${list(selected)}

### Skipped responsibilities
${list(skipped)}

### Lane freshness
- mode: \`${laneDrift.mode}\`
- current with \`main\`: \`${laneDrift.current}\`
- reason: \`${laneDrift.reason}\`

### Results
${list(
  checks.map(
    (check) =>
      `\`${check.id}\` — ${check.required ? "required" : "not required"} — \`${check.result ?? "unknown"}\``,
  ),
)}

### Failed responsibilities
${list(failures)}
`);

if (failures.length) {
  console.error(`ci-gate failed: ${failures.join("; ")}`);
  process.exit(1);
}
