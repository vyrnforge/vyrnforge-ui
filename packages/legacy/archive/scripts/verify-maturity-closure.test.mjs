import assert from "node:assert/strict";
import test from "node:test";

import { verifyMaturityClosure } from "./verify-maturity-closure.mjs";

const complete = (reference) => ({ status: "complete", reference });

function validCatalog() {
  return {
    components: [
      {
        id: "dialog",
        maturity: "experimental",
        evidence: { status: "pending" },
      },
    ],
    maturityEvidence: {
      transitionPolicy: {
        mode: "new-promotions-only",
        legacyUnverifiedEntries: [],
        closedBy: "VF-2015",
        closedToMaturity: "experimental",
        closedEntries: ["dialog"],
        closureRecord: "docs/metadata/component-schema.md",
      },
      entries: {
        dialog: {
          maturityState: "experimental",
          owner: complete("docs/metadata/components.json"),
          implementationLocation: complete(
            "packages/ui-components/src/components/Dialog/Dialog.tsx",
          ),
          documentationLocation: complete("docs/api/ui-components-api.md"),
        },
      },
    },
  };
}

test("accepts an explicit Experimental closure record", () => {
  assert.deepEqual(verifyMaturityClosure(validCatalog()), []);
});

test("rejects retained legacy exceptions", () => {
  const catalog = validCatalog();
  catalog.maturityEvidence.transitionPolicy.legacyUnverifiedEntries = [
    "dialog",
  ];

  assert(
    verifyMaturityClosure(catalog).some((failure) =>
      failure.includes("cannot retain legacy evidence exceptions"),
    ),
  );
});

test("rejects a restored unsupported stable label", () => {
  const catalog = validCatalog();
  catalog.components[0].maturity = "stable";

  assert(
    verifyMaturityClosure(catalog).some((failure) =>
      failure.includes("requires maturity 'experimental'"),
    ),
  );
});

test("requires auditable owner, implementation, and documentation evidence", () => {
  const catalog = validCatalog();
  delete catalog.maturityEvidence.entries.dialog.documentationLocation;

  assert(
    verifyMaturityClosure(catalog).some((failure) =>
      failure.includes("documentationLocation"),
    ),
  );
});
