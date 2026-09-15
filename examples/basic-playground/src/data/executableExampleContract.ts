import executableExamplesRaw from "../../../../docs/metadata/executable-examples.json?raw";

export type ExecutableExampleFrameworkId =
  "native-html" | "react" | "angular" | "vue";

export type ExecutableExampleEvidence = {
  fixtureId: string;
  directory: string;
  entrypoint: string;
  contractFile: string;
  verification: string[];
};

type ExecutableExampleContract = {
  schemaVersion: number;
  sourceOfTruth: string;
  frameworks: Record<ExecutableExampleFrameworkId, ExecutableExampleEvidence>;
};

const contract = JSON.parse(executableExamplesRaw) as ExecutableExampleContract;

if (contract.schemaVersion !== 1) {
  throw new Error("Unsupported VyrnForge executable example contract.");
}

export const executableExampleSourceOfTruth = contract.sourceOfTruth;
export const executableExamples = contract.frameworks;
