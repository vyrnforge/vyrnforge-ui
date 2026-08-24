import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

function replaceExact(path, before, after) {
  const text = readFileSync(path, "utf8");
  if (!text.includes(before)) {
    throw new Error(`${path}: expected cleanup marker not found`);
  }
  writeFileSync(path, text.replace(before, after));
}

replaceExact(
  ".github/workflows/_quality.yml",
  "      CI_SCOPE_FIXTURES: ${{ inputs.fixtures }}\n      CI_SCOPE_HISTORICAL_EVIDENCE: false\n",
  "      CI_SCOPE_FIXTURES: ${{ inputs.fixtures }}\n",
);

replaceExact(
  "scripts/verify-workflows.mjs",
  `assert(\n  read(".github/workflows/_quality.yml").includes(\n    "CI_SCOPE_HISTORICAL_EVIDENCE",\n  ),\n  "reusable quality workflow must pass historical evidence scope explicitly",\n);\n`,
  "",
);

replaceExact(
  "apps/docs/src/docsRegistry.ts",
  `    description:\n      "React, native HTML, Angular, and Vue fixture ownership and GMF4 evidence rules.",`,
  `    description:\n      "React, native HTML, Angular, and Vue fixture ownership and current support evidence.",`,
);
replaceExact(
  "apps/docs/src/docsRegistry.ts",
  `    title: "S4 Multi-Framework Architecture Evidence",`,
  `    title: "Multi-Framework Architecture Evidence",`,
);
replaceExact(
  "apps/docs/src/docsRegistry.ts",
  `    description:\n      "MF-4001 through MF-4008 evidence and the explicit GMF1 support-claim boundary.",\n    sourcePath: "docs/quality/s4-multi-framework-architecture.md",\n    aiPurpose:\n      "Use this to review what S4 proves and what remains deferred to later gates.",\n    tags: ["quality", "multi-framework", "s4", "evidence"],`,
  `    description:\n      "Current shared architecture, renderer boundaries, and framework-support evidence.",\n    sourcePath: "docs/quality/s4-multi-framework-architecture.md",\n    aiPurpose:\n      "Use this to review current multi-framework architecture evidence and support boundaries.",\n    tags: ["quality", "multi-framework", "evidence"],`,
);

writeFileSync(
  "docs/testing/multi-framework-consumer-fixtures.md",
  `# Multi-Framework Consumer Fixture Strategy\n\nThis document defines the current clean-consumer fixture strategy used to verify\nVyrnForge framework support from packed package artifacts.\n\n## Fixture locations\n\n\`\`\`text\ntests/consumers/react/\ntests/consumers/native-html/\ntests/consumers/angular/\ntests/consumers/vue/\n\`\`\`\n\n\`tests/consumers/manifest.json\` is the fixture registry.\n\n## Current support evidence\n\nReact and native HTML are first-class renderer surfaces. Angular and Vue are\nverified consumers of the shared native renderer while their dedicated\nfirst-class package cutovers remain governed by G12 and G13 respectively.\nAngular Forms and Vue \`v-model\` integration remain thin adapters over shared\nVyrnForge behavior and native-element contracts rather than independent\ncomponent implementations.\n\nCurrent evidence includes clean packed installation, strict type checking,\nproduction builds, Chromium interaction, canonical property/event/slot\nbehavior, native form participation, framework adapters, SSR/bundler checks,\ncross-framework browser coverage, automated accessibility coverage, reviewed\nassistive-technology evidence, and migration guidance. The data grid remains\noutside the non-grid beta release group.\n\n\`npm run verify:multi-framework\` verifies framework topology and fixture claims.\n\`npm run verify:consumer-foundations:runtime\` performs clean tarball\ninstallation, type checking, production builds, and Chromium evidence for the\nnative HTML, React, Angular, and Vue fixtures. See\n\`docs/testing/consumer-foundation-contracts.md\`,\n\`docs/testing/angular-consumer-contract.md\`, and\n\`docs/testing/vue-consumer-contract.md\`.\n\n## Required consumer evidence\n\nEach supported consumer must prove:\n\n1. package installation from packed or published artifacts;\n2. production build;\n3. type checking;\n4. package import without premature DOM access;\n5. property and attribute handling;\n6. canonical events;\n7. slots and composition;\n8. themes and density;\n9. form participation where applicable;\n10. browser keyboard, focus, and accessibility scenarios.\n\n## React fixture\n\nThe React fixture covers both the first-class React package and explicit native\nelement registration. The React package remains the recommended React path.\n\n\`\`\`tsx\nimport { Button } from "@vyrnforge/ui-components";\n\`\`\`\n\n\`\`\`tsx\nimport "@vyrnforge/ui-elements/register";\n\n<vf-button variant="primary">Save</vf-button>;\n\`\`\`\n\n## Native HTML fixture\n\nThe no-framework fixture runs with browser APIs and VyrnForge package artifacts.\nIt proves that the native renderer does not carry a hidden React, Vue, or Angular\nruntime dependency.\n\n## Angular fixture\n\nThe Angular fixture verifies clean packed dependencies, Custom Element schema\nconfiguration, property and DOM-event binding, named Light DOM composition,\nnative form submission, production build, Chromium behavior, and the thin Forms\nadapter for reactive and template-driven integration.\n\n## Vue fixture\n\nThe Vue fixture verifies clean packed dependencies, \`vf-*\` compiler\nrecognition, DOM property binding, canonical DOM events, named Light DOM\ncomposition, native form submission, production Vite output, Chromium\ninteraction, and the thin \`v-model\` adapter.\n\n## CI ownership\n\nChanges under \`tests/consumers/\` require consumer and metadata verification.\nThe stable \`ci-gate\` aggregates every required result selected by the CI\nplanner.\n\nNo framework support claim comes from an example compiling locally. Current\nsupport levels are defined by versioned repository metadata and must be backed by\nthe corresponding clean-consumer, package, browser, accessibility, and release\nevidence.\n`,
);

writeFileSync(
  "docs/quality/s4-multi-framework-architecture.md",
  `# Multi-Framework Architecture Evidence\n\nThis file remains at its established path so existing documentation links stay\nstable. It now records current architecture evidence rather than a completed\nsprint or rollout gate.\n\n## Current architecture\n\nVyrnForge uses shared framework-neutral contracts, tokens, behavior foundations,\nmetadata, generation inputs, and accessibility expectations across its web\nsurfaces. Framework packages and integrations must adapt those foundations\nrather than become independent component libraries.\n\nCurrent implemented renderer/package boundaries are:\n\n- \`@vyrnforge/ui-core\`: framework-neutral design and styling foundation;\n- \`@vyrnforge/ui-behaviors\`: framework-neutral controllers and portable behavior;\n- \`@vyrnforge/ui-components\`: first-class React renderer;\n- \`@vyrnforge/ui-elements\`: first-class native HTML / Custom Elements renderer;\n- \`@vyrnforge/ui-data-grid\`: independent specialized React data-grid track.\n\nAngular and Vue currently consume the shared native renderer with verified\nframework-specific integration evidence. Their dedicated first-class package\ncutovers remain future work under G12 and G13 and must not be claimed as shipped\nuntil those gates pass.\n\n## Contract evidence\n\nThe repository enforces:\n\n- canonical component properties, events, slots, methods, and accessibility metadata;\n- namespaced bubbling/composed public events;\n- Light DOM and form-association policy for native elements;\n- package dependency boundaries and server-safe imports;\n- clean packed-consumer fixtures for React, native HTML, Angular, and Vue;\n- cross-framework browser and accessibility evidence;\n- generated framework artifacts and exception tracking;\n- release-group boundaries that keep the data grid independent from non-grid beta.\n\nRepresentative validation commands include:\n\n\`\`\`bash\nnpm run verify:multi-framework\nnpm run test:multi-framework\nnpm run verify:package-boundaries\nnpm run test:package-boundaries\nnpm run verify:consumer-foundations:runtime\nnpm run verify:generated-framework-artifacts\n\`\`\`\n\n## Current support boundary\n\nArchitecture capability and shipped framework support are separate claims.\nRepository metadata and release evidence are authoritative for the current\nsupport level of each framework surface. Future G11-G15 program gates remain\nactive requirements and are not historical rollout artifacts.\n`,
);

rmSync("docs/testing/gmf1-architecture-gate.md");

execFileSync("node", ["scripts/governance/generate-repository-inventory.mjs"], {
  stdio: "inherit",
});
execFileSync("npx", ["prettier", "--write", ".github/workflows/_quality.yml", "scripts/verify-workflows.mjs", "apps/docs/src/docsRegistry.ts", "docs/testing/multi-framework-consumer-fixtures.md", "docs/quality/s4-multi-framework-architecture.md", "docs/governance/repository-inventory.md"], {
  stdio: "inherit",
});

rmSync("scripts/post-rollout-cleanup.mjs");
rmSync(".github/workflows/_post-rollout-cleanup.yml");
