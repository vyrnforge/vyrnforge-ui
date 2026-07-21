const complete = (reference) => ({ status: "complete", reference });

const alphaEvidence = {
  maturityState: "alpha-stable",
  category: "form-control",
  browserEvidenceRequired: true,
  owner: complete("owners/component-team"),
  publicApiReview: complete("reviews/api"),
  publicExportVerification: complete("checks/exports"),
  logicUnitTests: complete("tests/unit"),
  domInteractionTests: complete("tests/dom"),
  browserTests: complete("tests/browser"),
  automatedAccessibility: complete("tests/a11y"),
  keyboardContract: complete("docs/keyboard"),
  lightThemeValidation: complete("tests/light"),
  darkThemeValidation: complete("tests/dark"),
  densityValidation: complete("tests/density"),
  documentation: complete("docs/component"),
  playgroundExample: complete("playground/component"),
  knownLimitations: complete("docs/limitations"),
};

function metadataFor(status, evidence) {
  return {
    catalog: {
      components: [
        {
          id: "component",
          maturity: status,
        },
      ],
      maturityEvidence: {
        schemaVersion: 2,
        transitionPolicy: {
          mode: "new-promotions-only",
          legacyUnverifiedEntries: [],
        },
        entries: { component: evidence },
      },
    },
  };
}

export const maturityFixtures = {
  alphaInteractiveWithoutDom: metadataFor(
    "alpha-stable",
    (() => {
      const evidence = { ...alphaEvidence };
      delete evidence.domInteractionTests;
      return evidence;
    })(),
  ),
  alphaNonInteractiveWithoutKeyboard: metadataFor("alpha-stable", {
    ...alphaEvidence,
    category: "primitive",
    browserEvidenceRequired: false,
    domInteractionTests: undefined,
    keyboardContract: undefined,
  }),
  betaWithoutConsumer: metadataFor("beta-stable", {
    ...alphaEvidence,
    maturityState: "beta-stable",
    consumingApplication: undefined,
    compatibilityEvidence: complete("tests/compatibility"),
    criticalDefects: { ...complete("defects/current"), unresolved: false },
    migrationInformation: {
      status: "not-applicable",
      rationale: "No experimental API changed.",
    },
  }),
  stableWithoutBrowserOrAccessibility: metadataFor("stable", {
    ...alphaEvidence,
    maturityState: "stable",
    browserTests: undefined,
    automatedAccessibility: undefined,
    consumingApplication: complete("consumers/app"),
    compatibilityEvidence: complete("tests/compatibility"),
    criticalDefects: { ...complete("defects/current"), unresolved: false },
    migrationInformation: {
      status: "not-applicable",
      rationale: "No experimental API changed.",
    },
    supportedBrowserEvidence: complete("browsers/matrix"),
    acceptedAccessibilityReview: complete("reviews/a11y"),
    releaseApiStability: complete("releases/history"),
    deprecationPolicyCompliance: complete("policy/deprecation"),
    maintainerCommitment: complete("owners/commitment"),
  }),
  deprecatedWithoutMigration: metadataFor("deprecated", {
    maturityState: "deprecated",
    category: "primitive",
    replacementOrReason: complete("docs/replacement"),
    deprecationVersion: complete("releases/1.0"),
    intendedRemovalWindow: complete("releases/2.0"),
  }),
  experimentalIncomplete: metadataFor("experimental", {
    maturityState: "experimental",
    category: "form-control",
    owner: complete("owners/component-team"),
    implementationLocation: complete("packages/ui/src/Component.tsx"),
    documentationLocation: complete("docs/components/component.md"),
  }),
};
