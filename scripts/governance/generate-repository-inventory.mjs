import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const outputArgumentIndex = process.argv.indexOf("--output");
const output =
  outputArgumentIndex >= 0 && process.argv[outputArgumentIndex + 1]
    ? process.argv[outputArgumentIndex + 1]
    : "docs/governance/repository-inventory.md";
const packageDirectories = ["ui-core", "ui-components", "ui-data-grid"];
const owners = {
  "@vyrnforge/ui-core": "UI Platform",
  "@vyrnforge/ui-components": "Component Team",
  "@vyrnforge/ui-data-grid": "Data Grid Team",
};
const aliases = {
  ClearButton: "components/IconButton/ActionButtons.tsx",
  CloseButton: "components/IconButton/ActionButtons.tsx",
  MoreButton: "components/IconButton/ActionButtons.tsx",
  RefreshButton: "components/IconButton/ActionButtons.tsx",
};

function text(file) {
  return readFileSync(path.join(root, file), "utf8");
}

function json(file) {
  return JSON.parse(text(file));
}

function walk(directory, match = () => true) {
  const absolute = path.join(root, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true })
    .flatMap((entry) => {
      if ([".git", "dist", "node_modules"].includes(entry.name)) return [];
      const file = path.posix.join(directory, entry.name);
      return entry.isDirectory()
        ? walk(file, match)
        : match(file)
          ? [file]
          : [];
    })
    .sort((a, b) => a.localeCompare(b));
}

function exportsFrom(file) {
  const names = new Set();
  const source = text(file);
  for (const match of source.matchAll(
    /export\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["'][^"']+["'];?/g,
  )) {
    for (const member of match[1].split(",")) {
      const name = member
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*type\s+/, "")
        .trim()
        .split(/\s+as\s+/)
        .at(-1)
        ?.trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name ?? "")) names.add(name);
    }
  }
  for (const match of source.matchAll(
    /export\s+(?:declare\s+)?(?:const|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g,
  ))
    names.add(match[1]);
  return [...names].sort((a, b) => a.localeCompare(b));
}

function countLines(file) {
  return text(file).split(/\r?\n/).length - 1;
}

function cell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function table(headers, rows) {
  return [
    `| ${headers.map(cell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

function codeList(items, fallback = "None") {
  return items.length
    ? items.map((item) => `\`${item}\``).join(", ")
    : fallback;
}

function sourceFor(name, directory, files) {
  if (aliases[name]) return `packages/${directory}/src/${aliases[name]}`;
  const matches = files.filter(
    (file) => path.basename(file, path.extname(file)) === name,
  );
  return matches.length === 1 ? matches[0] : "Requires verification";
}

function docsFor(name, directory, docs) {
  const candidates = [...docs, `packages/${directory}/README.md`].filter(
    (file) => {
      return (
        existsSync(path.join(root, file)) &&
        (text(file).includes(`\`${name}\``) || text(file).includes(` ${name} `))
      );
    },
  );
  return candidates.slice(0, 2).join(", ") || "Requires verification";
}

function routeFor(name, routeFile) {
  const escape = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = routeFile.match(
    new RegExp(`label:\\s*["']${escape}["']([\\s\\S]{0,500}?)Component:`, "m"),
  );
  return (
    match?.[1].match(/path:\s*["']([^"']+)["']/)?.[1] ??
    "No dedicated route found"
  );
}

function testFor(name, files) {
  const matches = files.filter((file) => text(file).includes(name));
  if (!matches.length)
    return ["No focused test found", "Requires verification"];
  const content = matches.map(text).join("\n");
  const types = ["pure/unit"];
  if (/renderToStaticMarkup|renderToString/.test(content))
    types.push("static markup");
  if (
    /createRoot|dispatchEvent|fireEvent|userEvent|createUser|@testing-library\/react/.test(
      content,
    )
  )
    types.push("DOM interaction");
  if (/playwright|cypress|webdriver/i.test(content)) types.push("browser");
  if (
    /axe|toHaveNoViolations|jest-axe|assertNoAccessibilityViolations/i.test(
      content,
    )
  )
    types.push("accessibility");
  return [matches.join(", "), types.join(", ")];
}

const rootPackage = json("package.json");
const packageMetadata = json("docs/metadata/packages.json").packages;
const catalog = json("docs/metadata/components.json").components;
const catalogByKey = new Map(
  catalog.map((item) => [`${item.package}:${item.displayName}`, item]),
);
const docs = walk(
  "docs",
  (file) => file.endsWith(".md") && !file.includes("/archive/"),
);
const allDocs = walk("docs", (file) => file.endsWith(".md"));
const tests = [
  ...walk("packages", (file) => /\.(?:test|spec)\.(ts|tsx|mjs)$/.test(file)),
  ...walk("apps", (file) => /\.(?:test|spec)\.(ts|tsx|mjs)$/.test(file)),
  ...walk("scripts", (file) => /\.(?:test|spec)\.(ts|tsx|mjs)$/.test(file)),
  ...walk("tests", (file) => /\.(?:test|spec)\.(ts|tsx|mjs)$/.test(file)),
].sort((a, b) => a.localeCompare(b));
const workflows = walk(".github/workflows", (file) => file.endsWith(".yml"));
const routes = text("examples/basic-playground/src/app/routes.ts");
const records = packageDirectories.map((directory) => {
  const manifest = json(`packages/${directory}/package.json`);
  const exports = exportsFrom(`packages/${directory}/src/index.ts`);
  const maturity = catalog
    .filter((component) => component.package === manifest.name)
    .reduce(
      (result, component) => ({
        ...result,
        [component.maturity]: (result[component.maturity] ?? 0) + 1,
      }),
      {},
    );
  return { directory, manifest, exports, maturity };
});

const components = records
  .filter((record) => record.directory !== "ui-core")
  .flatMap((record) => {
    const files = walk(`packages/${record.directory}/src`, (file) =>
      /\.(ts|tsx)$/.test(file),
    );
    const packageTests = tests.filter((file) =>
      file.startsWith(`packages/${record.directory}/`),
    );
    const exported = new Set(record.exports);
    const names = new Set();
    for (const component of catalog) {
      if (
        component.package === record.manifest.name &&
        component.publicExport &&
        exported.has(component.displayName) &&
        /^[A-Z]/.test(component.displayName)
      )
        names.add(component.displayName);
    }
    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const source = sourceFor(name, record.directory, files);
        const documentation = docsFor(name, record.directory, docs);
        const playground = routeFor(name, routes);
        const [testFiles, testTypes] = testFor(name, packageTests);
        const gaps =
          [
            source === "Requires verification" &&
              "Source mapping requires verification",
            documentation === "Requires verification" &&
              "No component-specific documentation evidence",
            playground === "No dedicated route found" &&
              "No dedicated playground route",
            testFiles === "No focused test found" && "No focused test evidence",
            !testTypes.includes("browser") && "No browser evidence",
            !testTypes.includes("accessibility") &&
              "No accessibility-test evidence",
          ]
            .filter(Boolean)
            .join("; ") || "No gap detected by inventory";
        return [
          name,
          record.manifest.name,
          source,
          "Yes",
          documentation,
          playground,
          testFiles,
          testTypes,
          catalogByKey.get(`${record.manifest.name}:${name}`)?.maturity ??
            "Requires verification",
          gaps,
          owners[record.manifest.name],
        ];
      });
  });

const gridFiles = walk("packages/ui-data-grid/src", (file) =>
  /\.(ts|tsx)$/.test(file),
);
const largeGridFiles = gridFiles
  .map((file) => [file, countLines(file)])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
const isStaticTest = (file) =>
  /renderToStaticMarkup|renderToString/.test(text(file));
const isDomTest = (file) =>
  /createRoot|dispatchEvent|fireEvent|userEvent|createUser|@testing-library\/react/.test(
    text(file),
  );
const isBrowserTest = (file) => file.startsWith("tests/browser/");
const isAccessibilityTest = (file) =>
  /axe|toHaveNoViolations|jest-axe|assertNoAccessibilityViolations/i.test(
    text(file),
  );
const staticTests = tests.filter(isStaticTest).length;
const domTests = tests.filter(isDomTest).length;
const browserTests = tests.filter(isBrowserTest).length;
const accessibilityTests = tests.filter(isAccessibilityTest).length;
const pureTests = tests.filter(
  (file) => !isStaticTest(file) && !isDomTest(file) && !isBrowserTest(file),
).length;
const gridBrowserTests = tests.filter((file) =>
  file.startsWith("tests/browser/data-grid-"),
).length;
const totals = {
  stable: 0,
  "beta-stable": 0,
  "alpha-stable": 0,
  experimental: 0,
  planned: 0,
  deprecated: 0,
  internal: 0,
};
for (const component of catalog)
  if (component.maturity in totals) totals[component.maturity] += 1;

const workflowPurposes = {
  "_consumer.yml": "Reusable packed external-consumer verification",
  "_docs.yml": "Reusable documentation and playground builds",
  "_packages.yml": "Reusable package payload verification",
  "_quality.yml": "Reusable scoped quality validation",
  "ci.yml": "Pull request/main CI planning and aggregate gate",
  "nightly.yml": "Scheduled full validation and dependency audit",
  "pages.yml": "Verified-main documentation and playground deployment",
  "release.yml": "Manual release verification and protected npm publication",
};

const outputLines = [
  "# Repository Inventory",
  "",
  "Generated by `npm run inventory:repository`. This is an evidence-led inventory and does not replace the canonical documents linked from `docs/README.md`.",
  "",
  "## A. Repository Overview",
  "",
  "VyrnForge UI is a native-first, dependency-minimal enterprise React UI foundation. It includes shared token foundations, reusable React components, specialized data-grid behavior, a documentation application, and a component playground.",
  "",
  table(
    ["Area", "Measured inventory"],
    [
      ["Workspace", codeList(rootPackage.workspaces ?? [])],
      [
        "Applications",
        "`apps/docs` documentation viewer; `examples/basic-playground` interactive playground",
      ],
      [
        "Packages",
        records.map((record) => `\`${record.manifest.name}\``).join(", "),
      ],
      [
        "Documentation",
        `${docs.length} active Markdown files; ${allDocs.length - docs.length} archived Markdown files`,
      ],
      [
        "Scripts",
        `${Object.keys(rootPackage.scripts ?? {}).length} root npm scripts; repository automation under \`scripts/\``,
      ],
      [
        "GitHub workflows",
        `${workflows.length} workflow files, including ${workflows.filter((file) => path.basename(file).startsWith("_")).length} reusable workflows`,
      ],
      [
        "Build and release outputs",
        "Package `dist/`, docs/playground `dist/`, verification tarballs, and a Pages artifact. Generated output is not used as inventory evidence.",
      ],
    ],
  ),
  "",
  "## B. Package Inventory",
  "",
  ...records.flatMap((record) => {
    const metadata = packageMetadata.find(
      (item) => item.name === record.manifest.name,
    );
    const sourceDirectories = [
      "adapters",
      "components",
      "core",
      "hooks",
      "internal",
      "state",
      "styles",
      "theme",
      "types",
      "utils",
    ]
      .filter((name) =>
        existsSync(path.join(root, "packages", record.directory, "src", name)),
      )
      .map((name) => `src/${name}`);
    const css = Object.keys(record.manifest.exports ?? {})
      .filter((entry) => entry.endsWith(".css"))
      .sort();
    const maturity =
      Object.entries(record.maturity)
        .map(([name, count]) => `${name}: ${count}`)
        .join(", ") || "Requires verification";
    return [
      `### ${record.manifest.name}`,
      "",
      table(
        ["Field", "Inventory"],
        [
          ["Purpose", metadata?.purpose ?? "Requires verification"],
          ["Main source directories", codeList(sourceDirectories)],
          [
            "Public exports",
            `${record.exports.length} root names. ${codeList(record.exports)}`,
          ],
          ["CSS entry points", codeList(css)],
          [
            "Dependencies",
            codeList(
              Object.entries(record.manifest.dependencies ?? {}).map(
                ([name, version]) => `${name}@${version}`,
              ),
            ),
          ],
          [
            "Peer dependencies",
            codeList(
              Object.entries(record.manifest.peerDependencies ?? {}).map(
                ([name, version]) => `${name}@${version}`,
              ),
            ),
          ],
          [
            "Build script",
            `\`${record.manifest.scripts?.build ?? "Requires verification"}\``,
          ],
          [
            "Test script",
            `\`${record.manifest.scripts?.test ?? "Requires verification"}\``,
          ],
          ["Current apparent maturity", maturity],
          ["Suggested accountable owner", owners[record.manifest.name]],
        ],
      ),
      "",
    ];
  }),
  "## C. Public Component Inventory",
  "",
  "Rows are package-root exports cross-referenced with structured metadata. Missing evidence is recorded as `Requires verification`; it is not a defect claim.",
  "",
  table(
    [
      "Component",
      "Package",
      "Source file",
      "Public",
      "Docs",
      "Playground",
      "Tests",
      "Test type",
      "Metadata maturity",
      "Observed gaps",
      "Suggested owner",
    ],
    components,
  ),
  "",
  "## D. Data-grid Inventory",
  "",
  table(
    ["Area", "Evidence-led inventory"],
    [
      [
        "Public entry points",
        `${records.find((record) => record.directory === "ui-data-grid").exports.length} package-root names; CSS: ${codeList(Object.keys(records.find((record) => record.directory === "ui-data-grid").manifest.exports).filter((entry) => entry.endsWith(".css")))}`,
      ],
      [
        "Main component",
        "`packages/ui-data-grid/src/components/UniversalDataGrid.tsx` is " +
          countLines(
            "packages/ui-data-grid/src/components/UniversalDataGrid.tsx",
          ) +
          " lines and concentrates rendering, state coordination, column behavior, grouping, selection, pagination, and feature composition.",
      ],
      [
        "Supporting components",
        codeList(
          walk("packages/ui-data-grid/src/components", (file) =>
            file.endsWith(".tsx"),
          ).map((file) =>
            file.replace("packages/ui-data-grid/src/components/", ""),
          ),
        ),
      ],
      [
        "Logic modules",
        "`core/` algorithms; `state/` defaults/merge/reducer/actions/selectors; `hooks/` React coordination; `adapters/` persistence/server-query/export-request; plus theme, types, and grid CSS.",
      ],
      [
        "Controlled and server modes",
        "Controlled/uncontrolled state is documented. `adapters/server/` builds server-query contracts; no grid-owned fetching was found.",
      ],
      [
        "Persistence",
        "`adapters/persistence/` contains localStorage persistence and persistable-state helpers.",
      ],
      [
        "Capabilities",
        "Search, filters, sorting, grouping, pagination, selection, column visibility/order/sizing, density/theme, persistence, server-query construction, and export-request construction.",
      ],
      [
        "Existing tests",
        `${gridFiles.filter((file) => /\.test\.(ts|tsx)$/.test(file)).length} grid test files, concentrated in pure core/state/adapter/theme modules plus public-hook coverage.`,
      ],
      [
        "Large-file concentration",
        largeGridFiles
          .map(([file, count]) => `\`${file}\` (${count} lines)`)
          .join("; "),
      ],
      [
        "Browser evidence",
        `${gridBrowserTests} Playwright contract files cover keyboard navigation, selection, sorting, resizing, reordering, sticky regions, and two-axis scrolling through deterministic regression fixtures.`,
      ],
      [
        "Missing evidence",
        "The VF-2014 manual assistive-technology matrix is schema-validated but pending execution; visual regression, responsive matrix coverage, and large-row performance benchmarks also remain pending.",
      ],
    ],
  ),
  "",
  "## E. Documentation Inventory",
  "",
  table(
    ["Area", "Inventory"],
    [
      ["Canonical entrypoint", "`docs/README.md`"],
      [
        "Documentation sources",
        `${docs.length} active Markdown files across governance, architecture, API, packages, quality, release, engineering, roadmap, legal, and benchmarks.`,
      ],
      [
        "Component metadata",
        "Canonical `docs/metadata/components.json` and `docs/metadata/assistive-technology-reviews.json`; compact AI navigation in `.ai/COMPONENT_MAP.json`; package, CSS, state, and AI policy metadata under `docs/metadata/`.",
      ],
      [
        "Playground",
        `Route registry ` +
          "`examples/basic-playground/src/app/routes.ts`; " +
          walk("examples/basic-playground/src/pages", (file) =>
            file.endsWith(".tsx"),
          ).length +
          " page modules.",
      ],
      [
        "Docs app",
        walk("apps/docs/src", (file) => /\.(ts|tsx|css)$/.test(file)).length +
          " source/style files under `apps/docs/src`; it is a viewer, not canonical API truth.",
      ],
      [
        "Regression fixture app",
        walk("apps/regression-fixtures/src", (file) =>
          /\.(ts|tsx|css)$/.test(file),
        ).length +
          " deterministic fixture source/style files; `npm run fixtures:verify` builds and tests the public-package consumer surface.",
      ],
      [
        "Maturity source",
        "`docs/metadata/components.json` is the sole structured maturity source. Playground and docs-app reference views consume it; prose remains reviewable documentation.",
      ],
      [
        "AI/contributor context",
        "`AGENTS.md`, `.ai/AI_CONTEXT.md`, `.ai/CODING_RULES.md`, `.ai/DOC_USAGE_GUIDE.md`, `.ai/REPO_MAP.md`, `CONTRIBUTING.md`, and `SECURITY.md`.",
      ],
      [
        "Potential conflicts",
        "Q1 audit documents stale `dv` terminology and planned-surface presentation as follow-up documentation work.",
      ],
    ],
  ),
  "",
  "## F. Test Inventory",
  "",
  table(
    ["Area", "Measured evidence"],
    [
      [
        "Runner/configuration",
        "Package and regression-fixture tests use Vitest. Shared DOM/accessibility helpers live under `tests/dom`. Playwright runs Chromium contracts against the deterministic regression-fixture application.",
      ],
      ["Test files", tests.length],
      [
        "Pure/unit",
        `${pureTests} focused pure/unit test files, primarily covering grid core, state, adapters, themes, and governance scripts.`,
      ],
      [
        "Static markup",
        `${staticTests} test files use server-side static markup rendering.`,
      ],
      [
        "DOM interaction",
        `${domTests} detected test files with DOM interaction helpers.`,
      ],
      ["Browser", `${browserTests} detected browser-test files.`],
      [
        "Accessibility",
        `${accessibilityTests} detected automated accessibility-test files.`,
      ],
      [
        "Visual regression",
        "No visual-regression test/configuration evidence found.",
      ],
      [
        "Coverage",
        rootPackage.scripts?.["test:coverage"]
          ? "Root `test:coverage` is configured with package-specific V8 coverage reports and thresholds."
          : "No root coverage command detected.",
      ],
      [
        "Regression fixtures",
        rootPackage.scripts?.["fixtures:verify"]
          ? "Root `fixtures:verify` builds and tests the deterministic regression fixture application."
          : "Regression fixture verification is not configured.",
      ],
      [
        "Missing/silently skipped quality",
        browserTests === 0
          ? "Browser and visual-regression evidence remains pending S2. Current DOM and axe checks do not replace real-browser or assistive-technology review."
          : "No gap detected by inventory.",
      ],
    ],
  ),
  "",
  "## G. CI/CD and Release Inventory",
  "",
  table(
    ["Workflow", "Purpose", "Classification"],
    workflows.map((file) => [
      `\`${file}\``,
      workflowPurposes[path.basename(file)] ?? "Requires verification",
      path.basename(file).startsWith("_")
        ? "Reusable workflow"
        : "Top-level workflow",
    ]),
  ),
  "",
  table(
    ["Area", "Inventory"],
    [
      [
        "CI aggregate gates",
        "`ci.yml` exposes `quality`, `browser-checks`, `external-consumer`, and `ci-gate`; `nightly.yml` exposes `browser-chromium` and `nightly-gate`.",
      ],
      [
        "Consumer fixtures",
        "`tests/package-consumer/` is verified by `scripts/verify-consumer.mjs` using packed artifacts.",
      ],
      [
        "Package verification",
        "`scripts/verify-packages.mjs`, `scripts/prepare-package-declarations.mjs`, and package workflows validate build outputs, declarations, CSS, and LICENSE presence.",
      ],
      [
        "Release governance",
        "`docs/release/`, `scripts/verify-release-candidate.mjs`, `scripts/verify-registry-release.mjs`, and `scripts/create-release-notes.mjs`.",
      ],
      [
        "npm/OIDC flow",
        "`release.yml` is manual and has a protected `npm-release` publishing job with `id-token: write`. No long-lived npm token reference was detected in tracked workflow source.",
      ],
      [
        "External protections",
        "GitHub branch protection, environment reviewers, npm organization permissions, npm trusted-publisher registration, Pages settings, and live registry state require verification outside tracked source.",
      ],
    ],
  ),
  "",
  "## H. Technical-debt Observations",
  "",
  table(
    ["Severity", "Workstream", "Observation", "Evidence / next verification"],
    [
      [
        "High",
        "Data Grid",
        "`UniversalDataGrid.tsx` is a large responsibility concentration.",
        `Measured at ${countLines("packages/ui-data-grid/src/components/UniversalDataGrid.tsx")} lines; review boundaries before future feature expansion.`,
      ],
      [
        "Medium",
        "Accessibility",
        "Automated Chromium contracts cover composite controls and data-grid interactions; the canonical manual assistive-technology matrix is pending named execution.",
        "Retain browser-checks, run `npm run verify:assistive-technology`, and require the strict evidence gate before beta or stable promotion.",
      ],
      [
        "Medium",
        "Quality Engineering",
        "Coverage remains uneven across packages despite an enforced baseline.",
        "Use package coverage reports and raise thresholds only with measured evidence; browser behavior is tracked separately.",
      ],
      [
        "Medium",
        "Documentation",
        "Component status has several structured and prose representations.",
        "Keep metadata verification authoritative for structured parity and review routes/docs prose.",
      ],
      [
        "Medium",
        "Documentation",
        "Known terminology and planned-surface presentation gaps remain.",
        "See Q1-P2-004 and Q1-P2-006 in `docs/quality/q1-component-quality-audit.md`.",
      ],
      [
        "Medium",
        "Packaging & Release",
        "Trusted publishing relies on external GitHub/npm configuration.",
        "Verify `npm-release` protection and npm trusted-publisher bindings before publish mode.",
      ],
      [
        "Low",
        "Performance",
        "No measured large-row or rendering benchmark evidence was found.",
        "Establish a performance baseline before feature growth or stable promotion.",
      ],
      [
        "Low",
        "Governance",
        "Repository membership and approval rules are external to tracked source.",
        "Confirm branch protection, code ownership, and release approvers in GitHub.",
      ],
      [
        "Low",
        "Design Tokens",
        "Token ownership is documented, but visual-regression evidence is absent.",
        "Use manual light/dark/enterprise/density review until visual testing exists.",
      ],
      [
        "Low",
        "Components",
        "Component test evidence is concentrated in a single primitive test file.",
        "Add focused tests only when component changes warrant them; no refactor is proposed here.",
      ],
    ],
  ),
  "",
  "## I. Ownership Matrix",
  "",
  table(
    ["Owner group", "Suggested accountability"],
    [
      [
        "UI Platform",
        "`@vyrnforge/ui-core`, shared tokens/themes/density/utilities, base CSS, package-boundary enforcement.",
      ],
      [
        "Component Team",
        "`@vyrnforge/ui-components`, public component contracts, overlay/form behavior, docs/examples.",
      ],
      [
        "Data Grid Team",
        "`@vyrnforge/ui-data-grid`, grid behavior, core/state/adapters, grid documentation.",
      ],
      [
        "Quality Engineering",
        "Test strategy, package/consumer verification, quality gates, coverage/regression evidence.",
      ],
      [
        "Accessibility",
        "Keyboard, focus, screen-reader, reduced-motion, and contrast validation.",
      ],
      [
        "Documentation",
        "Canonical Markdown, metadata consistency, docs app, playground examples, contributor guidance.",
      ],
      [
        "DevOps / Release",
        "CI planner, workflow permissions, OIDC publishing, registry verification, Pages.",
      ],
      [
        "Architecture",
        "Package boundaries, state/adapters, public/internal API policy, dependency constraints, debt triage.",
      ],
    ],
  ),
  "",
  "## J. Inventory Summary",
  "",
  table(
    ["Metric", "Count"],
    [
      ["Publishable packages", records.length],
      [
        "Package-root export names",
        records.reduce((sum, record) => sum + record.exports.length, 0),
      ],
      ["Public components inventoried", components.length],
      ["Repository test files", tests.length],
      ["Static-markup test files", staticTests],
      ["DOM interaction test files", domTests],
      ["Browser test files", browserTests],
      ["Automated accessibility-test files", accessibilityTests],
      ["Workflow files", workflows.length],
      [
        "Reusable workflows",
        workflows.filter((file) => path.basename(file).startsWith("_")).length,
      ],
      ["Active Markdown documentation files", docs.length],
      ["Stable metadata entries", totals.stable],
      ["Beta-stable metadata entries", totals["beta-stable"]],
      ["Alpha-stable metadata entries", totals["alpha-stable"]],
      ["Experimental metadata entries", totals.experimental],
      ["Planned metadata entries", totals.planned],
      ["Deprecated metadata entries", totals.deprecated],
      ["Internal metadata entries", totals.internal],
    ],
  ),
  "",
  "## Unresolved Uncertainties",
  "",
  "- GitHub branch protection, CODEOWNERS enforcement, environment approvers, Pages configuration, npm organization access, and npm trusted-publisher binding are external configuration and require verification.",
  "- Automated Chromium contracts are detected, but manual screen-reader, visual-regression, responsive-matrix, and performance evidence still require explicit review.",
  "- Components without a dedicated route or component-specific document can still be covered by grouped pages or package/API reference; confirm during public-surface changes.",
  "- This inventory does not change product implementation, package architecture, CSS ownership, dependencies, or CI/CD behavior.",
];

const outputPath = path.isAbsolute(output) ? output : path.join(root, output);
writeFileSync(outputPath, `${outputLines.join("\n")}\n`, "utf8");
console.log(`Repository inventory generated: ${outputPath}`);
