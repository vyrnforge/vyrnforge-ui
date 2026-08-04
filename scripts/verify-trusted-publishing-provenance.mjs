import {
  readTrustedPublishingContract,
  verifyTrustedPublishingProvenanceContract,
} from "./trusted-publishing-provenance.mjs";

const contract = readTrustedPublishingContract();
const failures = verifyTrustedPublishingProvenanceContract({ contract });

if (failures.length > 0) {
  throw new Error(
    `BT-8007 trusted-publishing verification failed:\n- ${failures.join("\n- ")}`,
  );
}

console.log(
  `BT-8007 trusted-publishing contract passed for ${contract.packages.length} publishable packages; external evidence remains ${contract.externalEvidence.status}.`,
);
